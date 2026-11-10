# Combined visual refinements — PR #11

Fork main `70056821914f0dae910b52a20f1fa3329b04d0ac` compared with source `9aec6249abba6e17e39c31b53ab19223af614aa2`.

Implemented the three preceding audit findings and the four requested refinements. Today checks and lessons group under course subheadings, keyed by course file identity. Status and title stay inline with a trailing action. Rows no longer repeat course labels. Check readiness, retries, teaching, and original order inside each course are preserved.

Mobile deck rows reclaim management-button space, remove chevrons, retain Study, and use the deck button's stretched hit area to open through row padding. Desktop management actions remain separate. Virtual parent rows retain branch folding, with plus/minus disclosure on desktop. Compact row/badge gaps match 12px insets; desktop row/badge/action gaps match 16px insets. Shallow nesting remains.

Ask fields use symmetric vertical padding derived from the control height and current line box. Empty placeholders stay on one line, and entered multiline text can grow with its button. The populated Study time legend wraps complete swatch/label items. Figure redraw gives the field a full compact row, with Redraw/Cancel together below; desktop keeps its inline form. Running figures reuse compact role/info and elapsed/estimate metadata.

`npm run check` passed: 773 tests in 95 suites, formatting, TypeScript, ESLint, Stylelint, production build, and release metadata/install-file checks. The independent source review reported no actionable issues. Twenty targeted queue/deck/figure tests passed before the complete suite.

264 integrated light/dark pane/device scenarios passed with no runtime errors, main horizontal overflow or sampled out-of-bounds panels.

84 focused browser assertions passed across 320/375/390/600/768/1100px, both light and dark: six complete legend items; compact/desktop redraw layout; figure role metadata width; grouped check/lesson labels and inline alignment; one-line empty Ask vertical alignment; multiline growth; mobile deck visibility and full-row hit area; row and badge gaps at least equal to padding.

36 matched main-to-latest screenshot pairs captured without runtime errors. New figure examples cover redraw on mobile/desktop and compact running metadata. Today captures contain two course groups. Study time contains all six activities at 320px. Lesson controls use the same representative question on both revisions. No intermediate PR revision is used as a before image. Maximum three examples per group, two equal image columns, and click-through full-resolution images.

Native isolated Obsidian verification passed: plan/Ask controls 34px; empty placeholder has equal 6.90234px top/bottom padding with an 18.2px line box; Check/Ask widths both 76px; Next step spans the compact row with no top border. Temporary in-memory lessons and the pane-width override were removed; isolated app returned to Learn. Test plugin install hashes match the final source build.

DevBook plugin, global Obsidian configuration, and installed app hashes remain unchanged. The isolated app remains open. No development server was started. Mobile validation uses touch/pane simulation, not a physical iPhone. Keyboard accessibility was outside scope.

The detector retained three existing semantic message/answer side-border warnings; none was introduced by this patch. No further polishing cycle was run after the bounded correction/confirmation pass.
