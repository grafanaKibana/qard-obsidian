# Shared shadows, resume insets and Recent lessons hover

Latest source `f23227d1a4afd88df0694fe262734ace2441377b`. Baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Four shared elevation roles replace inherited broad shadows and one-off depth values: selected control, card/callout surface, floating tools/menus, and dialogs. Each has light/dark black-shadow values. Map navigation and controls, pickers, jobs, repair/group menus, selected graph nodes, study faces, plans, wait cards and callouts use the matching role. Focus/mask outlines retain their existing non-elevation behavior.
- Map tools use the tighter 4px/12px floating level. Study cards and callouts share the subtle 2px/6px surface level. Composite row buttons explicitly suppress their own shadow so only the outer callout casts one.
- The Learn-only zero-padding override is removed. Resume, course, proposal/update and saved-session callouts share the 16px horizontal inset. Static mapping callouts use the same padding token and leave spacing to their parent stack. Plain Today rows keep their established flush alignment.
- Recent lesson hover colors the entire composite row, including the gap and delete area. Its main button stays transparent; its delete control retains stronger feedback. Canceling the delete confirmation preserves the row.
- All 48 browser cases passed in both themes across 320, 390, 640, 768, 1100 and 1440px panes, including a narrow pane in a wide window. They cover all shadow levels, light/dark parity by role, toolbar/control/panel depth, callout insets, no nested button shadows, full-row hover and dialog cancel, study/wait/plan/task surfaces, related library callouts and overflow.
- CSS formatting, CSS lint, build, release verification and the scoped design scan passed. Runtime code and the preceding 767-test suite are unchanged; no test cases were added.
- 49 existing browser-after screenshots are refreshed. The three affected fixture baselines are recaptured on main. The unchanged lesson-plan fixture and prior native Mermaid/create-boundary scenes remain retained. Total stays 52 pairs; no screenshot examples were added.
- The isolated Obsidian build is updated and current working plugin/global Obsidian files are preserved by before/after hashes.

## Prior verification

# Plot direction label correction

Latest source `864416e4ae14ad8d00039c193fde598ab487a220`. Baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Removed the unintended 20% leading inset. Harder aligns with the left plot edge; Easier stays at the right edge.
- All 16 browser cases passed in both themes across 320–1440px panes, including a narrow pane in a wide window. They verify both label edges, zero leading padding, five-point/category alignment and overflow.
- CSS formatting, CSS lint, production build and release verification passed. This is one CSS deletion; runtime code and the preceding 767-test suite are unchanged.
- Both existing completed-session comparison pairs are refreshed. The isolated Obsidian build is updated and protected files are preserved. Gallery remains 52 pairs.

## Prior verification

# Session outcome alignment and course padding verification

Latest source `0d823c2735d82c4c04a22a05d8248d218deba12a`. Screenshot baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Plot samples and summary cells use five equal-width columns in the same order: Skipped, Again, Hard, Good, Easy. Every point is centered above its label. The curve retains full-width edges.
- Skipped has its own muted point and participates in the plot scale. Percentages retain the shared outcome denominator. Median calculation still uses rated answers only and is positioned in the shifted rating columns. Direction labels describe the rated region.
- Skipped-only and unrated Cram outcomes show their real skipped count and zero rated counts without inventing a median. Empty sessions still omit the chart.
- Course rows restore the shared horizontal row inset. The flush-padding override now applies only to other Learn summary rows. Neutral course styling and Today alignment remain intact.
- All 40 browser cases passed across 320, 390, 640, 641, 768, 1100 and 1440px panes, plus a narrow pane in a wide window, in both themes. They verify point/label alignment, five category counts, peak scale, full-width path, median placement/absence, repeat-tooltip resize recovery, action layout and overflow, course padding and neutral styling, and preserved lesson alignment.
- Full check passed with 767 tests in 95 suites, formatting, typecheck, source lint, CSS lint, production build and release verification. Existing chart/skipped-session cases now cover the fifth point and skipped-only plot; no test cases were added.
- Four existing main-to-latest pairs were refreshed; gallery remains 52 pairs. The isolated Obsidian build was refreshed and current working plugin/global Obsidian files were preserved using before/after hashes.

