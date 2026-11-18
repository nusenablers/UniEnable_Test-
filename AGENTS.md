# Agent instructions — UniEnabler 2.0

You are editing a **React Native/Expo mobile app + Node.js server skeleton**. Do not migrate it back to Java or build a browser-only replacement. Keep it easy for student contributors to review.

## Mandatory first steps

1. Read `README.md`, `docs/ARCHITECTURE.md`, `docs/CLI_MAPPING.md`, `docs/API.md` and `docs/SENSOR_HANDOFF.md`.
2. Inspect existing code before modifying, then describe files you plan to change.
3. Preserve the existing API contract unless your PR documents and tests a migration.
4. Run `npm test`; after installing dependencies, run `npm run typecheck` and any Expo doctor checks.

## Correctness contracts

- Activity priority = `urgency ** 2 * (importance + commitment)`; missing values -> null; ratings 1–5.
- Demand LOW/MEDIUM/HIGH is separate from numeric priority.
- Routes must **fail closed**: UNKNOWN, unreviewed or invalid edges may not become real travel advice. `demo=true` is a labelled synthetic-only mode.
- Do not invent or label actual NUS accessibility features as verified without evidence.
- The web/Expo app must maintain larger touch controls, legible text, text alternatives and usable keyboard/screen-reader flows.
- Keep sensor code modular: physical sensor adapters and algorithms must be independently testable.
- Never collect private/identifiable sensor data or deploy an unauthenticated API to the public internet.

## Style and workflow

- One feature per PR; small pure functions; tests for boundary and failure cases.
- Keep data contracts in docs and mobile TS interfaces synchronized.
- Use fictional sample names and `demo` labels for all examples.
- All future hardware/speech/location integrations must use actual permissions, error handling and opt-out, not fake success.
- No secret keys, phone numbers, user identifiers, participant data or images in Git.

## First reasonable PR

Implement just one requested feature from `docs/NEXT_TASKS.md`, prove it with tests and a brief manual accessibility checklist. Do **not** remove the incomplete-feature warnings to make the app appear more mature.
