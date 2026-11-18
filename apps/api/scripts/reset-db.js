import { saveDb, createSeed, databasePath } from '../src/db.js';
saveDb(createSeed());
console.log(`Reset synthetic demo database: ${databasePath()}`);
