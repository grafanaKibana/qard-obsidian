# Upstream PR #17 — row spacing and trailing metadata correction

Source: `af6f4726547314e523caf6f174d18387645a0439`. Baseline: upstream main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

Mobile tabs now use space-around. Row stacks own 8px spacing; summary/resume rows and saved-session sections have no extra margins. This removes the saved-session 28px exception and the specificity conflict that let course rows combine margin with grid gap. Empty row stacks do not create spacing.

Source, generated-card and test status labels use the centered trailing rail. Today counts share their explicit 12px normal metadata font and 1.5 line height. Trailing labels remain on one line, with containment for long text. Titles retain their existing measured/truncated behavior.

Learn rows place the independent discard action before the final decorative chevron. Navigation extends its hit area across the row using the established deck-row pattern; discard sits above that hit area. Title clicks and chevron clicks navigate, while discard opens its own confirmation without navigating.

Full `npm run check` passed: 786 tests in 96 suites, formatting, TypeScript, ESLint, Stylelint, build and release checks. Final CSS formatting/lint/build passed after the mobile trailing-label adjustment. The layout detector returned no findings. Independent source review found no actionable regression.

196 page cases passed across 14 screens, seven pane/device configurations and light/dark themes, without unintended overflow. An additional 36 focused cases passed: exact 8px visual gaps across saved/source/Today/test and Learn rows; zero row margins; identical metadata font family/size/weight/line height; centered single-line trailing labels; space-around end/inter-item spacing; swapped delete/chevron geometry and hit targets; actual cancel/delete-isolation and chevron-navigation flows; and multiple-session spacing through the normal notifying session API. An initial fixture-loader check did not notify the UI; it was corrected to use startSession, with no product change required.

43 published browser pairs were freshly captured from upstream main/latest. Existing library and Learn examples cover these corrections; the screenshot count stays at 44 pairs/88 images including the unchanged native Mermaid pair. Two equal columns, no more than three examples per group, no intermediate revision as before. Phone coverage uses browser touch/pane simulation, not physical iPhone/Safari. Keyboard accessibility auditing remains outside scope.

The final build is installed only in isolated Obsidian. DevBook, global configuration and the installed app are outside task writes, and protected hashes are checked against this turn's baseline. The separate test app remains open.

Both earlier upstream review threads remain resolved. Review status is recorded with its exact commit in review-state.json. The PR remains open and unmerged.
