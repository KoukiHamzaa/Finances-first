// Characterisation tests for the Intigo enrichment loop, run against a mock
// fetch. They pin the current observable contract: batch size, cancellation,
// 401 handling, 429/5xx backoff, the 404 fallback path and the name cache.

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

const { enrichIntigoRows, progressStore, setCachedName, ENRICH_MAX_CONCURRENCY } =
  await import('../src/utils.js');

const V3 = (nid) => `https://api.intigo.net/api/v3/parcels/${nid}`;
const LEGACY = (nid) => `https://api.intigo.net/parcels/${nid}`;

// Builds a Response-alike. `json` is only called for ok/404-fallback responses.
const res = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => body,
});

const okParcel = (description, phone = '') =>
  res(200, { data: { description, client_phone: phone } });

// Records every call and answers from a handler.
function mockFetch(handler) {
  const calls = [];
  const impl = async (url, opts) => {
    calls.push({ url, opts });
    return handler(url, opts, calls.length);
  };
  return { impl, calls };
}

// Collects everything the loop reports back to the UI.
function harness(overrides = {}) {
  const batches = [];
  const errors = [];
  const health = [];
  let enriching = [];
  const ctx = {
    setIsEnriching: (v) => enriching.push(v),
    setEnrichProgress: () => {},
    setError: (m) => errors.push(m),
    setHealthStatus: (h) => health.push(h),
    onBatchResolved: (b) => batches.push(b),
    checkIsCancelled: () => false,
    ...overrides,
  };
  return { ctx, batches, errors, health, enriching };
}

// A row as parseIntigo would produce it.
const row = (nid, extra = {}) => ({
  id: nid,
  nid,
  city: 'Tunis',
  productName: 'جاري التحميل...',
  phone: '',
  totalSales: 0,
  status: 'in_progress',
  carrier: 'INTIGO',
  needsEnrichment: true,
  carrier_fee: 7,
  rule_fee: 0,
  fee_delta: null,
  moneyParseError: false,
  originalStatusText: '5000',
  ...extra,
});

// Every row of the last batch, keyed by id.
const flatten = (batches) => batches.flat();

beforeEach(() => {
  store.clear();
  progressStore.set({ current: 0, total: 0, errors: 0 });
});

describe('enrichIntigoRows concurrency', () => {
  // Every request takes `delayMs`, so overlapping requests are observable as a
  // peak above 1 and the wall clock is much shorter than the sequential total.
  const slowFetch = (delayMs) => {
    let live = 0;
    let peak = 0;
    const impl = async () => {
      live++;
      peak = Math.max(peak, live);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      live--;
      return okParcel('X');
    };
    return { impl, peak: () => peak };
  };

  test('runs several requests at once instead of one at a time', async () => {
    const f = slowFetch(20);
    globalThis.fetch = f.impl;
    const { ctx } = harness();
    const rows = 'ABCDEFGHIJ'.split('').map((nid) => row(nid));

    await enrichIntigoRows(rows, 'key', 0, ctx);

    assert.ok(f.peak() > 1, `expected overlapping requests, peak was ${f.peak()}`);
    assert.equal(
      f.peak(),
      ENRICH_MAX_CONCURRENCY,
      'uses the whole pool, and no more'
    );
  });

  test('never exceeds the pool size even when rows are slow', async () => {
    const f = slowFetch(15);
    globalThis.fetch = f.impl;
    const { ctx } = harness();
    const rows = 'ABCDEFGHIJKLMNOPQRST'.split('').map((nid) => row(nid));

    await enrichIntigoRows(rows, 'key', 0, ctx);

    assert.ok(f.peak() <= ENRICH_MAX_CONCURRENCY, `peak was ${f.peak()}`);
  });

  test('a 429 storm still resolves every row and is counted', async () => {
    let served = 0;
    globalThis.fetch = mockFetch(() => {
      if (served++ < 3) return res(429, {});
      return okParcel('X');
    }).impl;
    const { ctx, batches } = harness();
    const rows = 'ABCDEFGH'.split('').map((nid) => row(nid));

    await enrichIntigoRows(rows, 'key', 0, ctx);

    assert.equal(flatten(batches).length, rows.length, 'no row is lost to the backoff');
    assert.ok(
      flatten(batches).every((r) => r.enrichState === 'fetched'),
      'rows that succeed after a 429 still read as fetched'
    );
  });

  test('reports every row when the queue length is not a multiple of the batch size', async () => {
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const { ctx, batches } = harness();
    const rows = 'ABCDEFGHIJKLMNO'.split('').map((nid) => row(nid));

    await enrichIntigoRows(rows, 'key', 0, ctx);

    const reported = flatten(batches);
    assert.equal(reported.length, rows.length);
    assert.deepEqual(
      [...new Set(reported.map((r) => r.nid))].sort(),
      rows.map((r) => r.nid).sort(),
      'no row is lost or duplicated across batches'
    );
    assert.equal(progressStore.get().current, rows.length);
  });

  test('asks the API once per NID when the same parcel repeats', async () => {
    const { impl, calls } = mockFetch(() => okParcel('Chemise'));
    globalThis.fetch = impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A'), row('A'), row('A')], 'key', 0, ctx);

    assert.equal(calls.length, 1, 'the duplicated NID is only fetched once');
    assert.equal(flatten(batches).length, 3, 'but every row still gets an outcome');
    assert.ok(flatten(batches).every((r) => r.productName === 'Chemise'));
  });

  test('does not overlap two requests for the same NID', async () => {
    const live = new Set();
    let overlapped = false;
    globalThis.fetch = async (url) => {
      if (live.has(url)) overlapped = true;
      live.add(url);
      await new Promise((resolve) => setTimeout(resolve, 10));
      live.delete(url);
      return okParcel('X');
    };
    const { ctx } = harness();

    await enrichIntigoRows([row('A'), row('A'), row('B')], 'key', 0, ctx);

    assert.equal(overlapped, false);
  });
});

