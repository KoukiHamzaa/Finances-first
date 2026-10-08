# design-v1 · Ledger (دفتر)

Warm paper, ink and brass. An editorial accounting-ledger treatment of the
delivery dashboard.

Live at `/design-v1/`. Gallery: `/design/`.

## The idea

A finance console is, conceptually, a ledger. This variant takes that literally:
it looks like a well-printed book rather than a web app. Depth comes from hairline
rules and typographic hierarchy instead of shadows, corners are square-ish (2px),
and every number is set in a monospace face with tabular figures so columns line up
the way they would on paper.

## Layout

The defining choice is that there is **no tray grid**. The page is one narrow
reading column — `max-inline-size: 46rem`, centred — and the three trays are real
`<table>` sections stacked vertically, each with its own `<caption>`-style header,
select-all and subtotal rule. You scroll the page the way you scroll a statement:

1. masthead + net position
2. control strip
3. unclassified orders — table, then its own subtotal rule
4. Cakado orders — table, then its own subtotal rule
5. Balkis orders — table, then its own subtotal rule
6. grand total

Because the trays are tables, the *columns are shared* — description, wilaya,
status and fee are aligned in one grid that runs the full length of the page
rather than restarting three times. There are no cards and no columns side by side.

## Tokens

| Role | Value |
| --- | --- |
| Paper (page) | `#f6f2e9` |
| Leaf (raised surface) | `#fffdf8` |
| Paper deep (recessed) | `#efe9dc` |
| Rule | `#ddd4c0` |
| Rule strong | `#c3b69c` |
| Ink | `#1c1814` |
| Ink soft / faint | `#5d554a` / `#8b8172` |
| Brass (accent) | `#96692c` |
| Verd (positive) | `#2f6b4f` |
| Wax (negative) | `#a1372e` |
| Amber (warning) | `#9a6a12` |

## Type

- Display / serif: **Amiri** 700 — brand mark, tray titles, instrument names.
- Text: **IBM Plex Sans Arabic** 400–700.
- Figures: **IBM Plex Mono** 500–600 with `font-variant-numeric: tabular-nums`.

`.row-fee` sets `direction: ltr` + `unicode-bidi: isolate` so negative amounts and
thousands separators never reorder inside the RTL flow.

## Rules this variant follows

1. **No shadows anywhere.** Surfaces are separated by a 1px `--rule` border and a
   background step (paper → leaf → paper-deep).
2. **2px radius.** Chips are square; only circles (the crest seal, the status
   dot) are round.
3. **Uppercase micro-labels** with `letter-spacing: .14em` replace icons.
4. **Masthead has a 3px double rule** under it, like a bound page.
5. **`.row.is-selected`** is a warm tint (`#fbf4e6`) plus a brass border — never a
   colour that changes the text colour. Selection is marked on the row's leading
   cell only, so the table's rules stay continuous.
6. **Indeterminate trays draw a dash**, never a half-filled box, so partial
   selection can never be read as complete.
7. **Every tray closes with its own subtotal rule** and the page ends with a
   `.grand-total`, so the arithmetic is checkable by eye without opening a drawer.

## Accessibility

- Focus ring: 2px `--brass` at 2px offset. Verified against `--brass` via a probe
  element so a theme colour change cannot silently break it.
- `.tally` / `.tick` are `<button>` with `aria-checked`; partial state adds
  `data-mixed`.
- The trays are `<section>` elements with real headings and real `<table>` markup,
  so a screen reader announces the structure as a document, not as a pile of divs.
- Print stylesheet drops the control strip, selection bar and switcher.

## Files

- `index.html` — markup. Deliberately *not* interchangeable with the other four
  variants: it is the only one built from stacked tables.
- `v1.css` — the entire theme.
- Behaviour comes from `../design/preview.js`.