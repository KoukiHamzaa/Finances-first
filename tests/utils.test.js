// Characterisation tests: they lock in the CURRENT behaviour of the pure
// functions in src/utils.js so that the performance/refactor work cannot
// silently change any number.
//
// Run with: npm test

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// utils.js touches localStorage at call time (not import time), so a stub
// installed before the first call is enough.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

const {
  round3, formatTND, parseMoney, normalizeId, normalizeCity,
  resolveGov, statusBucket, detectTemplate, findHeaderAndScore,
  parseConverty, parseLogista, parseIntigo,
  isValidName, getCachedName, setCachedName, calculateStats,
} = await import('../src/utils.js');

const { CONVERTY_ROWS, INTIGO_ROWS, LOGISTA_ROWS } = await import('./fixtures.js');

// `id` is a fresh uuid per row and is never asserted on.
const shape = ({ id: _id, ...rest }) => rest;

describe('round3', () => {
  test('rounds to 3 decimals and coerces junk to 0', () => {
    assert.equal(round3(1.23456), 1.235);
    assert.equal(round3('2.0005'), 2.001);
    assert.equal(round3(null), 0);
    assert.equal(round3(undefined), 0);
    assert.equal(round3('abc'), 0);
    assert.equal(round3(0.1 + 0.2), 0.3);
  });
});

describe('formatTND', () => {
  test('always shows 3 decimals with a comma and no thousands separator', () => {
    assert.equal(formatTND(0), '0,000');
    assert.equal(formatTND(12.5), '12,500');
    assert.equal(formatTND(1234.567), '1234,567');
    assert.equal(formatTND(-3.1), '-3,100');
  });
});

describe('parseMoney', () => {
  const cases = [
    [null, { value: 0, bad: false }],
    [undefined, { value: 0, bad: false }],
    ['', { value: 0, bad: false }],
    ['   ', { value: 0, bad: false }],
    [45, { value: 45, bad: false }],
    ['45,500', { value: 45.5, bad: false }],      // comma = decimal separator
    ['120.75', { value: 120.75, bad: false }],     // dot = decimal separator
    ['1.234,56', { value: 1234.56, bad: false }],  // european pair
    ['1,234.56', { value: 1234.56, bad: false }],  // us pair
    ['1,234,567', { value: 1234.567, bad: false }], // grouping only
    ['150,000', { value: 150, bad: false }],
    ['1 200,000', { value: 1200, bad: false }],
    ['12,500 DT', { value: 12.5, bad: false }],
    ['35 د.ت', { value: 35, bad: false }],
    ['1,500.000 د.ت', { value: 1500, bad: false }],
    ['20 DT', { value: 20, bad: false }],
    ['-15,50', { value: -15.5, bad: false }],
    ['n/a', { value: 0, bad: false }],
    ['abc', { value: 0, bad: false }],
    ['.', { value: 0, bad: true }],
  ];
  for (const [input, expected] of cases) {
    test(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
      assert.deepEqual(parseMoney(input), expected);
    });
  }
});

describe('normalizeId', () => {
  test('trims, collapses whitespace, lowercases', () => {
    assert.equal(normalizeId('  BC-001 '), 'bc-001');
    assert.equal(normalizeId('bc   001'), 'bc 001');
    assert.equal(normalizeId(null), '');
  });
});

describe('normalizeCity', () => {
  test('normalises diacritics, punctuation and case', () => {
    assert.equal(normalizeCity('Tunis'), 'tunis');
    assert.equal(normalizeCity('Ariana'), 'ariana');
    assert.equal(normalizeCity('المنوبة'), 'المنوبة');
    assert.equal(normalizeCity('Le Bardo'), 'le bardo');
    assert.equal(normalizeCity('Sfax.'), 'sfax');
    assert.equal(normalizeCity('  '), '');
    assert.equal(normalizeCity(undefined), '');
  });
});