## Prior verification

# Learning rows and objective metadata verification

Latest source `f6372bb5c11e89455a18394b9c84fd47c19ce284`. Screenshot baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Wrapped suggestion actions use two equal grid tracks across the full row at 800px and below; single-action states span both tracks. Desktop actions retain their centered placement beside the question/answer body.
- Today flat rows and Learn summary rows remove horizontal padding so content aligns with headings. Nested topic structure and activity rows outside Learn retain their established layout.
- Learn course rows return to transparent resting surfaces and neutral borders/colors. Their neutral hover remains visible; lesson/update category colors remain intact.
- Objective metadata starts with the status pill; date and a neutral info icon sit at the trailing edge. The icon title/label preserves the exact latest evidence message or No evidence yet. Full-width titles no longer contain a pill or hidden status-sizing scaffold. Due-date and filtering semantics are unchanged.
- All 56 browser cases passed across 320, 390, 640, 800, 801 and 1100px panes, plus a narrow pane in a 1440px window, in both themes. They check equal/full-width suggestion actions, desktop vertical centering, row/heading alignment, neutral course surfaces, evidence tooltips and title width, and overflow.
- Full check passed with 767 tests in 95 suites, formatting, typecheck, source lint, CSS lint, production build and release verification. The final CSS corrections passed formatting, CSS lint, build/release checks and complete browser confirmation. No test cases were added.
- Eight existing main-to-latest comparison pairs are refreshed; gallery remains 52 pairs.
- The isolated Obsidian build was refreshed and current working plugin/global Obsidian files were preserved using before/after hashes.

## Prior verification

# Lesson questions, suggestions and pending operations verification

Latest source `bb86bda99c6ba6562fa9de10451180437ef1098f`. Screenshot baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Question headers restore the original label-left / maximum-marks-right structure for lesson checks, diagnostics, retention checks and practice tests. Answer hints are removed. Mark values and scoring data are unchanged.
- Suggested lesson/test cards put destination metadata above the question. Shared grid rows give text all available width. At 800px and narrower actions move below the answer; above the breakpoint they are centered vertically beside the body. Spacing uses existing design tokens and separators remain only between cards.
- Pending AI cancellation uses the same filled 14px square and shared stop-button styling across JobControls, answer generation, source-update suggestions/batches and card improvement. RunningJobs already uses that square. Accessible names/tooltips and cancellation callbacks are retained. Form/dialog dismissal is unchanged.
- All 54 browser cases passed across 320, 390, 800, 801, 1100 and 1440px viewports/panes, in both themes. Checks cover restored marks and alignment, suggestion metadata order and action placement on both sides of the breakpoint, overflow and action content fit, and square-only stops/red hover for checking, wrapping, retry, waiting and drawing.
- Full check passed with 767 tests in 95 suites, formatting, typecheck, source lint, CSS lint, build and release verification. Existing mark-header/recap assertions were extended and text-based Cancel selectors updated; no cases or test files were added.
- Thirteen existing main-to-latest pairs are refreshed. Completed suggestion captures focus on the changed section; gallery remains 52 pairs.
- The isolated Obsidian build was refreshed and current working plugin/global Obsidian files were preserved using before/after hashes.

## Prior verification

# Full-width search and topic hover verification

Latest source `36c2aef14ba91a3efb2236a462d22c144f53d73c`. Screenshot baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Removed the library search maximum width and its redundant compact override. Search uses all remaining width beside filters and topic controls, and fills wrapped rows.
- Removed inline padding from the topic library toolbar so text and search align with the content edges.
- Topic-heading hover uses the same shared soft surface as deck rows across the entire row. The main disclosure button stays transparent over it; individual icon controls retain the stronger shared control-hover surface.
- All 32 browser cases passed across 320–1440px panes in both themes, including a narrow desktop pane. They verify available-width fill with and without a repair filter, zero toolbar side padding, full row hover, individual action hover, filtering, typography, control styling and overflow.
- CSS formatting, CSS lint, production build and release verification passed. No runtime code or test cases changed; the preceding full suite passed 767 tests.
- Eight existing main-to-latest pairs were refreshed without adding examples. Gallery remains 52 pairs.
- The isolated Obsidian build was refreshed; current working plugin files and global Obsidian files were preserved using before/after hashes.

