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
