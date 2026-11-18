# UniEnabler 2.0 — React Native + Node.js starter

**Status: skeleton / synthetic demo, not a deployed campus assistance product.**

This GitHub-ready monorepo is an original TypeScript/JavaScript starter built with the user's Java UniEnable CLI repositories and the NUS Enablers programme proposal as **behavioural references**. It does **not** copy the Java sources or claim that any campus facility, ramp, lift, or route has been surveyed.

## What you get

- **Mobile:** React Native + Expo SDK 58 + TypeScript. Five navigable, Figma-ready sample screens: Home, Map/Facilities, Plan/Activities, Communication cards, Sensor data lab.
- **Server:** Node.js built-in HTTP server, REST-style endpoints, JSON-file *development database*, seed/reset script. **No real database engine, authentication, synchronization, or deployment is included.** No external server dependencies required.
- **Demonstrations:** add/complete/delete activities, show priority calculated from the CLI rule, query fictional facilities, calculate synthetic demo routes with Dijkstra, display simple communication cards, submit synthetic sensor readings, calculate average and EWMA.
- **Safety boundary:** fictional location names; UNKNOWN real-world accessibility status; route calculations for demo only; sensor ingestion opt-in and limited. All functionality needs human review before use beyond demonstration.
- **Agent handoff:** `AGENTS.md`, `CLAUDE.md`, architecture, API and sensor contracts, Figma handoff, an importable SVG wireframe sheet, and next tasks.

## Prerequisites

- Node.js **22.13+** or **24.3+**, npm and Git.
- Android/iOS: Expo Go **compatible with SDK 58**, or a development build; Expo Go availability may vary by store/version.
- Optional: Figma for UI edits.

## Run locally

```bash
# 1. In this repo root:
npm install

# 2. Start the API and web preview together:
npm run dev
```

The browser preview is at **http://localhost:8081**. The API runs at **http://127.0.0.1:3001**; verify it at [`/api/health`](http://127.0.0.1:3001/api/health). Stop both processes with Ctrl+C. `npm run dev` uses `concurrently` and stops the companion process if either service exits.

To launch one process, use `npm run dev:api`, `npm run dev:mobile` (Expo/QR for native devices), or `npm run web` (web preview). Android emulator API URL is `http://10.0.2.2:3001`; iOS simulator and web use `http://127.0.0.1:3001`.

### Install and supported environments

- Windows, macOS or Linux with Git, Node.js **22.13+** (or Node 24 LTS) and npm. No separate database is needed.
- From the repository root run `npm install`, then `npm run check`, `npx expo install --check` and `npx expo-doctor`.
- The app uses Expo SDK 58. Expo Go must support SDK 58; if the installed client no longer supports it, use a development build configured for this project. Android Studio/AVD is optional for web and Expo Go.

### Android emulator

Install Android Studio and its Android SDK/Platform Tools, create and start an Android Virtual Device, then run `npm run dev:mobile` and press `a` in the Expo terminal (or use `npm run android`). The app uses `10.0.2.2` to reach the host API from an Android emulator.

### When using an actual phone

The phone cannot reach your computer's `localhost`. On a **trusted local network only**:

1. Find your computer's LAN address, e.g. `192.168.1.25`.
2. Run the API with `HOST=0.0.0.0` (macOS/Linux) or `$env:HOST='0.0.0.0'; npm run dev:api` (PowerShell). The API intentionally binds to localhost by default.
3. Copy `apps/mobile/.env.example` to `apps/mobile/.env.local`; set `EXPO_PUBLIC_API_URL=http://192.168.1.25:3001` using **your own IP**. Restart Expo.
4. Use a trusted Wi-Fi connection; firewalls must permit the local port. Do **not** put this unauthenticated HTTP service on the public internet, share it through a public tunnel, or use it for personal data.

For Expo Go on a physical phone, install Expo Go from the official app store, connect phone and computer to the same trusted Wi-Fi, start `npm run dev:mobile`, then scan the QR. Configure the API URL using the computer's LAN IP as above; phone `localhost` is the phone itself. Expo's `--tunnel` option can help with Expo bundler discovery when LAN mode fails, but the API still needs a trusted reachable address. Do not publicly tunnel this no-auth demo API.

**Offline UI preview:** Even with the server switched off, the app displays local fictional sample content. Saving, demo routing, and simulated sensor submission require the API.

### Troubleshooting

