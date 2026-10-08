# design-v2 · Terminal (طرفية)

Phosphor green on near-black. An operator console.

Live at `/design-v2/`. Gallery: `/design/`.

## The idea

Some of this data is machine-shaped: parcel IDs, fee deltas, per-brand
settlement totals. This variant dresses it like a terminal — monospace figures,
uppercase tracked labels, square corners, and a scanline overlay that makes the
page feel like the glass of a CRT rather than a document.

**Dark only.** There is deliberately no light version; a console theme with a
light mode is two mediocre themes instead of one good one.

## Tokens

| Role | Value |
| --- | --- |
| Background | `#0b0f0c` |
| Background deep (masthead, footer) | `#060806` |
| Panel / panel raised | `#101613` / `#141b17` |
| Line / line hot | `#22302a` / `#2f4a3c` |
| Phosphor (primary) | `#5bf58c` |
| Phosphor dim | `#3ea366` |
| Amber / red / cyan | `#ffb454` / `#ff6b6b` / `#56d4dd` |
| Text / dim / faint | `#cfe8d8` / `#7f9c8b` / `#56705f` |

## Type

- Figures, labels, IDs: **IBM Plex Mono** 400–700.
- Arabic body: **IBM Plex Sans Arabic** 400–700 (IBM Plex Mono has no Arabic
  glyphs, so Arabic falls back to its sibling grotesque and keeps the rhythm).

## Layout

There is **one table on the page**, not three lists in three columns. The trays
are not containers — they are `<tbody data-tray>` groups inside a single
`<table class="stream">`, and each group opens with a full-width separator row
carrying its own select-all, its own count and its own per-brand fee figures. So:

- the column grid runs unbroken from the first order to the last, the way a
  terminal prints one continuous stream;
- a `<thead>` stays pinned while you scroll through all three trays;
- the footer rule is the session total, not a per-tray subtotal;
- a fixed command bar sits under everything, with a real input, `--` and `help`
  affordances.

**Below 620px the table unrolls.** A six-column table cannot be squeezed into
363px: with `table-layout: fixed` the description collapsed to 62px against a
89px need, and with `table-layout: auto` the table grew to 423px. Neither is
acceptable, and `nowrap` on the fee column rules out wrapping. So `.stream`,
its bodies and its rows become `display: block`, and each row turns into a
two-line block: description and fee on the first line, status under it, checkbox
in the gutter. Columns re-flow instead of disappearing.

## Rules this variant follows

1. **0px radius, everywhere.** Chips are butted together with a `-1px` margin so
   they read as one segmented control.
2. **No shadows.** A border getting *brighter* is the only depth cue.
3. **Scanlines** are a fixed, non-interactive `body::before` plus a vignette on
   `body::after`, both behind content (`body > *` gets `z-index: 1`).
4. **Glow instead of shadow** on focus, checked controls and the selected count.
5. **The status pip blinks** (`steps(1)`) — removed entirely under
   `prefers-reduced-motion`, along with the scanlines.
6. **Row hover** swaps background only; selection adds a left border + faint fill.
7. **Scanlines and the shell chrome are `pointer-events: none`.** They are glass,
   not UI, and at phone widths the decorative layers must never become the widest
   box in the document — the CRT layer alone was pushing the page to 432px.

## Accessibility

- Focus ring: 2px phosphor + a 4px halo, verified against `--phos`.
- Phosphor on near-black clears AA for large text comfortably; body text uses
  `--text` (`#cfe8d8`) rather than phosphor so long strings stay readable.
- Semantic colours (amber/red/cyan) are never the only signal — each status tag
  also carries its Arabic label.
- The scanline layer is decorative and hidden from assistive tech; the underlying
  text contrast is unaffected by it.

## Files

- `index.html`
- `v2.css` — the entire theme.
- Behaviour comes from `../design/preview.js`.