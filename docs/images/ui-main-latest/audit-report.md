# PR #11 — waiting checks, question flow and plan details

Source: `e8749bb0c4f8ec7b7d47234f4e496a39ba873e98`. Baseline: fork main `70056821914f0dae910b52a20f1fa3329b04d0ac`.

Latest refinements:

- While-you-wait activity chip reads Check. Its content retains the full check heading and switching behavior.
- Removed the redundant lesson-probe introduction, as requested.
- Plan details show seven read-only weekday initials. Existing spacing, metadata, radius and theme tokens define neutral/rest and selected/study appearances. Full weekday and status remain in tooltips. On the narrowest panes, the intact seven-day row wraps beneath Study days instead of overflowing.
- Question borders occur only between adjacent question articles. This also covers marked checks with an outcome inserted above the first question.

`npm run check` passed on this source: 784 tests in 96 suites; formatting, TypeScript, ESLint, Stylelint, build and release checks. The existing waiting-activity test was updated to require the short Check label and retains switching coverage. Independent read-only source review found no actionable regressions.

18 focused rendered cases passed in light/dark themes at 320/390/1100px: first question has no border, second retains its separator, probe introduction is absent, waiting Check chip has no title suffix, weekday initials/order/selection/rest styling match the saved plan, and content stays within the pane with no unintended horizontal overflow.

40 browser screenshot pairs freshly captured from main/latest, including the probe and waiting-check flows, without runtime errors. All latest captures have no unintended main horizontal overflow. Main retains the pre-existing nested-deck and Study time overflow visible in those comparisons. Plan fixtures use Monday–Friday in both phases so neutral and selected weekday states are visible.

The unchanged native Obsidian Mermaid pair is retained from the previous verified source e1ea1e7: StudyCard, Markdown and applicable native-card styles are unchanged. The capture manifest identifies this retained scene explicitly. Together there are 41 pairs, 82 images, equal before/after columns and no more than three examples per group. No intermediate revision is used as before.

Earlier verification on e1ea1e7 covered 264 integrated responsive scenarios, 16 rendered group-management checks, and real Obsidian Mermaid rendering. These are prior-head evidence, not additional freshly rerun cases. Latest-head verification is stated above.

The new build is installed and reloaded only in the isolated Obsidian test vault, returned to Learn. Test plugin files match the build; DevBook plugin files, global Obsidian configuration and installed app hashes remain unchanged. Separate test app remains open; no development server was started. Phone coverage uses simulated touch/pane input, not physical iPhone/Safari. Keyboard accessibility remains outside the visual audit.

All six review threads remain resolved. The latest automated review state reported by GitHub is saved in review-state.json with its source commit; the current local source review found no issues. The PR remains open and unmerged.
