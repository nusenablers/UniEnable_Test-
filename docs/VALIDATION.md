# Validation performed on the initial scaffold

Prepared on 18 November 2026.

## Passed

- Node.js server tests: `node --test apps/api/tests/*.test.js` — **7 / 7 passing**.
- Server tests cover: CLI priority formula and optional ratings; chronological/demand/priority sorting; invalid inputs; simulated Dijkstra excluding stairs/unknown; verified-only route gate; sensor EWMA; consent check; sample/physical adapter distinction; HTTP health/activity persistence.
- Every project `package.json`, `app.json`, and `tsconfig.json` parses as valid JSON.
- All 12 React Native `.ts`/`.tsx` source files pass a TypeScript **syntax transpilation check** using an available TypeScript compiler (not a full typecheck).
- Figma wireframe SVG was rendered and visually inspected; PNG preview is included.

## Not run in this environment

- `npm install` and a full `npm run typecheck` (package registry access was unavailable in this execution environment).
- Expo Go / Android / iOS / web runtime and real-device accessibility tests.
- Any real sensor integration or campus route verification.

**Required first contributor step:** install dependencies on a networked development machine, run `npm run check`, start both API and Expo, and resolve any SDK/library compatibility differences with `npx expo install --check` before building new features.
