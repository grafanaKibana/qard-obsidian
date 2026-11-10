# Upstream PR #17 — card width, shared rows and review fixes

Source: `6ad9e47724c993eba9f0178f8627da0c7ab020e5`. Baseline: upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

The page stays at the shared 1440px maximum; the study card has its own centered 860px cap. Compact workspace tabs use space-between. Shared row tokens define 12×16px insets, 8px action gaps, 10px radii and body/metadata type roles. Continuation rows place titles first, followed by supporting labels/context. Short-title course context retains its measured fit behavior. Compound navigation/delete rows use one surface and aligned actions. Saved-session controls stay beside the title in compact panes, with a named Play action and Discard.

Category accents reuse the theme palette: purple lessons, blue tests/checks/Today, teal saved study sessions, and amber updates. Backgrounds, borders, metadata and hover states derive from the row accent. Existing mastery pills retain their own status colors. Grouped Today rows keep course subheadings, inline pills, single-line title ellipsis and trailing Teach/Chevron.

Both upstream review comments are fixed and resolved:

- Emptying an expanded course now cleans up fullscreen inertness/focus containment and resets expansion. Refilled courses stay collapsed. Prior inert attributes are restored.
- Opening an objective through search synchronizes its navigation cursor. The A→B search→C navigation regression is covered.

Two regressions were added to the existing learn UI suite; all 24 tests in that suite pass. Full `npm run check` passed: 786 tests in 96 suites, formatting, TypeScript, ESLint, Stylelint, build and release checks. The layout detector returned no findings. Independent source review found no remaining row/card regression.

196 page cases passed across 14 screens, seven pane/device configurations and light/dark themes. An additional 42 focused rendered cases verified row title/metadata order and sizes, metadata contrast ≥4.5:1, shared radii, navigation/delete alignment, saved-session action alignment, distinct category surfaces, equally distributed compact tabs, and the centered 860px card cap. Device coverage includes 320/390px touch, 768px touch, 1280/1440px laptop, 1920px desktop and a 390px desktop split pane. No unintended latest-page horizontal overflow or runtime errors occurred.

43 browser main-to-latest pairs were freshly captured. Existing library examples consolidate saved-session, source-update, Today and test-resume variants along with search focus and local action hover, without increasing the screenshot count. Learn and Today examples show lesson/check rows and mobile tab distribution; the study example shows the card cap. The unchanged native Mermaid pair is retained: renderer unchanged, cap exceeds its 324px target. Total remains 44 pairs/88 images, equal before/after columns, at most three examples per group. No intermediate revision serves as before.

The final build is installed only in the separate Obsidian test vault. DevBook, global Obsidian configuration and the installed app are outside task writes; protected hashes are checked against this turn’s baseline. The separate test app is left open. Mobile coverage is simulated browser touch/panes, not physical iPhone/Safari. Keyboard accessibility auditing remains excluded; the specifically requested navigation review regression is fixed and tested.

The PR remains open and unmerged. Exact-head GitHub review status and resolved thread IDs are recorded in review-state.json.
