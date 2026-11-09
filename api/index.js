// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json).
// The same Express app as `npm start` runs inside the function; the MongoDB connection
// is created once per warm instance and reused across requests.
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { checkConfig } from '../server/src/config/checks.js';
import { seedIfEmpty } from '../server/src/data/seed.js';

checkConfig();
const app = createApp();
let ready;

export default async function handler(req, res) {
  try {
    ready ??= connectDB().then(() => seedIfEmpty());
    await ready;
  } catch (err) {
    ready = undefined; // retry on the next request
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: 'Database connection failed — check MONGO_URI and Atlas Network Access.' }));
  }
  return app(req, res);
}