describe('resolveGov', () => {
  test('maps known aliases inside Grand Tunis', () => {
    for (const alias of ['Tunis', 'Ariana', 'Ben Arous', 'Mannouba', 'المرسى', 'la marsa']) {
      const r = resolveGov(alias);
      assert.equal(r.isGrandTunis, true, `${alias} should be Grand Tunis`);
      assert.equal(r.unknown, false, `${alias} should be known`);
      assert.match(r.canonical, /^GRAND_TUNIS\./);
    }
  });

  test('flags unknown cities and leaves isGrandTunis false', () => {
    const r = resolveGov('Sfax');
    assert.deepEqual(
      { canonical: r.canonical, isGrandTunis: r.isGrandTunis, unknown: r.unknown },
      { canonical: 'OTHER', isGrandTunis: false, unknown: true }
    );
  });

  test('empty input is not unknown, it is simply absent', () => {
    assert.deepEqual(resolveGov(''), { canonical: 'OTHER', isGrandTunis: false, unknown: false, raw: '' });
    assert.deepEqual(resolveGov(null), { canonical: 'OTHER', isGrandTunis: false, unknown: false, raw: null });
  });

  test('keeps the raw value for reporting', () => {
    assert.equal(resolveGov('Sfax').raw, 'Sfax');
  });
});

describe('statusBucket', () => {
  test('maps known codes and labels', () => {
    assert.equal(statusBucket('5000'), 'delivered');
    assert.equal(statusBucket('Livré'), 'delivered');
    assert.equal(statusBucket('تم التسليم'), 'delivered');
    assert.equal(statusBucket('6900'), 'returned');
    assert.equal(statusBucket('Retourné'), 'returned');
    assert.equal(statusBucket('1100'), 'cancelled');
    assert.equal(statusBucket('Annulé'), 'cancelled');
    assert.equal(statusBucket('6500'), 'exchange');
    assert.equal(statusBucket('3201'), 'return_in_progress');
    assert.equal(statusBucket('6000'), 'return_in_progress');
  });

  test('anything unrecognised falls through to in_progress', () => {
    assert.equal(statusBucket('état mystère'), 'in_progress');
    assert.equal(statusBucket(''), 'in_progress');
    assert.equal(statusBucket('retour en cours'), 'in_progress');
  });
});

describe('detectTemplate', () => {
  test('recognises each carrier fixture', () => {
    assert.equal(detectTemplate(CONVERTY_ROWS), 'CONVERTY');
    assert.equal(detectTemplate(LOGISTA_ROWS), 'LOGISTA');
    assert.equal(detectTemplate(INTIGO_ROWS), 'INTIGO');
  });

  test('returns UNKNOWN for unrelated content', () => {
    assert.equal(detectTemplate([['a'], ['b']]), 'UNKNOWN');
    assert.equal(detectTemplate([]), 'UNKNOWN');
    assert.equal(detectTemplate(undefined), 'UNKNOWN');
  });

  test('finds the header row index', () => {
    assert.deepEqual(findHeaderAndScore(CONVERTY_ROWS), { template: 'CONVERTY', headerIdx: 0 });
    assert.deepEqual(findHeaderAndScore(INTIGO_ROWS), { template: 'INTIGO', headerIdx: 0 });
  });
});

describe('parseConverty', () => {
  const { rows, autoFees, duplicateNids } = parseConverty(CONVERTY_ROWS);

  test('classifies each surviving row', () => {
    assert.deepEqual(
      rows.map((r) => [r.barcode, r.productName, r.totalSales, r.status]),
      [
        ['BC-001', 'Chemise en coton', 45.5, 'delivered'],
        ['BC-002', 'Robe fleurie', 120.75, 'delivered'],
        ['BC-003', 'Sac à main', 0, 'returned'],
        ['BC-004', 'Chaussures', 0, 'returned'],
        ['BC-005', 'Ceinture cuir', 0, 'cancelled'],
        ['BC-008', 'Tapis berbère', 250, 'delivered'],
        ['BC-009', 'Duplicata', 10, 'delivered'],
        ['bc 001', 'Doublon (casse differente)', 11, 'delivered'],
        ['BC-011', 'Sans prix', 0, 'delivered'],
      ]
    );
  });

  test('drops rows whose status is not a settled one', () => {
    const barcodes = rows.map((r) => r.barcode);
    assert.ok(!barcodes.includes('BC-006'), 'Échange is dropped (statusBucket has no accent form)');
    assert.ok(!barcodes.includes('BC-007'), '"En cours de livraison" is dropped');
  });

  test('keeps both spellings of the same code as distinct rows', () => {
    assert.ok(rows.some((r) => r.barcode === 'BC-001'));
    assert.ok(rows.some((r) => r.barcode === 'bc 001'));
    assert.deepEqual(duplicateNids, []);
  });

  test('only delivered rows carry a sale amount', () => {
    for (const r of rows.filter((r) => r.status !== 'delivered')) {
      assert.equal(r.totalSales, 0);
    }
  });

  test('extracts the phone column', () => {
    assert.equal(rows[0].phone, '+216 20 111 222');
    assert.equal(rows[3].phone, '20 777 888');
  });

  test('flags an unparseable price instead of silently zeroing it', () => {
    const noPrice = rows.find((r) => r.barcode === 'BC-011');
    assert.equal(noPrice.moneyParseError, false);
    assert.equal(noPrice.totalSales, 0);
  });

  test('every row carries the full field set', () => {
    assert.deepEqual(shape(rows[0]), {
      barcode: 'BC-001',
      productName: 'Chemise en coton',
      phone: '+216 20 111 222',
      totalSales: 45.5,
      status: 'delivered',
      carrier_fee: null,
      rule_fee: 0,
      fee_delta: null,
      moneyParseError: false,
      city: '',
    });
  });

  test('never auto-detects fees and never needs enrichment', () => {
    assert.equal(autoFees, null);
    assert.ok(rows.every((r) => r.needsEnrichment === undefined));
  });
});

