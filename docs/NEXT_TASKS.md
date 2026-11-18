# Next tasks for Codex / Claude (small, reviewable PRs)

Keep the current repo **skeleton-first**. Do not implement every feature at once.

## Phase 0 — Initial review

- [ ] Run Node tests: `npm test`
- [ ] Install packages: `npm install`; run `npm run typecheck`
- [ ] Start API, open Expo app, test all 5 screens
- [ ] Run VoiceOver / TalkBack, hardware keyboard and 200% text-size checks
- [ ] Confirm intended pilot campus area, data collection method, who can verify surveys

## Phase 1 — App UI / Figma

- [ ] Export/author Figma frames matching `FIGMA_HANDOFF.md`
- [ ] Add loading, error, empty states and consistent screen-reader focus order
- [ ] Add adjustable typography, icon + label pairing, accessible button sizes
- [ ] Convert Plan form date and time text inputs into accessible native pickers
- [ ] Implement a real show-or-speak TTS using approved `expo-speech` and test language settings

## Phase 2 — Mapping

- [ ] Design schema for survey evidence: location, date checked, surveyor, feature, photo URI, verification state
- [ ] Verify one small NUS area on-site before enabling any real route
- [ ] Separate reviewer approval from data entry; only approved verified links enter graph
- [ ] Add link attributes: stairs, gradient, width, lift operational status, shelter, temporary barriers
- [ ] Add geographic coordinates and actual map only after evidence/data permissions are checked
- [ ] Add tests ensuring unknown/stale/unreviewed links always fail closed

## Phase 3 — Activities

- [ ] Compare all Java CLI activity edge cases with API rules
- [ ] Add editable activity, schedule conflicts, date/time and timezone handling
- [ ] Add list/demand/priority sort UI, search, recurrence, preferences if requested
- [ ] Move from development JSON store to real database with migrations and authentication

## Phase 4 — Independent sensors

- [ ] Teammate defines sensors, units, permissions, sample rate and research purpose
- [ ] Implement a physical `SensorAdapter`, calibrate, test disconnected/offline states
- [ ] Compare baseline EWMA to their algorithm with test fixtures and evaluation metrics
- [ ] Apply privacy, consent, retention controls before collecting real measurements
- [ ] Build optional screen integration without blocking Mapping or Planner PRs

## Suggested GitHub issues / branches

- `ui/figma-home-and-navigation`
- `api/verified-route-data-contract`
- `mapping/survey-schema-and-review`
- `planner/activity-edit-and-validation`
- `sensor/device-adapter`
- `sensor/algorithm-experiments`
- `quality/accessibility-smoke-tests`

## Milestones from kickoff presentation

- 7 Dec 2026: demo proposals / pilot mapping schema
- 10 Jan 2027: build-to-testing handoff
- 25 Feb 2027: demo testing completes

These are programme planning targets, not software guarantees or assigned commitments.
