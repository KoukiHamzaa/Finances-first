# design-v5 · Noir (لوحة أعمدة)

A full-height board. Three lanes by workflow stage; the page never scrolls, each
lane does. Near-black surfaces, one blue accent.

Live at `/design-v5/`. Gallery: `/design/`.

## The idea

The dashboard is a queue. People do not read a queue, they work through it. This
variant therefore gives the queue the whole screen: the board takes the viewport
height exactly, and the only scrollbars in the interface belong to the lanes.

Everything else follows from that one decision — the top bar is one compact row,
the footer is a grid row rather than an overlay, and the lanes carry their own
totals and their own bulk actions so you never have to leave a column to work in
it.

## Layout

**Three lanes, full height, independently scrolling.**

- `body` is `100dvh` with `grid-template-rows: auto minmax(0, 1fr) auto auto` and
  `overflow: hidden`. The `minmax(0, 1fr)` is load-bearing: without the `0` minimum
  the lane lists refuse to shrink and push the board into a page scroll.
- Each `.lane` is `auto auto minmax(0, 1fr) auto` — head, total, scroller, lane
  actions. The `.lane-list` is the only element in the page with
  `overflow-y: auto`.
- Lanes are **workflow stages** (`قيد التنفيذ`, `مُسلّم`, `مغلق`), not carriers.
  Assignment is an action inside a lane, not the axis of the board.
- Each lane has its own select-all, its own value/fee total and its own bulk
  buttons. Selecting across lanes is what the footer is for.
- The footer is a **grid row, not an overlay**: when the selection bar is `hidden`
  the row collapses and the board grows into the space. Nothing floats over a card.
- Above `62rem`: three columns. To `40rem`: two columns with the third spanning
  both. Below `40rem`: lanes become a horizontal snap carousel
  (`scroll-snap-type: x mandatory`, `grid-auto-columns: minmax(15rem, 82%)`) —
  the standard kanban-on-a-phone answer, and the reason the overflow check
  tolerates off-screen content inside a scrollable ancestor.

## Tokens

| Role | Value |
| --- | --- |
| Background / surface / surface 2 | `#08090b` / `#0e1014` / `#14171d` |
| Card / line / line 2 | `#1b1f26` / `#262b34` / `#363c48` |
| Cacado (accent, Cakado chip, focus) | `#5aa9ff` |
| Balkis (chip, warn) | `#ffb454` |
| Verd / Wax / Indigo | `#46d18a` / `#ff6b6b` / `#9b8cff` |
| Text / soft / faint | `#f2f4f7` / `#c2c8d2` / `#767f8f` |

## Type

- Arabic and UI: **IBM Plex Sans Arabic** 300–700.
- Every figure, reference code and lane count: **JetBrains Mono** 400–700 with
  `tabular-nums`. On a board you scan figures, and a board where the figures are
  proportional is a board you misread.

## Rules this variant follows

1. **No shadows.** Depth is a border plus a background step, same as v4, but the
   surfaces are dark so the steps are smaller and the accents do the work.
2. **One accent, blue.** Blue means "interactive or Cakado" and nothing else.
   Balkis is amber, positive is green, negative is red — each is a *meaning*, and
   none of them is also an interaction cue.
3. **Lane headings are coloured by stage** (amber / green / red) so the board can
   be read at a glance without reading any text.
4. **The row checkbox sits in the card's corner** (`position: absolute`), out of the
   reading path, and the ref is inset to clear it.
5. **Cards are dense and truncate**; a board is for triage, and a card that wraps
   to three lines destroys the column rhythm.
6. **Every lane ends in its own action row**, so bulk work never requires aiming at
   the footer while reading a column.

## Accessibility

- Focus ring: 2px `--cacado`, which is also the selected-card border — the one
  place in these five variants where the focus colour and the selection colour are
  deliberately the same, because on a board they are both "this is the thing you
  are acting on".
- Status is carried by the lane heading colour, the tag colour *and* the tag's
  Arabic label; the board is never colour-only.
- `.lane-list` uses `scrollbar-width: thin` and `overscroll-behavior: contain`, so
  reaching the end of a lane does not start chaining to the page or the next lane.
- At `40rem` the figures move to their own row and the footer actions take a full
  row rather than compressing.

## Files

- `index.html` — markup. Deliberately *not* interchangeable with the other four:
  this is the only one with a viewport-height shell and per-lane scrollers.
- `v5.css` — the entire theme.
- Behaviour comes from `../design/preview.js`.