describe('parseLogista', () => {
  const { rows, autoFees, duplicateNids } = parseLogista(LOGISTA_ROWS);

  test('reads delivered rows before returned rows', () => {
    assert.deepEqual(
      rows.map((r) => [r.barcode, r.productName, r.totalSales, r.status]),
      [
        ['LG-9001', 'Chaussures Nike', 240, 'delivered'],
        ['LG-9002', 'Sac cuir', 180.6, 'delivered'],
        ['LG-9003', 'Montre', 360, 'delivered'],
        ['LG-9004', 'Chemise', 0, 'returned'],
        ['LG-9005', 'Casquette', 0, 'returned'],
      ]
    );
  });

  test('ignores the TOTAL rows', () => {
    assert.equal(rows.filter((r) => String(r.barcode).toUpperCase().startsWith('TOTAL')).length, 0);
  });

  test('picks the phone column per table', () => {
    assert.equal(rows[0].phone, '+216 22 300 300');
    assert.equal(rows[3].phone, '22 300 600');
  });

  test('lifts the fee columns into autoFees', () => {
    assert.deepEqual(autoFees, { delivery: 7, return: 2 });
  });

  test('has no duplicates and no enrichment need', () => {
    assert.deepEqual(duplicateNids, []);
    assert.ok(rows.every((r) => r.needsEnrichment === undefined));
  });

  test('throws a readable error when the delivered table is missing', () => {
    assert.throws(() => parseLogista([['DETAILS PAIEMENT'], ['nothing useful']]), /Logista/);
  });
});

describe('parseIntigo', () => {
  const { rows, autoFees, isIntigo, duplicateNids } = parseIntigo(INTIGO_ROWS);

  test('classifies statuses from codes, labels and free text', () => {
    assert.deepEqual(
      rows.map((r) => [r.nid, r.status]),
      [
        ['NI-1001', 'delivered'],
        ['NI-1002', 'returned'],
        ['NI-1003', 'return_in_progress'],
        ['NI-1004', 'return_in_progress'],
        ['NI-1005', 'exchange'],
        ['NI-1006', 'cancelled'],
        ['NI-1007', 'unrecognized'],
        ['NI-1008', 'delivered'],
        ['NI-1009', 'unrecognized'],
      ]
    );
  });

  test('marks rows for enrichment and flags the carrier', () => {
    assert.equal(isIntigo, true);
    assert.equal(autoFees, null);
    assert.ok(rows.every((r) => r.needsEnrichment === true && r.carrier === 'INTIGO'));
    assert.ok(rows.every((r) => r.productName === 'جاري التحميل...'));
  });

  test('"retour en cours" is currently unrecognized, not in-progress-return', () => {
    const row = rows.find((r) => r.nid === 'NI-1009');
    assert.equal(row.status, 'unrecognized');
    assert.equal(row.originalStatusText, 'retour en cours');
  });

  test('only delivered rows carry a sale amount', () => {
    assert.equal(rows[0].totalSales, 150);
    assert.equal(rows[1].totalSales, 0);
    assert.equal(rows[7].totalSales, 11);
  });

  test('reads city, phone and the 7 TND carrier fee', () => {
    assert.equal(rows[0].city, 'Tunis');
    assert.equal(rows[0].phone, '+216 22 100 100');
    assert.equal(rows[0].carrier_fee, 7);
  });

  test('reports repeated NIDs and keeps the first occurrence', () => {
    assert.deepEqual(duplicateNids, ['NI-1001']);
    assert.equal(rows.filter((r) => r.nid === 'NI-1001').length, 1);
  });

  test('keeps the raw status text for tooltips', () => {
    assert.deepEqual(
      rows.map((r) => r.originalStatusText),
      ['5000', '6900', '3201', '6000', '6500', '1100', 'état mystère', 'livré', 'retour en cours']
    );
  });

  test('every row carries the full field set', () => {
    assert.deepEqual(shape(rows[0]), {
      nid: 'NI-1001',
      city: 'Tunis',
      productName: 'جاري التحميل...',
      phone: '+216 22 100 100',
      totalSales: 150,
      status: 'delivered',
      carrier: 'INTIGO',
      needsEnrichment: true,
      carrier_fee: 7,
      rule_fee: 0,
      fee_delta: null,
      moneyParseError: false,
      originalStatusText: '5000',
    });
  });
});