## Prior verification

# Deck and topic search verification

Latest source `f303c63d9e66a45a072d133d84a8c0de35c31457`. Screenshot baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Deck search and Needs fixing share one wrapping filter row. The redundant deck toolbar, All/Matching decks label, underline and filter margins are removed. Search stays at the trailing edge and fills its wrapped row in compact panes.
- Deck and topic search use the existing shared qard-search border, control radius, input typography, control height and 12px horizontal inset. Library-specific borderless, fixed-input-width and radius overrides are removed. Topic controls wrap naturally with the same field treatment.
- All 32 browser cases passed across 320, 390, 600, 601, 768, 1100 and 1440px panes, plus a narrow desktop pane, in both themes. Checks cover padding, border/radius/type parity, input focus styling, wrapping and overflow, deck/topic text filtering, repair filtering combined with text, and clearing/restoring results.
- Full check passed: 767 tests in 95 suites, formatting, typecheck, source lint, CSS lint, production build and release verification. No test cases were added. The final unused filter-margin deletion also passed formatting and CSS lint.
- Six existing comparison pairs are refreshed and two relevant topic-search pairs added, for 52 pairs total. Captions remain outside images and all tables retain at most three examples.
- The isolated Obsidian build was refreshed. Current working plugin and Obsidian files were hashed before and after the isolated installation and preserved.

## Prior verification

# Summary action alignment verification

Latest source `617d68c06d15b69abf2b01cda5512950aa698b66`. Screenshot baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Full-width single-row actions place the review controls at the start and Done at the end, using the existing action gap.
- Compact panes retain the existing full-width two-row action grid.
- All 24 browser cases passed across 320–1440px panes in both themes, including the narrow pane in a wide window, skipped-only and Cram states.
- CSS formatting, CSS lint, production build and release verification passed. Runtime code and the 767-test suite from the preceding revision are unchanged.
- Both existing session-summary pairs were refreshed. The gallery retains 50 pairs. The isolated Obsidian build was refreshed and protected build hashes still match.

## Prior verification

# Session summary refinement verification

Latest source `cbd05c7adb0e8df23dd3c112c97b7a9ad395f0ba`. Screenshot baseline is upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Axis and arrowhead strokes use the same border color and non-scaling 1px width as element separators. Direction labels use the plot metadata size and say Harder and Easier.
- Skipped is now in the ratings row. Skipped is first and includes its percentage. All five cells share the same denominator (rating events plus skips), with vertical separators only between cells. Plot frequencies and median remain based on rated reviews. Direction labels are 4px closer to the plot.
- Review totals including repeats sit beside the peak count above the plot. The row measures its actual available width and switches to an info icon with the full message when the text cannot fit, then restores the text when space returns.
- Compact summary stats now pair each count and label inline, reduce the type size and distribute both pairs across one row. On compact panes, review buttons fill the first row and Done fills the second row. Action heights stretch consistently. Skipped-only and Cram sessions retain a valid count without a false rating plot.
- All 24 browser cases passed across 320, 390, 640, 641, 768, 1100 and 1440px widths, plus a narrow pane in a wide window, in both themes. They verify stroke parity, typography, spacing, skipped data, mobile action rows, page overflow and text-to-icon resize recovery. Skipped-only and Cram states are included.
- Full npm run check passed with 767 tests in 95 suites. Existing skipped-session assertions were updated. Formatting, typecheck, source lint, CSS lint, tests, build and release verification all passed. No new test cases were added.
- The existing two summary comparisons were refreshed. Gallery total remains 50 pairs.
- The isolated test plugin and protected-file hashes are checked before completion.

## Prior verification at `4ea1e1e`

# Session summary refinement verification

