import { useState } from 'react';
import { Card } from './components/ui/card.jsx';
import { Input } from './components/ui/input.jsx';
import { Label } from './components/ui/label.jsx';
import { Button } from './components/ui/button.jsx';

const BIRTHDAY = '1996-09-24';

function normalizeDate(input) {
  if (!input) return null;
  const v = String(input).trim();
  if (!v) return null;

  const m1 = v.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (m1) {
    const [_, dd, mm, yyyy] = m1;
    return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  const m2 = v.match(/^(\d{4})[/-](\d{2})[/-](\d{2})$/);
  if (m2) {
    const [_, yyyy, mm, dd] = m2;
    return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  const m3 = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m3) {
    const [_, yyyy, mm, dd] = m3;
    return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  const m4 = v.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m4) {
    const [_, dd, mm, yyyy] = m4;
    return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  return null;
}

function getCurrentTunisDate() {
  try {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Tunis',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(now);
  } catch (_e) {
    return new Date().toISOString().slice(0,10);
  }
}

export default function LockScreen() {
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const n1 = normalizeDate(d1);
    const n2 = normalizeDate(d2);
    const current = getCurrentTunisDate();

    const ok = (n1 === BIRTHDAY && n2 === current) || (n1 === current && n2 === BIRTHDAY);

    if (ok) {
      try { sessionStorage.setItem('lock_unlocked', '1'); } catch (_err) {}
      window.location.reload();
      return;
    }

    try { window.location.replace('https://www.google.com/'); } catch (_err) {}
  };

  return (
    <div
      className="flex flex-col min-h-dvh items-center justify-center p-4 bg-bg text-ink"
      dir="rtl"
    >
      <div className="w-full max-w-xs flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center text-3xl shadow-sm border border-line">
            🔐
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-faint font-mono">
              SECURE ACCESS
            </span>
            <h1 className="text-lg font-display font-bold text-ink">
              الوصول الآمن
            </h1>
            <p className="text-[11px] text-ink-faint leading-relaxed">
              أدخل مفتاحَي الدخول للمتابعة
            </p>
          </div>
        </div>

        {/* Form card */}
        <Card className="p-5 flex flex-col gap-4 rounded-2xl border border-line shadow-sm">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* Key 1 */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lock-d1"
                className="text-[11px] text-ink-soft uppercase tracking-wide font-medium"
              >
                المفتاح الأول
              </Label>
              <div className="relative">
                <Input
                  id="lock-d1"
                  type="password"
                  placeholder="••••••••••"
                  value={d1}
                  onChange={(e) => setD1(e.target.value)}
                  className="h-11 rounded-lg font-mono tracking-widest pr-10 text-center bg-surface-2"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint text-xs pointer-events-none">
                  ١
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10px] text-ink-faint font-mono uppercase tracking-widest">
                +
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            {/* Key 2 */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lock-d2"
                className="text-[11px] text-ink-soft uppercase tracking-wide font-medium"
              >
                المفتاح الثاني
              </Label>
              <div className="relative">
                <Input
                  id="lock-d2"
                  type="password"
                  placeholder="••••••••••"
                  value={d2}
                  onChange={(e) => setD2(e.target.value)}
                  className="h-11 rounded-lg font-mono tracking-widest pr-10 text-center bg-surface-2"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint text-xs pointer-events-none">
                  ٢
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="mt-1 h-11 rounded-lg font-bold text-sm tracking-wide"
              disabled={submitting || !normalizeDate(d1) || !normalizeDate(d2)}
            >
              دخول
            </Button>

          </form>
        </Card>

        {/* Footer note */}
        <p className="text-center text-[10px] text-ink-faint font-mono tracking-wide">
          كلا المفتاحين مطلوبان في آنٍ واحد
        </p>

      </div>
    </div>
  );
}
