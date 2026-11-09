# Qard visual system

Status: shared type/control roles and the token foundations below are implemented in #11; this contract defines the remaining visual system and its migration order. Operate mode: Qard is a study workspace inside Obsidian. Preserve Obsidian's fonts, light/dark surfaces, content and familiar controls.

## Ownership

`styles.css` is the token and component-style source. `.qard-app` owns Qard tokens; `.theme-dark .qard-app` owns theme-specific mappings. `DESIGN.md` owns the meaning of those tokens. Components consume roles rather than inventing local values. SVG graph coordinates, data graphics and authored diagrams retain domain geometry.

## Implemented foundations

| Token                   | Value                 | Consumers                                              |
| ----------------------- | --------------------- | ------------------------------------------------------ |
| `--qard-action-bg`      | `#4263dc`             | Primary actions, checked indicators, current exam step |
| `--qard-action-text`    | `#fff`                | Foreground for filled actions/indicators               |
| `--qard-action-hover`   | `#3554c5`             | Filled primary hover state                             |
| `--qard-space-2`        | `8px`                 | Base for action gaps                                   |
| `--qard-space-5`        | `20px`                | Base for standard panel inset                          |
| `--qard-gap-actions`    | `var(--qard-space-2)` | Four wrapping action-group patterns                    |
| `--qard-inset-panel`    | `var(--qard-space-5)` | Three standard panel patterns                          |
| `--qard-radius-surface` | `12px`                | Four standard surface patterns                         |

The extraction preserves existing rendering. Gutter, floating-surface, badge and selected-segment rules below are target conventions; their migration remains pending. Existing typography and control tokens remain authoritative.

## Color roles

Keep `--qard-bg`, `--qard-soft`, `--qard-text`, `--qard-muted`, and `--qard-border` mapped to Obsidian variables. Keep `--qard-blue` as the theme-aware accent (light #4263dc, dark #9aafff) and `--qard-on-blue` as its paired foreground (light white, dark #182040). A glyph painted on the accent always consumes the paired foreground.

Filled primary actions have a separate semantic pair: `--qard-action-bg` (#4263dc), `--qard-action-text` (#fff), and `--qard-action-hover` (#3554c 5). These currently stay the same in both themes. Do not replace filled-action backgrounds with the pale dark-theme accent. State foreground/background pairs (`--qard-ok`, `--qard-bad`, `--qard-vague`, `--qard-miss`, `--qard-good` and their `-bg` values) retain their existing theme mappings. Course identity colors remain data, not action colors.

## Type roles

| Role     | Existing token      | Default                              |
| -------- | ------------------- | ------------------------------------ |
| Page     | --qard-font-page    | 24px / 600 / 1.25                    |
| Section  | --qard-font-section | 15px / 600 / 1.4                     |
| Body     | --qard-font-body    | 15px / 400 / 1.5                     |
| Metadata | --qard-font-meta    | 12px / 400 / 1.5                     |
| Control  | --qard-font-control | 13px / 500 / 1.4                     |
| Reading  | --qard-font-reading | host text size, normally 16px / 1.65 |

Use existing host-derived values, not fixed copies. Chart labels, large metrics, graph labels, study prompts, code and diagrams keep explicit data/reading roles. Test enlarged host fonts in populated data screens as well as empty screens.

## Space roles

Use a 4px base with 4/ 8/ 12/ 16/ 20/ 24/ 32/ 48px steps. Primitive tokens use ordinal names (`--qard-space-1` = 4px through `--qard-space-6` = 24px, `--qard-space-8` = 32px, `--qard-space-12` = 48px). Add a primitive only when consumed by a repeated role; this is not a mandate to declare every step now.

Semantic roles: action gaps 8px; field groups 12px; compact panel insets 16px; standard panel insets 20px; section gaps 24px; major-region gaps 32px. Use axis-specific values where necessary. Preserve 2px/ 6px optical spacing inside icons, badges and compact nested controls. Existing 10/ 14/ 18/ 22px values are migration candidates only when their intent duplicates an established role; they are not defects merely because they differ.

## Shape and density

| Role                          | Contract                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| Ordinary control              | 7px radius, minimum 34px, 6px block / 12px inline padding   |
| Primary control               | ordinary geometry; 17px inline padding allowed for emphasis |
| Nested segment                | 5px inner radius, 7px outer radius; 2px wrapper inset       |
| Standard surface              | 12px radius; 16px compact or 20px standard content inset    |
| Floating surface              | 10px radius; content-specific inset; pane-constrained width |
| Compact deck identity carrier | equal 36px carriers share 6px radius                        |
| Large deck identity carrier   | 48px carrier / 14px radius remains explicit variant         |
| Pills/counters                | 999px radius                                                |
| Circular indicators           | 50% radius                                                  |
| Underline navigation          | 0 radius                                                    |

Keep compact row actions distinct from ordinary form controls. On coarse-pointer devices ordinary actions use 44px minimums. Composite controls must define their density on the interactive child, not count wrapper padding as the child's size. Preserve data-cell, chart-bar, mask and resize-handle geometry.

## Surfaces and elevation

Use borders for persistent panels. Use a single selected-segment elevation across Session, Map/List, periods and Plans. Floating menus/popovers use a separate surface elevation. Dialog elevation is separate again. Existing segment shadow variants are pending migration; do not preserve different shadows for the same selected role.

## Responsive shell

All embedded surfaces respond to the Qard pane, including MacBook split views. Viewport queries are reserved for host/platform behavior, not pane layout. A popover's maximum width is constrained by the pane and edge clearance; `vw` alone is insufficient.

Adopt a shared workspace gutter: 16px in compact panes (up to 600px), 24px in medium panes (601–960px), 28px in wide panes. Navigation, page heading and ordinary content align to that gutter. Reading columns may have an independent maximum width (normally 680–720px), centered inside the shared shell; graphs and tables may use wider regions. Existing 16/ 18/ 22/ 28/ 36px shell variants need migration before claiming unified gutters.

Breakpoints express composition: 600px for compact stacking, about 760–820px for existing multi-column editors, 960px for map detail beside the canvas. Preserve an existing threshold until its content demonstrably fits a common threshold. Do not standardize breakpoint numbers without checking layout.

Tables retain useful columns through local horizontal scrolling or a responsive record presentation; page-level overflow is a defect. Toolbars and action rows wrap. A narrow pane in a large window follows the same geometry as an equally narrow phone pane, with density chosen by input mode.

## Verification and migration

Validate light/dark at 320, 375, 430, 768 and 1280px panes, plus 390px inside a 1440px window. Include empty/populated screens, long titles, open popovers, forms, maps, and enlarged host fonts. Use actual iOS/Safari and macOS runs before claiming physical-device compatibility; desktop viewport emulation establishes responsive geometry only.

Extraction must preserve computed values and sampled screenshots. Visual fixes require matching before/after screenshots in the single UI PR, grouped by role with no more than three examples per group. Priorities: contain period/table/popover overflow; unify shell gutters; unify selected-segment elevation and equal-size badges; migrate remaining equivalent surfaces and density overrides. Do not add a token for a one-off value or build a generic component layer without repeated evidence.
