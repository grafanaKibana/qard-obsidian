# Qard PR #11 — three-pass visual audit

Scope: layout, spacing, colors, radii and typography across mobile, tablet, desktop and split panes. Keyboard accessibility was excluded as requested. Checks use stock Obsidian CSS, light/dark themes, 320–1280px panes, standard/enlarged UI text and 16/32px reading text. Native checks use the separate Qard test app/profile/vault.

## Pass 1 — layout and spacing

Fixed three verified issues:

- **P1: Nested decks widened the mobile library.** At 320px, content extended to 423px; enlarged UI text extended it to 494px. Deck nodes now shrink correctly, with related actions kept together and wrapped as a group. All eight nested-deck scenarios fit after the fix.
- **P2: Exam steps and footer clipped with enlarged text.** The Continue button extended about 32px beyond a 320px pane. Steps and footer now wrap; step indicators retain their width. All six form scenarios fit.
- **P3: The mobile builder drew two separators before Session.** Removed the redundant Session top border/inset, retaining the deck-list boundary and section gap.

## Pass 2 — color and typography tokens

Fixed three verified issues:

- **P2: Selected-answer and native selection accents ignored the dark-theme token.** Both now use `--qard-blue`.
- **P2: Study questions ignored the reading-size preference.** Front/back questions previously stayed at 25/18px while answer text grew to 32px. Their sizes now derive from `--qard-font-reading`, maintaining question/answer hierarchy.
- **P2: Compact Statistics captions stayed at 9px.** Captions now use the metadata token; numeric sizes and the metric grid adapt to the UI font settings.

All 30 targeted color/type scenarios passed. Radius roles were checked across controls, segmented controls, surfaces, badges, status pills and choice rows.

## Pass 3 — integrated regression audit

- **216 scenarios:** both themes; six device/pane arrangements; 18 states, including populated plans, nested decks, selected answers, revealed study cards and actual app course navigation.
- **44 focused scenarios:** nested decks, exam forms and reading/metadata/selection scaling.
- No runtime errors, horizontal overflow, out-of-pane panels or new verified visual regressions in these checks.
- **765 tests in 95 suites passed**, along with formatting, TypeScript, ESLint, Stylelint, build and release checks.
- Native Obsidian checks passed for nested decks, builder selection color, and exam-editor reflow. Only owned synthetic notes were added to the isolated test vault. DevBook's plugin, configuration and installed app hashes remain unchanged.

## Evidence and limits

The PR screenshot tables compare fork `main` to the final PR revision only. Each pair uses matching data, pane width, theme, input mode, typography settings, clock and interactions. The capture manifest records source commits and image hashes.

Responsive coverage uses emulation and desktop split panes; physical iPhone/Safari testing was not performed. No development server was required; screenshots use local browser fixtures. The isolated test Obsidian app remains open.
