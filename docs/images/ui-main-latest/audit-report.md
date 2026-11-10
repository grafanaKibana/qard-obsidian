# Upstream PR #17 — question metadata and diagnostic guidance

Source: `7421ae04a978b9a073f942f3f4802c36cb53a3d4`. Baseline: upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

Active common questions and practice-test questions place Question X and Choose an answer/Write an answer in the same metadata row with space-between. Both labels inherit one metadata font, normal weight, line height and color. Scored mark counts remain beside the question label. Answer instructions are absent when inputs are locked.

The lesson diagnostic header has an info icon before Diagnostic. Its native tooltip preserves the complete user-supplied explanation. The existing learning-stage UI presentation pattern was reused; diagnostic questions hide mark counts through an optional showMarks prop, while scored questions preserve their default marks. No grading/service behavior changed.

Full `npm run check` passed: 786 tests in 96 suites, formatting, TypeScript, ESLint, Stylelint, build and release checks. The layout detector returned no findings. Independent source review found no actionable issue.

56 rendered cases passed across diagnostics, checks, practice tests and lesson questions in light/dark themes at 320px touch, 390px touch, 768px touch, 1280px laptop, 1440px laptop, 1920px desktop and a 390px desktop split pane. Checks prove identical computed font/color, same-line alignment, alignment at opposite metadata-row edges, scored-mark preservation, diagnostic-mark hiding, exact tooltip wording, icon-first placement and no visible explanatory paragraph. No runtime errors or unintended main horizontal overflow occurred.

43 published browser pairs were freshly captured from upstream main/latest. The diagnostic fixture uses an MCQ and a written question in both phases; existing diagnostic/check/practice/lesson examples cover the refinements. The screenshot count remains 44 pairs/88 images including the unchanged native Mermaid pair. Two equal columns, at most three examples per group, no intermediate revision as before. Earlier 196 page and 36 row/action cases were verified on af6f472; those unchanged paths are prior-head evidence, not additional current reruns.

The final build is installed only in isolated Obsidian. DevBook, global configuration and the installed app are outside task writes, with protected hashes checked against this turn's baseline. The separate test app remains open. Mobile coverage is browser touch/pane simulation, not physical iPhone/Safari. Keyboard accessibility auditing remains outside scope.

Both earlier upstream review threads are resolved. GitHub review state is recorded with its own exact source commit in review-state.json. The PR remains open and unmerged.
