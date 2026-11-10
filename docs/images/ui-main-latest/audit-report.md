# Upstream PR #17 — shared page geometry and library interactions

Source: `3afe5074b83e72f2b066aacfc13b98cc374376e3`. Baseline: upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

Pages share a 1440px maximum and responsive 16/24/28px horizontal gutters, with 24px top and 48px bottom padding. The old 680/720/860/1040/1100/1240px page/container caps were removed. Study, summary, study editor and source updates use the same geometry. Chart, image and overlay-specific sizing remains independent. Long Markdown prose uses a 72ch measure, with front-card question blocks centered. Scrollbar gutter space is stable on all routes.

Deck search focus no longer draws an outline. All decks, Today and saved-session copy share their horizontal start. Saved-session discard and trailing chevrons use the same inset and action width, including coarse pointers. A hovered deck badge gains a stronger subject tint; its individual action buttons gain a distinct local hover background instead of blending into the row.

`npm run check` passed: 784 tests in 96 suites, formatting, TypeScript, ESLint, Stylelint, build and release checks. After the final CSS corrections, formatting, CSS lint and build passed again. The Impeccable layout detector returned no findings before or after.

196 final rendered cases passed: 14 screens across seven pane/device configurations in light/dark themes. Configurations are 320px touch, 390px touch, 768px touch, 1280px laptop, 1440px laptop, 1920px desktop, and a 390px desktop split pane. Screens include library, builder, create, Plans, tests, new test, Today, Learn, lesson, usage, Study time, statistics, source updates, and study. Checks cover consistent page caps/padding, expanded inner containers, no unintended overflow, library text/icon alignment, search focus, and separate row/badge/action hover states.

The first combined pass exposed an old mobile study-padding override. Independent source review also found the widened card's centered prompt block needed its own centering. Both were corrected; all 14 study device/theme cases were confirmed, including prompt center position. The final results combine these corrected study cases with the 182 unaffected passing page cases. Original first-pass results remain in local evidence.

43 browser main-to-latest screenshot pairs were freshly captured without runtime errors; all latest main containers fit. Main retains its existing nested-deck and compact Study time overflows. Learn/deck desktop fixtures now use 1440px to show page-width differences. Library interaction examples click search and hover a deck/action. Study-page comparison shows the full shared laptop width and centered prompt.

The unchanged native Mermaid pair is retained from e1ea1e7. Renderer and card implementation are unchanged; the new prose maximum exceeds the 324px target, leaving that native example's layout unchanged. The capture manifest identifies this retained scene. Total: 44 pairs, 88 images, equal before/after columns, at most three examples per group. No intermediate revision is used as before.

The final build is installed only in the separate Obsidian test vault and returned to Learn. The test app was reopened using its isolated profile. No writes targeted DevBook, the installed Obsidian app or global configuration. Current protected-file hashes are recorded and preserved during final publication.

Phone coverage is browser touch/pane simulation, not physical iPhone/Safari. Keyboard accessibility was outside scope. Upstream PR #17 remains open and unmerged. GitHub code review completed at 2026-11-10T14:34:25Z on this exact source commit with no findings and no unresolved findings. The review ran in fork PR11, which has the same source head and main baseline as upstream PR17. Upstream has no unresolved review threads. review-state.json records the precise review provenance; independent source review confirmed the final corrections.
