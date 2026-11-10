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
