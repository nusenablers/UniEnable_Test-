# Development-only database

On first run, `src/db.js` creates a JSON database at `dev-db.json`. It is intentionally ignored by Git. The seed uses fictional buildings and activities; it is NOT a verified NUS map. Reset with `npm run seed -w @unienabler/api`. Do not use this file store to collect real participant or location records. Replace with authenticated transactional database before production.
