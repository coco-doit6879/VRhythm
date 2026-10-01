# Style ownership

The three entry files contain imports only, in this order:

1. `styles.css` → `base/`: layout and original component rules.
2. `theme.css` → `theme/`: palette and visual treatment.
3. `ui-refinements.css` → `responsive/`: responsive/accessibility refinements.

Within each phase, files are owned by a page (`home`, `explore`, `learn`,
`instrument-learning`, `profile`, `auth`, `lesson`) or a reusable component
(`header`, `carousel`, `instrument-features`, `bamboo-flute`).

Page selectors must remain inside their page root. `:where(.explore-page,
.explore-page *)`, for example, checks ownership without increasing specificity.
Do not remove that boundary or add page selectors to the entry files.

`shared.css` contains common foundations, typography, controls, reusable legacy
widgets, and cross-component palette rules. It is not a place for page-specific
layout fixes. The existing `components/bamboo-flute-article.css` and
`instrument-pages.css` retain their dedicated base layouts.

Prefer a CSS Module for a new standalone component. When modifying an existing
component, edit its owning file and its responsive rules together. Shared color
tokens and typography should stay shared so the site remains visually consistent.

This extraction preserves declarations and the base → theme → responsive order;
it does not remove legacy widgets or redesign the pages.
