# Finances-first — Design System

Operational reference for the order-management dashboard (`لوحة إدارة الطلبات`).
Single source of truth for tokens: `src/index.css`. Component structure follows
[shadcn/ui](https://ui.shadcn.com); visual language follows this document.

---

## Overview

An Arabic-first, RTL-native operations dashboard. One screen carries the whole
workflow: paste or load orders, see money, reconcile carrier status, resolve
exceptions, export.

Three constraints shape every decision here, and they win over any aesthetic
preference:

1. **Arabic is the primary language, not a translation.** Layout is logical
   (`start`/`end`), never physical (`left`/`right`). Icons that imply direction
   flip via the `rtl:` variant.
2. **Density beats decoration.** An operator reads hundreds of rows per session.
   Vertical rhythm is tight; chrome earns its space.
3. **This is a data tool, not a landing page.** No hero sections, no
   atmospheric gradients, no illustration. Restraint is the brand.

---

## Colors

Tokens are defined once as raw hex values on `:root` and `[data-theme="console"]`,
then aliased into shadcn's semantic names. Legacy names (`--bg`, `--surface`,
`--ink`) still resolve — do not add new ones.

### Semantic (shadcn-compatible)

| Token | Light | Console | Use |
|---|---|---|---|
| `--background` | `#ECEFF3` | `#0B1118` | Page canvas |
| `--foreground` | `#0B1220` | `#E6EDF3` | Body text |
| `--card` | `#FFFFFF` | `#121A24` | Panels, rows, inputs |
| `--card-foreground` | `#0B1220` | `#E6EDF3` | Text on card |
| `--popover` | `#FFFFFF` | `#121A24` | Overlays, dialogs |
| `--primary` | `#0F766E` | `#2DD4BF` | Brand, primary actions |
| `--primary-foreground` | `#FFFFFF` | `#04201D` | Text on primary |
| `--secondary` | `#F6F8FA` | `#0E1620` | Secondary buttons, wells |
| `--muted` | `#F6F8FA` | `#0E1620` | Subtle fills |
| `--muted-foreground` | `#475063` | `#9AA7B6` | Labels, secondary text |
| `--accent` | `#F6F8FA` | `#16212D` | Hover surfaces |
| `--accent-foreground` | `#0B1220` | `#E6EDF3` | Text on accent |
| `--destructive` | `#E11D48` | `#FB7185` | Loss, destructive actions |
| `--border` | `#E2E7EE` | `#1E2A37` | Hairlines |
| `--input` | `#E2E7EE` | `#1E2A37` | Input borders |
| `--ring` | `#0F766E` | `#2DD4BF` | Focus outline |

### Money semantics

These are **not** shadcn tokens and must never be collapsed into `destructive`.
In this app "negative" is a legitimate, expected business outcome, not an error.

| Token | Light | Console | Meaning |
|---|---|---|---|
| `--positive` | `#059669` | `#34D399` | Collected / delivered |
| `--positive-foreground` | `#FFFFFF` | `#04200F` | Text on positive |
| `--warning` | `#D97706` | `#FBBF24` | Pending / needs review |
| `--warning-foreground` | `#FFFFFF` | `#241800` | Text on warning |

### Surfaces & row states

| Token | Light | Console | Use |
|---|---|---|---|
| `--surface-3` | `#EDF0F5` | `#17222E` | Wells, progress tracks, tab strips |
| `--row-hover` | `#F1F5F9` | `#16212D` | Row hover |
| `--row-selected` | `#E0F2F0` | `#12302F` | Selected row |
| `--ink-faint` | `#8A93A3` | `#6E7A8A` | Placeholders, disabled, meta |

### Contrast

Measured against `--card`:

| Pair | Light | Console | Verdict |
|---|---|---|---|
| `--ink` on card | 17.4:1 | 13.9:1 | AAA |
| `--ink-soft` on card | 8.1:1 | 6.4:1 | AAA |
| `--ink-faint` on card | 3.1:1 | 3.4:1 | Large text / decorative only |
| `--primary` on card | 5.0:1 | 9.4:1 | AA text-safe |
| `--positive` on card | 3.9:1 | 8.6:1 | Light: UI only |
| `--negative` on card | 4.6:1 | 6.7:1 | AA text-safe |
| `--warning` on card | 3.3:1 | 9.2:1 | Light: UI only |

`--positive` and `--warning` fall below 4.5:1 in light mode. They are therefore
restricted to icons, dots, borders, and other non-text UI. Any *text* carrying
these meanings uses `--ink` with the colour applied to an adjacent indicator, or
`--ink-soft` on a tinted `--positive`/`--warning` background.

### Do / Don't

- Do add a new raw value to both themes; never a theme-only override.
- Don't hardcode hex in JSX. There are five legacy exceptions in `App.jsx`
  (chart gradients); treat those as debt, not precedent.

---

## Typography

Three families, all loaded non-blocking from Google Fonts (`media="print"` +
`onload`), with `<noscript>` fallback.