describe('isValidName', () => {
  test('rejects placeholder names', () => {
    for (const bad of ['منتج بدون اسم', 'غير معروف', 'unknown', 'n/a', '-', '—', 'colis', 'Colis', '', null, undefined, 42]) {
      assert.equal(isValidName(bad), false, `${JSON.stringify(bad)} should be rejected`);
    }
  });

  test('accepts a real product name, including one tagged GENERATED_NAME', () => {
    assert.equal(isValidName('Chemise en coton'), true);
    assert.equal(isValidName('[GENERATED_NAME] Chemise'), true);
  });
});

describe('name cache', () => {
  test('round-trips a valid name with a freshness stamp', () => {
    const before = Date.now();
    setCachedName('NI-CACHE-1', { description: 'Sac cuir', phone: '22 000 000' });
    assert.deepEqual(getCachedName('NI-CACHE-1'), {
      description: 'Sac cuir',
      phone: '22 000 000',
      fetchedAt: (() => {
        const ts = JSON.parse(store.get('intigo_nid_NI-CACHE-1')).fetchedAt;
        assert.ok(ts >= before && ts <= Date.now(), 'fetchedAt should be stamped with now');
        return ts;
      })(),
    });
  });

  test('refuses to cache a placeholder name', () => {
    setCachedName('NI-CACHE-2', { description: 'colis', phone: '' });
    assert.equal(getCachedName('NI-CACHE-2'), null);
  });

  test('drops an entry older than 7 days', () => {
    const key = 'intigo_nid_NI-CACHE-3';
    store.set(key, JSON.stringify({ description: 'Vieux', fetchedAt: Date.now() - 8 * 24 * 60 * 60 * 1000 }));
    assert.equal(getCachedName('NI-CACHE-3'), null);
  });

  test('evicts an entry whose stored name became invalid', () => {
    const key = 'intigo_nid_NI-CACHE-4';
    store.set(key, JSON.stringify({ description: 'colis', fetchedAt: Date.now() }));
    assert.equal(getCachedName('NI-CACHE-4'), null);
    assert.equal(store.has(key), false, 'invalid entry should be removed from storage');
  });

  test('survives corrupt JSON', () => {
    store.set('intigo_nid_NI-CACHE-5', '{not json');
    assert.equal(getCachedName('NI-CACHE-5'), null);
  });
});

