# PR #11 — responsive navigation state and compact actions

Source `d6746105734fa7ab44456ad32586f4d560dd5770`; fork-main baseline `70056821914f0dae910b52a20f1fa3329b04d0ac`.

Both audit findings are fixed. Lesson/test step strips reveal the current item on resume/index changes using only their own horizontal scroll offset. Manual scrolling is preserved while the index remains unchanged; the new helper does not move the surrounding page. Real parent deck branches stay mounted, are hidden when collapsed on desktop, and remain available in compact panes; widening restores the existing collapsed state. Virtual parent rows retain their fold behavior. Whole-row real-deck navigation and subtree study actions are preserved.

Resume rows measure intrinsic label/title/course widths. A short title places course context vertically centered beside the chevron; a long title retains its full row and ellipsis. Resize observers handle pane/font/content changes and disconnect on cleanup. Compact lesson Check fills its row; Ask remains a separate compact input action. Drawing/redrawing cancellation is a named icon at the end of the status row; overdue warnings and cancellation remain functional. The Study time legend now uses contained horizontal scrolling with complete items instead of wrapping/distributed spacing.

`npm run check` passed: 780 tests across 96 suites, formatting, TypeScript, ESLint, Stylelint, production build, and release checks. New regressions cover lesson/test resume and bottom Next, manual scroll preservation and outer-scroll isolation, persistent deck branches/navigation, measured short/long resume fit and cleanup, compact figure cancellation and overdue guidance. Independent review found no actionable issues.

264 integrated light/dark pane/device scenarios passed without runtime errors, unintended main horizontal overflow or sampled out-of-bounds panels. Intended strip/legend/table scrolling remains contained.

66 focused assertions passed across 320/375/390/600/768/1100px and light/dark themes. They verify late-step visibility, full-width compact Check, inline cancel alignment and naming, one-row scrollable legend, short/long resume fit/ellipsis containment, desktop collapse → compact child access → restored desktop collapse.

37 matched main-to-latest screenshot pairs captured without runtime errors. Learn shows short and long resume titles; nested deck comparison performs desktop collapse before narrowing; a new late-step resume example verifies active item placement. Check-first examples retain the removed-helper comparison. All pairs use identical content, actions, theme, pane, clock and typography. No intermediate revision comparisons; two equal image columns and at most three examples per group.

The verified build is installed only in isolated Obsidian. Native checks confirm active step visibility, 34px Ask controls, 358px full-row Check/footer actions, a 76px Ask action and preserved centered placeholder. Temporary in-memory lessons and pane-width override were removed; app returned to Learn. Test plugin files match the build. DevBook plugin, global Obsidian configuration and installed app hashes remain unchanged; isolated app stays open.

No development server started. Mobile validation uses browser/touch/pane simulation, not physical iPhone/Safari. Keyboard accessibility remains outside scope. Detector output retains only the three pre-existing semantic message/answer side-border warnings. One combined inspection, one correction for long-title ellipsis, and one confirmation completed the visual pass.