| Token | Family | Use |
|---|---|---|
| `--font-sans` | Tajawal | All UI and body text. Arabic-first. |
| `--font-display` | Reem Kufi | Section headings, sheet titles |
| `--font-mono` | Sora | NIDs, numbers, codes, `tabular-nums` columns |

Weights in use: 400, 500, 700 (sans); 700 (display); 400/700/800 (mono).

### Scale

| Class | Size | Use |
|---|---|---|
| `text-4xl` / `text-5xl` | 36 / 48px | Single money hero only |
| `text-2xl` / `text-3xl` | 24 / 30px | Summary values |
| `text-xl` / `text-lg` | 20 / 18px | Card titles, tray titles |
| `text-sm` | 14px | **Default.** Table cells, labels, buttons |
| `text-xs` | 12px | Column headers, badges, meta |
| `text-[11px]` / `text-[10px]` | 11 / 10px | Micro-labels only |

`text-sm` is the body size, not `text-base`. Arbitrary sizes below 12px are
restricted to non-essential labels — at 10px Arabic is already hard to read.

Always set `tabular-nums` on money and count columns, or digits visibly jitter
as values update during enrichment.

---

## Spacing & Layout

4px base grid. Standard gaps: `gap-1` (4), `gap-2` (8), `gap-3` (12), `gap-4` (16),
`gap-6` (24).

- Card padding: `p-4`.
- Page gutter: `px-4` mobile, `px-6` desktop.
- Row height: 44px minimum for tap targets; do not compress below that on mobile.
- Max content width: none. This is a full-bleed data tool.

---

## Elevation & Depth

Depth is carried by the **surface ladder plus hairlines**, not drop shadows.
The console theme in particular resists shadows.

| Level | Treatment | Use |
|---|---|---|
| 0 | No shadow, no border | Page body, plain text |
| 1 | `--card` background, 1px `--border` | Cards, rows, inputs |
| 2 | `--accent` background | Hovered cards, hover rows |
| 3 | `--surface-3` background | Wells, progress tracks, tab strips |
| 4 | 2px `--ring` outline, 2px offset | Focus |

`--row-selected` and `--row-hover` replace the old ad-hoc
`hover:bg-slate-100 dark:hover:bg-slate-800/50` values with theme-aware tokens.

The only shadow in the system is on modal dialogs, where the overlay alone
cannot establish layering.

### Page texture

`body::before` paints a 4%-opacity SVG noise field and `body::after` a top
vignette. Both are `pointer-events: none` and `z-index: -1`. They exist to stop
large flat areas from banding on cheap panels. Do not add more ambient layers.

---

## Shapes

### Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Checkboxes, tiny chips |
| `--radius-sm` | 6px | Focus rings, small tags |
| `--radius-md` | 8px | Buttons, inputs, badges |
| `--radius-lg` | 12px | Cards, panels, summary tiles |
| `--radius-xl` | 16px | Sheets, modals, hero tiles |
| `rounded-full` | 9999px | Pills, status dots, avatars |

The app previously mixed `rounded-lg`, `rounded-xl`, and `rounded-2xl` freely.
New code follows this table; converting existing elements is a separate pass.

---

## Motion

Fast and unobtrusive. Transitions are 150–250ms, ease-out.

| Token | Value | Use |
|---|---|---|
| — | 200ms | Hover/colour transitions |
| — | 200ms | Progress bar width |
| `sweep` | 6s linear infinite | Idle sheen on active tray |

A global `prefers-reduced-motion` block already collapses all animation and
transition durations to 0.01ms. Anything new must survive that block.

The sheen (`body::after` style, `.sheen::after`) is a single sweeping highlight.
It is the one continuous animation in the app and it runs on the active tray
only.

---

## Accessibility

Non-negotiable. The previous version failed WCAG 2.1 AA on several counts.

- **Focus.** One global rule: 2px `--ring` outline at 2px offset on
  `:focus-visible`. Never `outline: none` without a replacement. Never a focus
  *shadow* — shadows are invisible on the console theme.
- **Never write the focus outline as the `outline` shorthand.** Tailwind 4's
  `transition-colors` includes `outline-color` in `transition-property`. An
  element carrying `transition-colors` therefore holds the ring at its
  pre-focus computed value (which is `currentColor`, i.e. the text colour)
  instead of `--ring`. Verified: the clear-cache button rendered a
  `#475063` ring instead of `#0F766E`. The global rule sets
  `outline-width` / `outline-style` / `outline-color` as separate longhands and
  drops `outline-color` from `transition-property` while focused. Use the same
  longhand form if you ever write a focus style by hand.
- **Motion.** `prefers-reduced-motion` respected globally.
- **Targets.** 44px minimum on touch.
- **Contrast.** See the contrast table above; `--positive`/`--warning` are
  non-text only in light mode.
- **Semantics.** Icon-only controls need `aria-label`. Decorative SVG gets
  `aria-hidden="true" focusable="false"`. Progress bars expose
  `role="progressbar"` with `aria-valuenow`. Destructive confirmations use
  `AlertDialog` with a real `AlertDialogTitle` and `AlertDialogDescription`.
