# UniEnabler 2.0 Test Report

**Run date:** 18 November 2026 (Asia/Singapore)  
**Scope:** Starter repository baseline, using an isolated temporary JSON database. No production or developer database was used.

## A. Environment

- Node.js v24.14.0; npm 11.9.0 (Windows).
- Expo SDK dependency compatibility: `npx expo install --check` — all dependencies current. `npx expo-doctor` — 20/20 checks passed.
- `npm install` completed successfully (504 packages audited; npm reported 27 dependency advisories: 2 moderate, 25 high).
- Android emulator, iOS simulator, TalkBack, VoiceOver and physical sensors were not exercised.
- Expo web bundler started at `http://localhost:8081`; HTTP root returned 200. No browser interaction/visual inspection was performed, so screen behavior is not marked passed.

## B. Test results

| ID | Component | Test case | Result | Evidence |
|---|---|---|---|---|
| T01 | Environment | Node/npm versions and npm install | PASS | Node v24.14.0; npm 11.9.0; install completed |
| T02 | Project | `npm run check` | PASS | 23 API tests passed; TypeScript `tsc --noEmit` passed |
| T03 | Expo | Install compatibility and Doctor | PASS | All dependencies current; Expo Doctor 20/20 |
| T04 | API | Health | PASS | Live isolated server returned HTTP 200 `{ok:true, demo:true}` |
| T05 | Activities | List, create, complete, delete, persistence/seed integrity | PASS | Live create returned 201 with stable UUID; PATCH and DELETE 200; seed count remained 3 after deletion |
| T06 | Activities | Invalid payload, malformed JSON, unknown ID | PASS | Invalid/malformed POST 400; unknown PATCH 404; tests assert invalid input does not mutate stored data |
| T07 | Activities | CLI priority, missing ratings, date/demand ordering and validation | PASS | Existing unit/HTTP tests passed; formula `5² × (4+3) = 175`; invalid dates, ratings, reversed time rejected |
| T08 | Routing | Verified route gate, unknown/stairs exclusions, missing path | PASS | Live normal route returned `found:false`; tests cover step-free and verified-only constraints |
| T09 | Routing | Synthetic Dijkstra demo | PASS | Live `hub-a` → `hub-c` demo returned 320m via `hub-b`, `demo:true`; warning says not real navigation |
| T10 | Facilities/phrases | Fixture retrieval | PASS | Both GET endpoints returned HTTP 200 with fictional/demo data |
| T11 | Surveys | Store unverified observation; reject bad requests | PASS | Valid POST returned 201 and `UNVERIFIED`; tests verify it does not modify routing graph |
| T12 | Sensors | Consented sample ingestion and summary | PASS | Valid sample returned 201; reading query and summary returned 200; invalid timestamp/value/consent covered by tests |
| T13 | Sensors | EWMA | PASS | Existing unit test passed; for sequence [10, 20, 30], alpha .3 gives expected final EWMA 17.9 |
| T14 | Sensors | Mock adapter and demo sender | PASS | `send:demo` submitted 4 readings, all HTTP 201; adapter test confirms physical adapter remains unavailable |
| T15 | API | Error handling and unknown endpoint | PASS | Malformed JSON 400; unknown endpoint 404; simulated DB failure returns generic JSON 500 in automated test |
| T16 | API | Restart persistence | PASS | Automated test closes/reopens API and confirms activity/sensor data persisted |
| T17 | Mobile | Web preview startup | PARTIAL | Expo bundler started; HTTP root 200. Actual browser screens and interactions not inspected |
| T18 | Mobile | Five screens, navigation, form state and accessibility | NOT RUN | Requires browser/device UI interaction and accessibility inspection |
| T19 | Mobile | Android/iOS and physical-network URL configuration | NOT RUN | No emulator/simulator/phone exercise |
| T20 | Hardware | Physical sensor acquisition | NOT RUN | No hardware adapter is implemented; mock adapter only |

**Counts:** 16 PASS, 1 PARTIAL, 3 NOT RUN. Automated checks: 23 passed, 0 failed.

## C. Defect summary

No confirmed code defect was found in the exercised API and algorithm paths; no code fixes were needed. A web command attempted with `npm run web -- --port 8088` failed because the workspace script forwards the value as an Expo project directory. The documented bare `npm run web` starts successfully, so this was a command invocation issue, not an application defect.

`npm install` reported 27 dependency advisories. No automatic upgrades were applied because advisory details and transitive impact were not part of the requested compatibility gate, and broad upgrades could change framework dependencies. Review with `npm audit` before external use.

## D. Remaining limitations

### Bugs

- None confirmed by these checks.

### Unfinished functionality

- No verified real campus facilities or routes; default route behavior correctly fails closed.
- Speech/TTS, physical sensors, authentication, production database and sync are absent.
- JSON store is single-process demo storage, not production-safe concurrent persistence.

### Environment and manual validation

- Web UI rendered only to the extent of bundler startup and HTTP response; visual and interactive tests remain outstanding.
- No Android/iOS simulator or device, keyboard/screen-reader, TalkBack/VoiceOver, text scaling or contrast review was performed.
- No physical phone LAN configuration or physical sensor test was performed.
- npm advisories need review.

## E. Readiness assessment

- **GitHub collaboration:** Ready as a clearly labelled starter, after repository owner chooses a license and reviews the npm advisories.
- **Continued feature development:** Ready; checks pass and API seams are documented.
- **Controlled student demonstration:** Conditionally ready for synthetic local demo only, after manual browser/device checks; ensure all paths and readings are described as fictional/simulated.
- **Real-world accessibility use:** Not ready. Requires human-surveyed, evidence-linked routes and facilities, review/expiry workflow, secure authenticated backend and operational data governance, user testing with disabled students, and verified platform accessibility. Sensor and speech functionality need real permission handling and device tests before claims of operation.

## Manual checks still required

1. Start API with `npm run dev:api`, then mobile with `npm run dev:mobile`; open Expo Go or a development build.
2. On Home, check loading, sample/empty state, activity summary, tab navigation, and disconnect API to confirm preview banner says saving is unavailable.
3. In Map, select endpoints, request a demo route and an unavailable route; confirm synthetic warning remains visible and no route is described as verified campus advice.
4. In Plan, add a valid activity, try invalid date/reversed time, toggle completion both ways, delete, reload and verify persistence.
5. In Talk, select phrases and verify text is legible; confirm speech is explicitly incomplete and no audio is implied.
6. In Sensors, consent and submit a simulated value, refresh summary, try invalid input and disconnect API; check the UI identifies simulated data and does not imply physical acquisition or server persistence offline.
7. In a browser, test keyboard-only navigation, visible focus, browser zoom/font scaling, contrast, error/loading states, and screen-reader labels. On Android and iOS, repeat with TalkBack and VoiceOver, including large text and touch-target reach.
8. On an actual phone only if needed, set `EXPO_PUBLIC_API_URL` to the development computer’s trusted LAN address (not localhost), and keep the unauthenticated API off public networks.
