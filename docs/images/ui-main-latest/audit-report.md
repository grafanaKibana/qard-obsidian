# PR #11 — code review fixes

Source: `e1ea1e7cf6bf52646f27b53a475ac2607f8e45fc`. Baseline: fork main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

Addressed all outstanding review threads. The earlier real-parent compact expansion finding was already fixed in d674610 and was verified before resolution. Two further fixes are included in this commit:

- StudyCard retains face containers but mounts Markdown/CardContent only in the active face, including an initially revealed card. Hidden faces no longer trigger zero-width Mermaid layout. Active-face height, basic/cloze/image behavior and renderer cleanup are preserved.
- Virtual parent groups, which have no detail route, retain Deck options and Rename group through a compact More menu. Real compact decks keep streamlined controls. Desktop management remains inline. Menu actions do not open/fold the deck accidentally. A nested rename dialog owns cancellation while open; pending operations and eventual errors survive Escape.

`npm run check` passed: 784 tests in 96 suites, formatting, TypeScript, ESLint, Stylelint, build and release checks. Final CSS lint/build passed. Regression tests cover both face directions, initially revealed state, unchanged-state render stability and cleanup, sibling-cloze undo behavior, group management callback identity and deferred rename errors.

264 integrated light/dark pane/device scenarios passed without runtime errors, unintended main horizontal overflow or sampled out-of-bounds panels.

16 rendered management assertions passed at 320/390/1100px in both themes: compact menu containment and stacking, native rename dialog, options screen, no real-deck navigation, desktop menu hidden and inline options retained.

Real Obsidian Mermaid validation uses the actual public Markdown renderer through a temporary isolated test harness. Each phase uses its own Qard source/CSS, with the installed Qard stylesheet temporarily disabled and restored. Main renders hidden content into a measurable 308px target. Latest does not mount hidden answer Markdown; first reveal renders Mermaid in a visible 324px target, producing all 3 nodes. The diagram is 207.1×278px and readable within the 390px pane. Harness plugin, globals, DOM, render interception and temporary styles are unloaded/restored; its two owned files are removed.

39 main-to-latest screenshot pairs: 38 matched browser fixtures plus one native Mermaid pair. The new compact group menu and real diagram examples are included in existing relevant groups, with at most three examples per group, two equal columns and full-resolution links. Main’s virtual-group actions are inline; the latest example opens its compact menu to show the equivalent actions. No intermediate revision serves as before.

The isolated plugin install matches the final source build and is reloaded on Learn. DevBook plugin files, global Obsidian configuration and installed app hashes remain unchanged. Separate test app remains open; no development server started. Mobile coverage is simulated pane/touch input, not physical iPhone/Safari.

GitHub code review completed at 2026-11-10T09:24:39Z for exact source e1ea1e7cf6bf52646f27b53a475ac2607f8e45fc with has_any_findings:false and has_unresolved_findings:false. All 6 review threads are resolved; no review was dismissed to clear findings. Hosted pull-request workflow runs were absent for this fork head, so test claims refer to local checks and isolated/browser validation.
