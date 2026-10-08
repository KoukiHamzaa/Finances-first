# Design previews

Five self-contained candidate designs for the delivery dashboard. Open
`/design/` for the gallery, or jump straight to a variant:

| Route | Name | Layout | Type | Corners |
| --- | --- | --- | --- | --- |
| `/design-v1/` | Ledger (دفتر) | one reading column, real tables stacked vertically | Amiri + Plex Arabic + Plex Mono | 2px |
| `/design-v2/` | Terminal (طرفية) | one dense table, trays as separator rows, command line | Plex Mono + Plex Arabic | 0px |
| `/design-v3/` | Sandstone (حجر رملي) | one card per row in a single column, tray tabs | Almarai + Outfit | 18px |
| `/design-v4/` | Slate (لوحتان) | two panes: scrolling index + active order detail | Plex Arabic + Inter | 8px |
| `/design-v5/` | Noir (لوحة أعمدة) | full-height lanes, each scrolls on its own | Plex Arabic + JetBrains Mono | 9px |

Each variant has its own `DESIGN.md` explaining the intent, tokens and rules.

## How these are built

These are **not** React components and they share no code with the app. Each is a
static HTML page plus one hand-written CSS file, wired into Vite as separate MPA
entries in `vite.config.ts`:

```ts
build.rollupOptions.input = [
  index.html, design/index.html,
  ...[1, 2, 3, 4, 5].map(n => path.resolve(here, `design-v${n}/index.html`)),
]
```

Consequences worth knowing:

- **The five layouts are structurally different on purpose.** Their DOM trees are
  *not* interchangeable and are not meant to be. A variant may use a table, a card
  list, a two-pane split or independently scrolling lanes. An earlier pass shipped
  five reskins of one card-grid dashboard and was rejected: same structure, five
  colour schemes, is not five options.
- What *is* held constant is the payload: the same orders, wilayas, statuses,
  carriers, fee inputs and totals appear in all five, so the comparison is about
  shape and not about which fake data was invented.
- Variant CSS is emitted as its own asset per page and **never enters the main
  bundle**. The app's JS and CSS are unchanged by anything in this directory.
- The only script any preview loads is `design/preview.js` (~170 lines, no
  dependencies). It finds everything by `data-*` attribute and never by class
  name, so each variant is free to name and style its own classes freely, and to
  use different elements for the same job.

## Behaviour

`design/preview.js` implements only the mechanics that are common to all five,
mirroring the real app:

- Click a row's checkbox to toggle it.
- Click a tray's select-all to toggle the whole tray.
- Select-all reports `aria-checked="mixed"` and sets `data-mixed` when only some
  rows are picked.
- The selection bar is `hidden` whenever nothing is selected.
- The tray head's select-all starts `aria-checked="mixed"` in markup, so the
  indeterminate state is visible on first paint without any interaction.

Optional parts, present only in the variants that declare them:

- `[data-tabs]` / `[data-tab]` — switches which `[data-tray]` is visible (v3).
- `[data-detail]` + `[data-detail-field]` + per-row `data-detail-*` — clicking a
  row fills the detail pane (v4).
- `[data-selected-list]` — the picked rows are mirrored into the bar as chips
  (v4, v5).

## Contracts to keep when editing

1. **A preview's script tag must be `type="module"`.** Vite only processes module
   scripts; with a bare `<script src>` it emits a warning, does not copy the file,
   and the built page 404s on it — selection silently dies in production while
   working fine in dev.
2. **`[data-select-all]` must live inside the `[data-tray]` it controls.** The
   script resolves a select-all's tray with `closest('[data-tray]')`; a select-all
   in a page-level header silently toggles nothing.
3. **Every page needs exactly three `[data-tray]` elements** and at least six
   `[data-row]` ones, and each tray needs its own select-all.
4. **Never let a grid track's min-content widen the page.** Tracks use
   `minmax(min(Npx, 100%), 1fr)` and inputs get `inline-size: 100%; min-width: 0`,
   otherwise an intrinsic input width blows out the column at 390px.
5. **A wide table cannot be rescued by `table-layout: fixed`.** With columns
   hidden, fixed layout starves the flexible column (the description collapsed to
   62px against a 89px need); with `table-layout: auto` the table grew to 423px
   inside a 363px box. v2 unrolls its rows into stacked lines below 620px instead.
   Note that RTL absorbs leftward overflow into the scroll origin, so
   `scrollWidth === clientWidth` on `<html>` can hide a table that is silently
   clipped — check the table's own `scrollWidth` too.
6. **Focus rings are verified against a token**, not a literal, so renaming a
   theme colour cannot silently break them. Every `outline: none` must be scoped
   to `:focus:not(:focus-visible)`.
7. Keep `direction: ltr` + `unicode-bidi: isolate` on fee figures.
8. An element parked outside the viewport is fine **only** if a scrollable
   ancestor (`overflow-x: auto|scroll`) owns it, as v5's mobile carousel does.

## Verified

`npm test` (104 pass) and `npm run lint` are clean. Each variant and the gallery
pass 16 headless checks at 390 / 768 / 1280 px, in **both** dev and the built
`dist`: no horizontal overflow, no element escaping the viewport outside a
scroller, webfont actually loaded, row/select-all/mixed-state/clear-all
behaviour, focus ring present on keyboard focus, and no runtime errors.

## Promoting a winner

Nothing here is imported by `src/`. To adopt a variant, port its tokens and rules
from `design-vN/DESIGN.md` into `src/index.css` and the primitives in
`src/components/ui/`, then delete the preview directories. The CSS is written to
be read as a spec, not shipped as-is.