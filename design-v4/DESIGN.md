# design-v4 · Slate (لوحتان)

Two panes: a scrolling index and the detail of whichever order is active.
Cool grey, 1px rules, no softness.

Live at `/design-v4/`. Gallery: `/design/`.

## The idea

Most of this dashboard is comparison between an order and *something about that
order*: its carrier, its fees, its history, its client. A three-column tray layout
answers none of that without a page load. This variant makes that relationship
the layout: the index is always there, and the second pane is a workspace for the
order you are looking at.

It is the densest variant and the least decorative one. There is no shadow and no
gradient anywhere; depth is a 1px border and a background step.

## Layout

**Two panes side by side**, with the index on the start (right, in RTL) side:

- A thin dark rail across the top carries the identity, four key figures and the
  global search. It is a rail, not a header — it does not introduce the page.
- `.pane-index` holds the three trays (`مفتوحة`, `كاكادو`, `بلقيس`) as a dense
  single-column list. Each row is one line: ref, name, status pill, amount.
- `.pane-detail` holds the active order: ref, name, status, net amount, a
  four-cell attribute grid, four actions and an activity log.
- **Clicking any index row repaints the detail pane.** Rows carry their payload as
  `data-detail-*` attributes and the shared script copies them into the
  `[data-detail-field]` targets, marking the row `is-active` with a 3px inline
  accent. No framework, no re-render.
- Each tray owns its own select-all. There is deliberately no page-level
  "select all 7": the shared contract toggles one tray at a time, and a control
  that governs three trays at once is a control nobody trusts.
- The index pane is `position: sticky` with its own scroller, so the index stays
  put while the detail pane is long.

Below `60rem` the split collapses to a single column, index first. Below `34rem`
each index row becomes two lines: name and ref on top, status and amount under.

## Tokens

| Role | Value |
| --- | --- |
| Background | `#f6f7f9` |
| Surface / surface 2 | `#eceef2` / `#ffffff` |
| Line / line 2 | `#dde1e8` / `#c3c9d4` |
| Accent (interactive, active row) | `#3d63b4` |
| Rail | `#1d222c` |
| Verd / Wax / Amber / Void / Indigo | `#24603a` / `#8d332a` / `#7d5c14` / `#5f6773` / `#2f5177` |
| Text / soft / faint | `#1d222c` / `#454d5c` / `#6f7889` |

## Type

- Arabic and UI: **IBM Plex Sans Arabic** 300–700.
- Figures, refs and figures in the rail: **Inter** 400–700 with `tabular-nums`.
  The reference codes (`BC-311`, `CA-202`) are set in it deliberately — they are
  identifiers, not prose.

## Rules this variant follows

1. **1px borders, no shadows, 8px radius.** Separation is structural, never
   atmospheric.
2. **Uppercase micro-labels** with `letter-spacing: .04em` name the trays; the
   page never uses icons where a word fits.
3. **The active row is marked by a 3px inline accent bar**, not by a background
   tint — a tint would be lost against the hover state.
4. **Status is a coloured tint plus its Arabic label**, both at 11px, so the row
   stays one line.
5. **Attribute grids are `auto-fit minmax(min(11rem, 100%), 1fr)`** over a 1px
   gap, which gives a real table-like block without a `<table>` and without
   min-content blowout at 390px.
6. **The rail's figures use Inter**, so the four numbers read as one instrument
   cluster rather than four unrelated strings.

## Accessibility

- Focus ring: 2px `--accent` at 1px offset, verified against `--accent`.
- Index rows are clickable `<li>`s; the checkbox inside is a real button, and
  clicking it selects without changing the detail pane, so the two actions stay
  separable.
- The active row is signalled by the accent bar *and* by `aria-current`-adjacent
  styling on the name weight, not by colour alone.
- At `34rem` the action chips move to their own full-width row instead of being
  squeezed.

## Files

- `index.html` — markup. Deliberately *not* interchangeable with the other four:
  this is the only one with a detail pane fed from row data.
- `v4.css` — the entire theme.
- Behaviour comes from `../design/preview.js`.