# Figma handoff — UniEnabler 2.0 v0.1

This is a **Figma-ready spec**, not an actual `.fig` or a remote Figma file. The sample screens are implemented in React Native with matching tokens so a designer can replace visual details without redesigning the backend.

## Frame set

Use a **390 × 844 px** mobile frame, 4-column layout grid with 20 px side margins. Make one page named `01 · UniEnabler Demo` and frames:

1. `01 Home`: welcome, demo disclaimer, upcoming/high-demand summary tiles, quick links, top-priority task.
2. `02 Facilities & Routes`: unverified disclaimer, feature chips, facility cards, origin/destination, synthetic route summary.
3. `03 Plan`: activity list and `03b Add Activity` modal/detail variant with demand and numeric priority.
4. `04 Communicate`: 2-column phrase cards; selected enlarged message panel; TTS placeholder.
5. `05 Sensors (experimental)`: simulation controls, EWMA/average cards, latest readings.

All pages include the `UniEnabler 2.0` header, **DEMO** marker and persistent bottom tabs. No real map screenshot, campus wayfinding overlay or accessibility guarantee may be shown with dummy data.

## Color tokens (same as `apps/mobile/src/theme.ts`)

| Token | HEX | Use |
|---|---|---|
| Ink | `#142C3C` | Main typography |
| Muted | `#526778` | Secondary text |
| Primary | `#0C6A61` | Main actions and selected states |
| Primary light | `#E7F5F1` | Selected chip, quick-stat tile |
| Blue | `#285AC5` | Navigation/secondary emphasis |
| Blue light | `#EAF0FE` | Info card backgrounds |
| Purple | `#6144A5` | Communication-card accents |
| Purple light | `#F0EAFA` | Selected phrases |
| Amber | `#995511` | Unverified/demonstration warnings |
| Amber light | `#FFF3DE` | Warning surfaces |
| Background | `#F5F7FA` | App canvas |
| Paper | `#FFFFFF` | Card surfaces |
| Border | `#D9E2E8` | 1 px outlines |

## Component library

- `App Header`: 76px height, initials logo, 2-line title, DEMO badge.
- `Bottom Navigation`: 5 tabs, at least 44×44px touch targets (current code uses ~58px height).
- `Card`: radius 18, 1px border, 18px padding; avoid unnecessary shadows.
- `Primary Button`: minimum 48px height, radius 12, bold 15px.
- `Selection Chip`: minimum 44px height, selected outline plus filled background.
- `Body`: 15px font, 22px line height; `H1`: 27px bold; `H2`: 19px bold.
- `Warning Banner`: amber surface and text reading *unverified* in words, not color alone.
- `Activity`: name, date and time, demand badge and numeric priority separately.
- `Data card`: label + value + context + units; do not use unjustified health/safety thresholds.

Use Figma Auto Layout for cards, tabs and forms; create component variants for active/inactive, loading, disabled and error; ensure content still fits 200% text zoom. Test meaningful accessibility labels and reading order. Prefer simple icons with readable text labels rather than icon-only controls.

## Handoff acceptance

Figma designs should give each screen a keyboard/screen-reader flow, empty/loading/error states, and an explicit route-disclaimer state. Designer owns visual revisions, developer owns translation into `theme.ts` and reusable `UI.tsx` components; agree on names before coding.
