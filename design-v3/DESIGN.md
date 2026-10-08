# design-v3 · Sandstone (حجر رملي)

Warm sandstone surfaces, one big card per row. The comfortable, phone-first
option.

Live at `/design-v3/`. Gallery: `/design/`.

## The idea

This is the variant you regret least. Warm off-white page, white cards, real soft
shadows, generous radii, and a deep sand-brown accent instead of a loud brand
colour. Nothing clever, nothing dense, nothing that will age badly.

It is included precisely because the other four are opinions.

## Layout

**One column, one card per row, one tray visible at a time.** The cards are the
interface; the chrome around them is deliberately small.

- A compact sticky app bar: brand, connection state, net position. It is not a
  masthead, because there is nothing to announce.
- A full-width search field, then a horizontally scrolling status filter, then a
  row of small controls.
- The two carriers are shown as **a pair of figures**, not as two cards in a grid —
  `border-inline-start` + label + amount + split, stacked vertically.
- A sticky **tab strip** switches between the three trays; the two you are not
  looking at are `hidden`, not collapsed to a sliver.
- The tray body is a vertical stack of large cards: checkbox, name, ref and
  wilaya, then status pill and amount.
- **The action bar is permanent.** It does not slide in when a row is picked; it is
  always there, because on a phone an action bar that appears is an action bar you
  miss.

This is the only variant where tabs are the primary navigation, and the reason it
does not carry to production unchanged is worth recording: tabs hide the other two
trays, and the real workflow is bulk-assign *across* trays. It works as a review
surface, and it would need rethinking as a workflow surface.

## Tokens

| Role | Value |
| --- | --- |
| Background | `#fbf8f3` |
| Surface (card) | `#ffffff` |
| Surface 2 (recessed) | `#f5efe4` |
| Line / line 2 | `#ece1cf` / `#ddcdb2` |
| Sand deep (accent) | `#43301c` |
| Sand mid | `#8c6f4e` |
| Verd (positive) | `#2f5c31` on `#e4efe1` |
| Wax (negative) | `#8d3a22` on `#f7e3dd` |
| Amber (warning) | `#7d5a12` on `#f8ecd2` |
| Void (cancelled) | `#6d665c` on `#e9e5df` |
| Indigo (swap) | `#2f4f77` on `#e2e9f2` |
| Text / soft / faint | `#2a1c0f` / `#6b563c` / `#9c866a` |

## Type

- Text and UI: **Almarai** 300–800.
- Figures and micro-labels: **Outfit** 400–700 with `tabular-nums`.

## Rules this variant follows

1. **One warm contact shadow** — `--shadow-card` is a 1px highlight plus a
   wide, low-opacity ambient drop. Warm-tinted (`rgba(122,88,44,…)`), never neutral
   grey; grey shadows on warm paper look like dirt.
2. **Radii are generous**: `1.15rem` on cards, `.75rem` on controls, `999px` on
   chips and pills.
3. **Sand-brown is reserved** for interactive and primary meaning. Carriers are
   never given their own colour here — that is v4's and v5's idea.
4. **The tab strip and app bar are translucent** (`blur`) so cards scrolling under
   them stay hinted at rather than being cut off.
5. **The action bar is dark** (`--sand-800`) against an otherwise light page. It
   is the one element allowed to be heavy, because it is the one thing you must
   not miss.
6. **Card names truncate with an ellipsis**; the ref and wilaya sit underneath, so
   truncation never costs you the identifier.

## Accessibility

- Focus ring: 2px `--sand-800` at 2px offset, never removed — only narrowed to
  `:focus:not(:focus-visible)` for pointer users.
- Status is carried by the pill's Arabic label as well as its colour.
- `.pick` and `.pick-all` are real `<button>`s with `aria-checked`; partial
  selection uses a dash, not a half-filled box.
- Tabs use `aria-selected` and are real buttons, so they are reachable by keyboard.
- At `26rem` the net position is dropped from the app bar rather than letting the
  title truncate.

## Files

- `index.html` — markup. Deliberately *not* interchangeable with the other four:
  this is the only one whose trays are switched by tabs.
- `v3.css` — the entire theme.
- Behaviour comes from `../design/preview.js`.