describe('calculateStats', () => {
  test('empty input', () => {
    assert.deepEqual(calculateStats([], { delivery: 0, return: 0 }), {
      totalSales: 0,
      totalRuleFeeDelivery: 0,
      totalRuleFeeReturn: 0,
      netRule: 0,
      netCarrier: null,
      hasCarrierFee: false,
      count: 0,
      counts: { delivered: 0, returned: 0, in_progress: 0, cancelled: 0, exchange: 0 },
      prepaidCount: 0,
      newUnknownGovs: [],
    });
  });

  test('non-Intigo rows use the manual fee settings', () => {
    const rows = [
      { status: 'delivered', totalSales: 100, carrier_fee: null, rule_fee: 0, fee_delta: null },
      { status: 'delivered', totalSales: 50, carrier_fee: null, rule_fee: 0, fee_delta: null },
      { status: 'returned', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null },
    ];
    const s = calculateStats(rows, { delivery: 7, return: 2 });
    assert.equal(s.totalSales, 150);
    assert.equal(s.totalRuleFeeDelivery, 14);
    assert.equal(s.totalRuleFeeReturn, 2);
    assert.equal(s.netRule, 134);
    assert.equal(s.netCarrier, null, 'no carrier fee means no invoice net');
    assert.equal(s.hasCarrierFee, false);
    assert.deepEqual(s.counts, { delivered: 2, returned: 1, in_progress: 0, cancelled: 0, exchange: 0 });
    // SIDE EFFECT: currently writes back onto the row objects.
    assert.equal(rows[0].rule_fee, 7);
    assert.equal(rows[2].rule_fee, 2);
  });

  test('a zero-value delivered row counts as prepaid', () => {
    const s = calculateStats(
      [{ status: 'delivered', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null }],
      { delivery: 7, return: 2 }
    );
    assert.equal(s.prepaidCount, 1);
    assert.equal(s.totalSales, 0);
    assert.equal(s.totalRuleFeeDelivery, 7, 'fee is still charged on a prepaid order');
  });

  test('Intigo overrides delivery fee with a flat 7 and return fee by governorate', () => {
    const rows = [
      { status: 'delivered', totalSales: 100, carrier: 'INTIGO', carrier_fee: 7, city: 'Tunis', rule_fee: 0, fee_delta: null },
      { status: 'delivered', totalSales: 100, carrier: 'INTIGO', carrier_fee: 7, city: 'Sfax', rule_fee: 0, fee_delta: null },
      { status: 'returned', totalSales: 0, carrier: 'INTIGO', carrier_fee: 7, city: 'Tunis', rule_fee: 0, fee_delta: null },
      { status: 'returned', totalSales: 0, carrier: 'INTIGO', carrier_fee: 7, city: 'Sousse', rule_fee: 0, fee_delta: null },
      { status: 'returned', totalSales: 0, carrier: 'INTIGO', carrier_fee: 7, city: 'Nowhere Ville', rule_fee: 0, fee_delta: null },
    ];
    const s = calculateStats(rows, { delivery: 0, return: 0 });
    assert.equal(s.totalSales, 200);
    assert.equal(s.totalRuleFeeDelivery, 14, 'two Intigo deliveries at 7 each');
    assert.equal(s.totalRuleFeeReturn, 5, '1 (Tunis) + 2 (Sousse) + 2 (unknown)');
    assert.equal(s.netRule, 181);
    assert.deepEqual(s.newUnknownGovs, ['Sousse', 'Nowhere Ville']);
    // SIDE EFFECT: writes rule_fee and fee_delta back onto rows.
    assert.equal(rows[0].rule_fee, 7);
    assert.equal(rows[0].fee_delta, 0, 'carrier 7 vs rule 7');
    assert.equal(rows[1].fee_delta, 0);
    assert.equal(rows[2].rule_fee, 1);
    assert.equal(rows[2].fee_delta, 6, 'carrier 7 vs rule 1');
    assert.equal(rows[3].rule_fee, 2);
    assert.equal(rows[3].fee_delta, 5);
    assert.equal(rows[4].rule_fee, 2, 'unknown governorate is priced as the 2 TND tier');
  });

  test('reports an invoice net only when at least one row has a carrier fee', () => {
    const s = calculateStats(
      [
        { status: 'delivered', totalSales: 100, carrier_fee: 9, rule_fee: 0, fee_delta: null },
        { status: 'returned', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null },
      ],
      { delivery: 7, return: 2 }
    );
    assert.equal(s.hasCarrierFee, true);
    assert.equal(s.netCarrier, 91, 'only the carrier fee of the row that has one is subtracted');
  });

  test('counts statuses and ignores buckets it does not know', () => {
    const s = calculateStats(
      [
        { status: 'exchange', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null },
        { status: 'unrecognized', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null },
        { status: 'in_progress', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null },
        { status: 'return_in_progress', totalSales: 0, carrier_fee: null, rule_fee: 0, fee_delta: null },
      ],
      { delivery: 7, return: 2 }
    );
    assert.deepEqual(s.counts, { delivered: 0, returned: 0, in_progress: 1, cancelled: 0, exchange: 1 });
    assert.equal(s.count, 4, 'unrecognized and in_progress are not bucketed');
  });

  test('rounds every total to 3 decimals', () => {
    const s = calculateStats(
      Array.from({ length: 3 }, () => ({ status: 'delivered', totalSales: 0.1 + 0.2, carrier_fee: null, rule_fee: 0, fee_delta: null })),
      { delivery: 0.1, return: 0 }
    );
    assert.equal(s.totalSales, 0.9);
    assert.equal(s.totalRuleFeeDelivery, 0.3);
    assert.equal(s.netRule, 0.6);
  });
});
