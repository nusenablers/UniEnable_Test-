# Architecture and integration gates

## System layout

```text
React Native (Expo SDK 58)
  ├─ Home / Map / Plan / Talk / Sensors screens
  ├─ src/components/UI.tsx, src/theme.ts (Figma design tokens)
  └─ src/api.ts (fetch client)
         │ HTTP REST, DEVELOPMENT ONLY
         ▼
Node.js API: apps/api/src/server.js
  ├─ services/activities.js (priority, sorting, validation)
  ├─ services/routes.js (Dijkstra; demo/verified gate)
  ├─ sensors/algorithm.js (basic stats + EWMA)
  ├─ sensors/adapter.js (mock sensor + physical-device stub)
  └─ db.js (atomic-write JSON development store)
         │
         ▼
    apps/api/data/dev-db.json (generated, ignored by Git)
```

`App.tsx` owns navigation and refresh state; each screen is a component with props. Codex/Claude may introduce Expo Router later, but should preserve screen accessibility and API contracts.

## Data partitions

- **Activities:** user-generated, initially seeded examples. Date/time/demand/optional priority ratings and completion. Use `id` for mutations; never rely on displayed list indexes (CLI has numbered commands, UI doesn't).
- **Facilities & route links:** reference/survey data. `UNKNOWN` never implies accessible. Fictitious seed names, not real NUS locations.
- **Survey observations:** separate from verified route data. `/api/surveys` only records an unverified proposed observation; it does not mutate `connections` or become navigation truth.
- **Phrase cards:** fixed seed phrases; show text supported; TTS pending.
- **Sensor readings:** an independent ingestion namespace with opt-in. No personal identifiers, GPS, raw audio or camera data.

## Verification gate

The demo query explicitly includes `?demo=true` and only uses fictional `DEMO_ONLY` links with `demoPassable: true`. A normal `/api/routes` query only accepts links whose **evidenceStatus === 'VERIFIED'** and **accessibility === 'YES'**. This skeleton's seed contains no such links. Real route support requires human site survey, timestamps, evidence review, ownership/expiration policy and on-site user testing.

## Non-goals in the skeleton

No actual campus map coordinates, live navigation, onboarding, sign-in, real sensor acquisition, offline DB sync, route reliability claims, recommendation engine or cloud service. Those are tracked as separate features to implement after initial review.

## API future design

Use a database transaction for write operations; separate API authentication for survey reviewers; treat accessibility observations as versioned, evidence-linked records. Establish clear retention policies; do not collect raw sensor data from users without consent, legitimate purpose, anonymization/retention plan, and appropriate review.