- **Port 3001 or 8081 is busy:** stop the process using that port, then rerun `npm run dev`.
- **API unavailable banner:** check `http://127.0.0.1:3001/api/health` and restart the API. Preview records are local display data; they are not saved when offline.
- **Phone cannot reach API:** set `HOST=0.0.0.0` for the API and `EXPO_PUBLIC_API_URL` to the computer's LAN IP in `apps/mobile/.env.local`, restart Expo, and allow access only on a trusted private network.
- **Expo Go reports SDK mismatch:** check installed Expo Go support for SDK 58; use a development build if needed.
- **Dependency or bundler errors:** run `npm install`, `npm run check`, `npx expo install --check` and `npx expo-doctor`; inspect the first reported error before changing versions.

## Server commands

```bash
npm test                         # Node's built-in tests — works even before npm install
npm run start:api                # Node local HTTP server
npm run seed -w @unienabler/api # reset server's dev database
npm run send:demo -w @unienabler/api # send 4 simulated readings; API must be running
npm run typecheck                # mobile TypeScript check after npm install
```

The server writes to `apps/api/data/dev-db.json` on first run. This file is `.gitignore`d; it is a replaceable **mock database**. Do not store real survey photos, personal records or sensor participant data in it.

Try the API with a browser: [`http://127.0.0.1:3001/api/health`](http://127.0.0.1:3001/api/health) and [`http://127.0.0.1:3001/api/facilities`](http://127.0.0.1:3001/api/facilities).

## Structure

```text
apps/
  mobile/
    App.tsx                  # tab navigation + data fetching
    src/screens/             # Home, Map, Plan, Communicate, Sensors
    src/components/UI.tsx    # accessible reusable components
    src/api.ts               # typed REST client
    src/fallback.ts          # offline sample content
    src/theme.ts             # Figma-aligned design tokens
  api/
    src/server.js            # routes / HTTP boundary
    src/db.js                # JSON dev database + fictional seed
    src/services/activities.js # CLI-inspired priority and sorting
    src/services/routes.js     # Dijkstra + verification gate
    src/sensors/algorithm.js   # independently replaceable data pipeline
    src/sensors/adapter.js     # mock device + real-device TODO adapter
    scripts/                  # seed/reset and simulated sensor client
    tests/                    # algorithm + HTTP tests
design/
  figma-wireframes.svg      # five-screen reference sheet importable into Figma
docs/
  ARCHITECTURE.md
  CLI_MAPPING.md
  API.md
  FIGMA_HANDOFF.md
  SENSOR_HANDOFF.md
  NEXT_TASKS.md
  VALIDATION.md
AGENTS.md                       # Codex agent instructions
CLAUDE.md                       # Claude Code agent instructions
```

## CLI reference and design philosophy

- `tp-master (6).zip`: activity fields, 1–5 optional ratings, `urgency² × (importance + commitment)` priority, demand sorting, facility/connection concepts, accessibility statuses, shortest-path routing.
- `UniEnable-main.zip`: additional concepts such as preferences, recommendations, topic categories, recurring timetable and dashboard remain **TODOs**. Do not mistake this starter for a 1:1 feature port.
- `NUS_Enablers_AT_Meeting_Final(1).pdf`: four primary jobs (navigation, facilities, planning, communication), React Native + Expo, small verified mapping pilot, accessibility-first interface. Optional Sensors lab is added for the teammate's independent sensor/data/algorithm work.

See `docs/CLI_MAPPING.md` for exact mappings, and `docs/SENSOR_HANDOFF.md` for the contributor integration boundary.

## Important limitations / next gates

1. **No verified real route data.** A synthetic route can be shown only as a marked demo; the default verified route endpoint returns no path. Add evidence, date and human verification workflow before real routing.
2. **No production backend.** Replace JSON store with a real database, authentication, validation and migrations when requirements settle.
3. **No real sensor permissions or hardware link.** Only dummy readings; independent integration belongs behind an adapter.
4. **No audio TTS yet.** “Speak this message” is an explicit placeholder. The display-card function works.
5. **No accessibility certification.** Run TalkBack/VoiceOver, zoom, reduced motion, large text, seated reach and real user tests.
6. **No public hosting or secrets.** The example project is suited to GitHub and local experiments, not to deploying sensitive data.

**Project budget context:** demonstration target ≤ S$100 for UniEnabler; the software skeleton assumes use of existing equipment and does not purchase or bundle hardware.

## GitHub upload

Create an empty GitHub repository and push these contents:

```bash
git init
git add .
git commit -m "chore: scaffold UniEnabler 2.0 mobile and API"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Do not add the ZIP itself into the repository. Keep **only one repo root** containing `package.json` and `apps/`.

## Official framework references

- Expo SDK 58: https://docs.expo.dev/versions/v58.0.0/
- Expo monorepos: https://docs.expo.dev/guides/monorepos/
- React Native: https://reactnative.dev/

**Note:** No open-source licence has been chosen in this skeleton. Repository owner should select one before accepting external contributions or reuse.