describe('enrichIntigoRows', () => {
  test('fetches each row once and resolves it as fetched', async () => {
    const { impl, calls } = mockFetch(() => okParcel('Chemise', '+216 22 000 000'));
    globalThis.fetch = impl;
    const { ctx, batches, errors, enriching } = harness();

    await enrichIntigoRows([row('A'), row('B'), row('C')], 'key', 0, ctx);

    assert.equal(calls.length, 3, 'one request per row, no retries on success');
    assert.deepEqual(calls.map((c) => c.url), [V3('A'), V3('B'), V3('C')]);
    assert.deepEqual(errors, [], 'no error is surfaced');
    assert.deepEqual(enriching, [true, false], 'starts and stops the spinner');

    const done = flatten(batches);
    assert.equal(done.length, 3);
    assert.deepEqual(
      done.map((r) => [r.nid, r.enrichState, r.productName, r.hasError, r.needsEnrichment, r.phone]),
      [
        ['A', 'fetched', 'Chemise', false, false, '+216 22 000 000'],
        ['B', 'fetched', 'Chemise', false, false, '+216 22 000 000'],
        ['C', 'fetched', 'Chemise', false, false, '+216 22 000 000'],
      ]
    );
  });

  test('emits one batch per 10 rows and a final batch for the remainder', async () => {
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const rows = Array.from({ length: 25 }, (_, i) => row(`N${i}`));
    const { ctx, batches } = harness();

    await enrichIntigoRows(rows, 'key', 0, ctx);

    assert.deepEqual(batches.map((b) => b.length), [10, 10, 5]);
    assert.equal(flatten(batches).length, 25);
  });

  test('emits a single batch when there are fewer than 10 rows', async () => {
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(batches.length, 1);
  });

  test('reports progress through the shared store', async () => {
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const seen = [];
    progressStore.subscribe(() => seen.push({ ...progressStore.get() }));
    const { ctx } = harness();

    await enrichIntigoRows([row('A'), row('B')], 'key', 0, ctx);

    const last = seen[seen.length - 1];
    assert.equal(last.current, 2);
    assert.equal(last.total, 2);
    assert.equal(last.errors, 0);
  });

  test('serves a cached name without touching the network', async () => {
    setCachedName('A', { description: 'Nom en cache', phone: '22 111 111' });
    const { impl, calls } = mockFetch(() => okParcel('Jamais utilise'));
    globalThis.fetch = impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A'), row('B')], 'key', 0, ctx);

    assert.deepEqual(calls.map((c) => c.url), [V3('B')], 'A was served from cache');
    const done = flatten(batches);
    assert.equal(done[0].productName, 'Nom en cache');
    assert.equal(done[0].phone, '22 111 111');
    assert.equal(done[0].enrichState, 'fetched');
  });

  test('strips the GENERATED_NAME marker from the API name', async () => {
    globalThis.fetch = mockFetch(() => okParcel('[GENERATED_NAME] Robe')).impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(flatten(batches)[0].productName, 'Robe');
  });

  test('never overwrites a phone number the file already provided', async () => {
    globalThis.fetch = mockFetch(() => okParcel('Chemise', '22 999 999')).impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A', { phone: '22 000 000' })], 'key', 0, ctx);

    assert.equal(flatten(batches)[0].phone, '22 000 000');
  });

  test('falls back to the legacy endpoint when v3 answers 404', async () => {
    const { impl, calls } = mockFetch((url) =>
      url.includes('/api/v3/') ? res(404, {}) : res(200, { description: 'Nom depuis le fallback', phone: '22 555 555' })
    );
    globalThis.fetch = impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.deepEqual(calls.map((c) => c.url), [V3('A'), LEGACY('A')]);
    const resolved = flatten(batches)[0];
    assert.equal(resolved.enrichState, 'done');
    assert.equal(resolved.productName, 'Nom depuis le fallback');
    assert.equal(resolved.phone, '22 555 555');
  });

  test('marks the row as an error when the legacy fallback also 404s', async () => {
    globalThis.fetch = mockFetch(() => res(404, {})).impl;
    const { ctx, batches, errors } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    const done = flatten(batches)[0];
    assert.equal(done.enrichState, 'error');
    assert.equal(done.productName, 'لم يتم العثور عليه');
    assert.equal(done.hasError, true);
    assert.deepEqual(errors, [], 'a missing parcel is not surfaced as an app error');
  });

  test('reads the alternative name fields when description is unusable', async () => {
    const cases = [
      ['name', 'Nom B'],
      ['product_name', 'Nom C'],
      ['content', 'Nom D'],
      ['item_name', 'Nom E'],
    ];
    // A distinct NID per case, otherwise the previous answer comes from cache.
    for (const [field, value] of cases) {
      globalThis.fetch = mockFetch(() => res(200, { data: { [field]: value } })).impl;
      const { ctx, batches } = harness();
      await enrichIntigoRows([row(`NID-${field}`)], 'key', 0, ctx);
      assert.equal(flatten(batches)[0].productName, value, `should fall back to ${field}`);
    }
  });

  test('treats an unusable name as a failed fetch that can be retried', async () => {
    globalThis.fetch = mockFetch(() => res(200, { data: { description: 'colis' } })).impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    const done = flatten(batches)[0];
    assert.equal(done.enrichState, 'error');
    assert.equal(done.productName, 'خطأ في الجلب');
    assert.equal(done.hasError, true);
    assert.equal(done.needsEnrichment, true, 'the row stays retryable');
  });

  test('reports a placeholder name when the API returns nothing usable', async () => {
    globalThis.fetch = mockFetch((url) =>
      url.includes('/api/v3/') ? res(404, {}) : res(200, { description: 'colis' })
    ).impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(flatten(batches)[0].productName, 'بدون اسم (فارغ)');
  });

  test('a 401 halts the whole run and marks the rest as failed', async () => {
    const { impl, calls } = mockFetch(() => res(401, {}));
    globalThis.fetch = impl;
    const { ctx, batches, errors, health, enriching } = harness();

    await enrichIntigoRows([row('A'), row('B'), row('C')], 'key', 0, ctx);

    assert.ok(
      calls.length <= ENRICH_MAX_CONCURRENCY,
      `at most one in-flight wave before the run stops, made ${calls.length}`
    );
    assert.deepEqual(errors, ['مفتاح API غير صالح. يرجى التحقق من الإعدادات.']);
    assert.deepEqual(health, ['unauthorized']);
    assert.deepEqual(enriching, [true, false]);

    const done = flatten(batches);
    assert.equal(done.length, 3, 'the pending rows still get an outcome');
    const rejected = done.filter((r) => r.productName === 'مفتاح API غير صالح');
    const haltedEarly = done.filter((r) => r.productName === 'توقف بسبب خطأ في المفتاح');
    assert.ok(rejected.length >= 1, 'the row that got the 401 says so');
    assert.ok(
      rejected.length <= ENRICH_MAX_CONCURRENCY,
      `only the in-flight wave can be told apart, got ${rejected.length}`
    );
    assert.equal(rejected.length + haltedEarly.length, 3, 'every row is accounted for');
    assert.ok(done.every((r) => r.enrichState === 'error' && r.needsEnrichment === true));
  });

  test('retries a 429 up to three times then gives up', async () => {
    const { impl, calls } = mockFetch(() => res(429, {}));
    globalThis.fetch = impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(calls.length, 3, 'three attempts per row');
    assert.equal(flatten(batches)[0].enrichState, 'error');
    assert.equal(flatten(batches)[0].hasError, true);
  });

  test('succeeds on a retry after a 429', async () => {
    let attempt = 0;
    globalThis.fetch = mockFetch(() => (++attempt === 1 ? res(429, {}) : okParcel('Recuper'))).impl;
    const { ctx, batches, errors } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(attempt, 2);
    assert.equal(flatten(batches)[0].productName, 'Recuper');
    assert.deepEqual(errors, []);
  });

  test('retries a 5xx and counts it as an error', async () => {
    const { impl, calls } = mockFetch(() => res(503, {}));
    globalThis.fetch = impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(calls.length, 3);
    assert.equal(flatten(batches)[0].enrichState, 'error');
  });

  test('survives a thrown network error', async () => {
    let attempt = 0;
    globalThis.fetch = mockFetch(() => {
      if (++attempt <= 2) throw new TypeError('Failed to fetch');
      return okParcel('Bon');
    }).impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows([row('A')], 'key', 0, ctx);

    assert.equal(attempt, 3);
    assert.equal(flatten(batches)[0].productName, 'Bon');
  });

  test('skips rows that do not need enrichment', async () => {
    const { impl, calls } = mockFetch(() => okParcel('X'));
    globalThis.fetch = impl;
    const { ctx, batches } = harness();

    await enrichIntigoRows(
      [row('A', { needsEnrichment: false }), row('B'), row('C', { needsEnrichment: false })],
      'key',
      0,
      ctx
    );

    assert.deepEqual(calls.map((c) => c.url), [V3('B')], 'only the pending row is requested');
    // The lone pending row is now reported instead of being resolved and dropped.
    assert.deepEqual(flatten(batches).map((r) => r.nid), ['B']);
  });

  test('caches only names it managed to read', async () => {
    globalThis.fetch = mockFetch(() => okParcel('Bon nom')).impl;
    const { ctx } = harness();
    await enrichIntigoRows([row('A')], 'key', 0, ctx);
    assert.ok(store.has('intigo_nid_A'));
  });

  test('a cancelled run requests nothing', async () => {
    const { impl, calls } = mockFetch(() => okParcel('X'));
    globalThis.fetch = impl;
    const { ctx, batches } = harness({ checkIsCancelled: () => true });

    await enrichIntigoRows([row('A'), row('B')], 'key', 0, ctx);

    assert.equal(calls.length, 0);
    assert.deepEqual(batches, [], 'nothing is reported back');
  });

  test('a run cancelled mid-flight stops issuing further requests', async () => {
    let cancelled = false;
    const { impl, calls } = mockFetch(() => okParcel('X'));
    globalThis.fetch = impl;
    const { ctx } = harness({ checkIsCancelled: () => cancelled });

    const many = 'ABCDEFGHIJKLMN'.split('').map((nid) => row(nid));
    const promise = enrichIntigoRows(many, 'key', 0, ctx);
    setTimeout(() => { cancelled = true; }, 5);
    await promise;

    assert.ok(
      calls.length < many.length,
      `expected the pool to stop short of the queue, made ${calls.length} of ${many.length}`
    );
  });

  test('does not clear the spinner once cancelled', async () => {
    let cancelled = false;
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const { ctx, enriching } = harness({ checkIsCancelled: () => cancelled });

    const promise = enrichIntigoRows([row('A'), row('B'), row('C')], 'key', 0, ctx);
    setTimeout(() => { cancelled = true; }, 5);
    await promise;

    assert.deepEqual(enriching, [true], 'no setIsEnriching(false) after a cancel');
  });

  test('a cancelled run does not report its tail into the next session', async () => {
    let cancelled = false;
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const { ctx, batches } = harness({ checkIsCancelled: () => cancelled });

    // 3 rows resolve before the cancel lands, so there is a real tail to flush.
    const promise = enrichIntigoRows([row('A'), row('B'), row('C')], 'key', 0, ctx);
    setTimeout(() => { cancelled = true; }, 5);
    await promise;

    assert.deepEqual(batches, [], 'the stale run reports nothing');
  });

  test('a run superseded before it starts leaves the shared progress alone', async () => {
    const { impl, calls } = mockFetch(() => okParcel('X'));
    globalThis.fetch = impl;
    const { ctx, enriching } = harness({ checkIsCancelled: () => true });

    // What the replacement upload has already published.
    progressStore.set({ current: 42, total: 100, errors: 0 });

    await enrichIntigoRows([row('A'), row('B')], 'key', 0, ctx);

    assert.equal(calls.length, 0);
    assert.deepEqual(enriching, [], 'the stale run never claims the screen');
    assert.deepEqual(
      progressStore.get(),
      { current: 42, total: 100, errors: 0 },
      'the stale run must not reset the shared progress'
    );
  });

  test('a cancelled run leaves the progress of the next upload alone', async () => {
    let cancelled = false;
    globalThis.fetch = mockFetch(() => okParcel('X')).impl;
    const { ctx } = harness({ checkIsCancelled: () => cancelled });

    const promise = enrichIntigoRows([row('A'), row('B'), row('C')], 'key', 0, ctx);
    setTimeout(() => { cancelled = true; }, 5);
    // The replacement upload publishes while the stale run is still winding down.
    await promise;
    const afterStaleRun = { ...progressStore.get() };

    assert.notDeepEqual(
      afterStaleRun,
      { current: 0, total: 3, errors: 0 },
      'the stale run must not publish a final progress of its own'
    );
  });
});
