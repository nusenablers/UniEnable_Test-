import { createServer } from './server.js';
const port = Number(process.env.PORT || 3001);
const hostname = process.env.HOST || '127.0.0.1'; // localhost default: do not expose dummy no-auth API publicly
createServer().listen(port, hostname, () => console.log(`UniEnabler DEMO API at http://${hostname}:${port}`));
