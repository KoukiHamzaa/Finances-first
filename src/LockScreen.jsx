import { useState } from 'react';
import { Card } from './components/ui/card.jsx';
import { Input } from './components/ui/input.jsx';
import { Label } from './components/ui/label.jsx';
import { Button } from './components/ui/button.jsx';

const BIRTHDAY = '1996-09-24';

function getCurrentTunisDate() {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Tunis',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch (_) {
    /* noop */
  }
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeDate(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (!t) return null;

  // YYYY-MM-DD
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [_, y, mo, da] = m;
    return `${y}-${mo}-${da}`;
  }
  // DD/MM/YYYY or DD-MM-YYYY
  m = t.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (m) {
    const [_, da, mo, y] = m;
    return `${y}-${mo}-${da}`;
  }
  // MM/DD/YYYY
  m = t.match(/^(\d{2})[/-](\d{2})[/-](\d{2})$/);
  if (m) {
    const [_m, _a, _b, c] = m;
    if (c.length === 4) return null;
    return null;
  }
  return null;
}

export default function LockScreen({ onUnlock }) {
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const [submitting, _setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    const n1 = normalizeDate(d1);
    const n2 = normalizeDate(d2);
    if (!n1 || !n2) return;
    const current = getCurrentTunisDate();
    const candidates = [
      [n1, n2],
      [n2, n1],
    ];
    const ok = candidates.some(([a, b]) => a === BIRTHDAY && b === current);
    if (ok) {
      try { sessionStorage.setItem('lock_unlocked', '1'); } catch (_) {}
      onUnlock();
      return;
    }
    try { window.location.replace('https://www.google.com/'); } catch (_) {
      window.location.href = 'https://www.google.com/';
    }
  };

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center p-4 bg-bg text-ink" dir="rtl">
      <Card className="w-full max-w-sm p-6 flex flex-col gap-5 rounded-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] uppercase tracking-widest text-ink-faint">APP ACCESS</span>
          <h1 className="text-xl font-display text-ink">الوصول الآمن</h1>
          <p className="text-xs text-ink-soft">أدخل التاريخين المطلوبين لفتح التطبيق</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lock-d1" className="text-xs text-ink-soft">التاريخ الأول</Label>
            <Input
              id="lock-d1"
              type="text"
              placeholder="DD/MM/YYYY"
              value={d1}
              onChange={(e) => setD1(e.target.value)}
              className="h-11 rounded-lg text-center font-mono tracking-wider"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lock-d2" className="text-xs text-ink-soft">التاريخ الثاني</Label>
            <Input
              id="lock-d2"
              type="text"
              placeholder="DD/MM/YYYY"
              value={d2}
              onChange={(e) => setD2(e.target.value)}
              className="h-11 rounded-lg text-center font-mono tracking-wider"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button
            type="submit"
            className="mt-1 h-11 rounded-lg font-bold"
            disabled={submitting || !normalizeDate(d1) || !normalizeDate(d2)}
          >
            فتح التطبيق
          </Button>
        </form>
      </Card>
    </div>
  );
}