- **RTL.** Every directional property is logical. No `ml-`, `mr-`, `pl-`, `pr-`,
  `left-`, `right-`, or `text-left`/`text-right` in new code.

### RTL hazards in this codebase

Verified empirically against Tailwind 4.3.2 in this repo, not from docs:

| Class | Compiles | Note |
|---|---|---|
| `inset-inline-start-1.5` | **No** | Was silently dead in `App.jsx`. Use `start-1.5` |
| `inset-inline-end-1.5` | **No** | Same. Use `end-1.5` |
| `start-1.5`, `end-1.5` | Yes | Emits `inset-inline-start/end` |
| `start-1`, `start-4`, `end-3` | Yes | |
| `ms-*`, `-ms-2`, `ps-*`, `pe-*`, `inset-x-0`, `text-start` | Yes | |
| `start-[6px]` | Yes | |
| `end-[6px]` | **No** | Arbitrary values work on `start` but not `end`. Use the numeric scale |
| `-start-[2px]` | **No** | Negative arbitrary logical values do not compile |

Tailwind has no built-in `rtl:` variant. It is defined in `index.css` as
`@custom-variant rtl` and verified to emit
`.rtl\:rotate-180:where([dir=rtl] *)`. Without that definition, shadcn's
icon-flip convention silently compiles to nothing.

`left-1/2 -translate-x-1/2` mis-centres in RTL, because `translate` is a
physical transform. Use `inset-0 m-auto h-fit` instead.

---

## Components

All live in `src/components/ui/`, built on `cn()` (`src/lib/utils.js`).

| Component | Notes |
|---|---|
| `Button` | cva. `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes `sm`/`default`/`lg`/`icon`/`icon-sm` |
| `Input` | `h-9`, `aria-invalid` → destructive border |
| `Label` | 14px, `peer-disabled` aware |
| `Badge` | `positive`, `negative`, `warning` map to money semantics |
| `Checkbox` | Radix. Handles `indeterminate` (renders a dash, not a check) |
| `Card` | `CardHeader`/`Title`/`Description`/`Content`/`Footer` |
| `Alert` | `default`, `destructive`, `warning`, `positive`; `role="alert"` |
| `Progress` | `role="progressbar"`, inline-size transition |
| `AlertDialog` | Radix. **Must be lazy-loaded** — see below |
| `Tabs` | Radix. Mobile tray switcher |
| `NativeSelect` | Plain `<select>`. Deliberately not Radix Select |
| `DirectionProvider` | Wraps Radix `Direction`, defaults to `rtl` |

### Rules

- **Lazy-load `AlertDialog`.** It and its focus-scope machinery are the heaviest
  primitive. Import it with `React.lazy` + `Suspense` at the call site in
  `App.jsx`.
- **Use `NativeSelect`, not Radix `Select`.** Radix Select builds a Popper
  portal; that is real bundle weight for a control with no search, no
  multi-select, and no positioning needs.
- **`RowCard` and `ZoneTable` stay memoised.** Their props are compared by
  identity. Do not pass newly-created objects or inline functions into them.
- Icons are inline SVG. No icon font, no icon library dependency.

---

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| `< 768px` | Single column. Header collapses. Trays become `Tabs`. Sheets go full-height. |
| `768–1024px` | Two-column summary grid. |
| `> 1024px` | Full desktop table, multi-column summary. |

- Use `min-h-dvh`, not `min-h-screen` or `100vh`. Mobile browser chrome makes
  `100vh` taller than the visible viewport, which clips sticky footers.
- Mobile is a first-class target, not a fallback. Test at 390px wide.

---

## Do's and Don'ts

**Do**

- Reach for a primitive in `src/components/ui/` before writing raw markup.
- Use logical properties.
- The theme switch is a physical control: put `dir="ltr"` on its track. Without
  it the `start-*` glyph resolves against each glyph's own direction while the
  knob resolves against the RTL track, so the knob ends up opposite the active
  icon.
- Add tokens to both themes together.
- Keep Arabic readable — prefer 14px over 10px, weight over colour for emphasis.

**Don't**

- Don't add a hex literal to JSX.
- Don't reach for `destructive` to mean "negative money".
- Don't wrap a heavy primitive in a synchronous import.
- Don't break the memo contracts on `RowCard` / `ZoneTable`.
- Don't put a focus ring on `:focus` instead of `:focus-visible`.

---

## Verification

After any visual change:

```bash
npm test          # 104 tests, must stay green
npm run lint
npm run build
```

Budgets from the pre-upgrade baseline:

| Asset | Baseline | Ceiling |
|---|---|---|
| Initial JS (gzip) | 78.08 kB | 103.08 kB (+25 kB) |
| CSS (gzip) | 6.82 kB | 11.32 kB (+4.5 kB) |
| xlsx chunk (gzip) | 163.12 kB | unchanged — must stay lazy |

Lighthouse was not available in this environment, so mobile LCP and INP are
**unmeasured**. The JS budget is the enforced proxy. Re-run Lighthouse
manually before release.