Latest source `4ea1e1e5b4d6d704c7f3521abac34359c2b0b3d7`. Screenshot baseline is upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Axis and arrowhead strokes use the same border color and non-scaling 1px width as element separators. Direction labels use the plot metadata size and say Harder and Easier.
- Skipped is now in the ratings row. It has no rating percentage because skipped cards are excluded from rated-review frequencies. The row has a larger gap from the plot and no surrounding separators.
- Review totals including repeats sit beside the peak count above the plot. The row measures its actual available width and switches to an info icon with the full message when the text cannot fit, then restores the text when space returns.
- On compact panes, review buttons fill the first row and Done fills the second row. Action heights stretch consistently. Skipped-only and Cram sessions retain a valid count without a false rating plot.
- All 24 browser cases passed across 320, 390, 640, 641, 768, 1100 and 1440px widths, plus a narrow pane in a wide window, in both themes. They verify stroke parity, typography, spacing, skipped data, mobile action rows, page overflow and text-to-icon resize recovery. Skipped-only and Cram states are included.
- Full npm run check passed with 767 tests in 95 suites. Existing skipped-session assertions were updated. The final CSS alignment correction passed formatting, CSS lint and the complete browser confirmation. No new test cases were added.
- The existing two summary comparisons were refreshed. Gallery total remains 50 pairs.
- The isolated test plugin and protected-file hashes are checked before completion.

## Prior verification at `9b11b13`

# Session summary verification

Latest source `9b11b132d5b3d93ea3bde05bece418f96e0d2c20`. Baseline is upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- The curve and filled region now span the full 480-unit plot width. The median uses the same updated coordinates.
- Both arrowheads attach to the horizontal plot axis. Direction labels follow the plot and have a separator below them.
- Rating cells distribute with space-between, equal horizontal insets and centered content. Percentages align vertically with counts, and the rating row ends with a separator.
- Summary metrics stay on one line and use a smaller font at compact widths.
- All 32 browser layout cases passed across 320, 390, 640, 641, 768, 1100 and 1440px widths, plus a narrow pane in a wide window. Both themes were checked with regular and larger metric text. Checks cover curve/fill bounds, axis markers, row order, separators, cell alignment, nowrap statistics and page overflow.
- Full npm run check passed with 767 tests in 95 suites. The existing median-coordinate tests were adjusted. Formatting, TypeScript, lint, CSS lint, build and release checks passed. No test cases were added.
- Two refreshed main-to-latest screenshots replace the existing mobile and desktop summary examples. The gallery remains 50 pairs.
- The isolated test plugin installation and protected-file hashes are verified before completion.

## Prior verification at `52ce8c5`

# Content width verification

Latest source `52ce8c5c7b39957377403405aa0c1aded1ff7507`. Screenshot baseline is upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Removed the 72ch cap that still narrowed Markdown paragraphs, lists and quotes in lessons, lesson plans, lesson summaries, and practice-test goals while code blocks used the full width. Removed the separate 48ch cap on the Learn and Practice tests library descriptions.
- Isolated Obsidian reproduced the issue at `e3e3526` with a 725.6px paragraph beside a 1340px code block. The corrected build renders paragraphs, lists, quotes and code blocks at 1340px using the same fixture and native Markdown renderer.
- All 84 browser cases passed across 320–1440px panes and both themes, including a narrow pane in a wide window. Cases cover lesson steps, plans, summaries, practice-test goals, study cards, previews and library descriptions. Width measurements account for block indentation and check for horizontal page overflow.
- Full npm run check passed with 791 tests in 96 suites, plus formatting, typecheck, lint, CSS lint, build and release checks. Layout and typography scans returned no findings.
- The lesson, lesson summary, and Learn screenshots were refreshed against main. The gallery remains 50 pairs.

## Prior verification at `e3e3526`

# Study results, questions and task controls

Latest source `e3e35267e8182a570be8a212c2af2e759252b060`. Baseline is upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Study card and preview prose fills the content area. Long-form lesson and document prose keeps its reading measure.
- Completion header aligns title and metrics in one row when they fit. The chart uses the study card's desktop width. Plot axes and difficulty labels share the same edges, rating labels align with points, and the dashed line marks the median. Review actions use shorter labels.
- The diagnostic help is a native disclosure with a bare info icon and the original hover text. The question prompt uses medium weight and answer content uses normal weight.
- Running task rows use the compact inset for padding and gap. Active wait panels center the cancel icon beside the text and retain recovery controls for stalled jobs.
- All 84 focused browser cases passed at 320, 390, 768, 1100 and 1440px pane widths plus a 390px pane in a wide window, in both themes. Checks cover actual card and preview text bounds, prose measure, chart axes and rating columns, header alignment, question font weight, diagnostic disclosure, task padding and inline cancellation.
- Formatting, typecheck, ESLint, CSS lint, 791 tests in 96 suites, build and release checks passed. Impeccable layout and typography scans returned no findings.
- Sixteen refreshed main-to-latest screenshot pairs include two new completed-session examples. Other comparisons retain prior captures.
- The isolated Obsidian installation matches the built plugin. Protected file hashes match the pre-change snapshot.
- The hosted review service reported its usage limit. GitHub has no unresolved review threads.

## Prior verification at `2acdfc5`

# Sidebar breakpoint verification

Latest source: `2acdfc5d12dd66b2271a4c200bf3242ceb8dc6c9`. Baseline remains upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Moved Create & study content centering into its existing 600px compact layout rule. The prior 640px override incorrectly centered full-width sidebar buttons from 601px through 640px. No markup, colors, or behavior changed.
- Reproduced 16 failures at 601/620/639/640px across themes and wide-window/narrow-pane configurations before editing.
- After correction, all 52 browser geometry cases pass at 320, 390, 599, 600, 601, 620, 639, 640, 641, 768, 820, 821 and 1100px, in both themes and regular/wide-window configurations. Button content fits, heights match and sidebar icons align.
- Full npm run check passes: format, TypeScript, ESLint, CSS lint, 791 tests in 96 suites, build and release checks. Bounded mechanical layout scans before/after returned no findings.
- One fresh main-to-latest sidebar comparison at 620px dark replaces a redundant desktop library comparison. Total remains 48 pairs / 96 images. Other capture widths fall outside the changed 601–640px interval; their unchanged images are retained. The separate pre-fix reproduction image is local evidence only, never a PR before image.
- Latest build installed/reloaded only in the isolated Obsidian profile/vault. Protected DevBook/application files and isolated-install hashes are verified before completion. Browser fixtures do not constitute physical-device testing.

## Prior task-state verification, source 46caf39

# Main-to-latest verification

Latest source: `46caf39bd24f14785e868d4d033bc98f6b689c9f`. Baseline: upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

- Full `npm run check`: formatting, typecheck, ESLint, CSS lint, 791 tests in 96 suites, build, release checks passed. Final CSS-only radius correction also passed formatting/CSS lint.
- 86 focused browser cases passed: initial checking, retry checking, wrapping, missing wrapping job recovery, completed suggestions and Today rows across 320/390/768 touch panes, 1280/1440/1920 desktop panes and a 390px pane inside a wide desktop viewport, in both themes. Also checks agent visibility, exact provider/model tooltips, full-width metadata, cancellation arguments, restart behavior, transparent resting backgrounds, first suggestion without top border, inter-row separators and named note-icon action.
- Four additional browser cases passed for the specific review fix: diagnostic guidance opens by tap/activation and closes again, keeping the exact tooltip. This is a bounded fix for a review comment, not a keyboard accessibility audit.
- Independent read-only review found no actionable task-state or behavior regression.
- 47 browser main-to-latest pairs freshly captured. Unchanged native Mermaid pair retained: 48 comparisons / 96 images. Before images are main, never a previous PR revision. Capture metadata and SHA256 hashes are in capture-manifest.json.
- Browser fixtures use real components/CSS with deterministic mocked services. These are responsive browser checks, not physical-iPhone validation or live AI requests.
- Latest build installed/reloaded only in the dedicated Obsidian test vault/profile; no review harness plugin loaded. Current-turn protected-file hashes are verified separately before completion.
- Known fixture issue corrected before final captures: round20 initially lacked the shared network SVG; copied fixture asset and recaptured masks. Baseline checking crop uses a selector present on main and latest.
- Fresh hosted automated review may still be pending; no clean-review claim for this head until it finishes.
