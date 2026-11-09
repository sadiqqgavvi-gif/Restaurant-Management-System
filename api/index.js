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

/** Maps a MongoDB connection error to a safe, actionable hint (never echoes the URI). */
function dbHint(err) {
  const m = `${err?.name} ${err?.message} ${err?.code}`;
  if (!process.env.MONGO_URI) return 'MONGO_URI is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.';
  if (/bad auth|Authentication failed|AuthenticationFailed|8000/i.test(m)) return 'Atlas rejected the username/password in MONGO_URI (check Database Access, and remove < > around the password).';
  if (/Invalid scheme|Invalid connection string|URI must include|MongoParseError|URI malformed/i.test(m)) return 'MONGO_URI is not a valid connection string (it should start with mongodb+srv:// or mongodb://).';
  if (/querySrv|ENOTFOUND|EREFUSED/i.test(m)) return 'The cluster address in MONGO_URI was not found (copy it again from Atlas → Connect → Drivers).';
  if (/Server selection timed out|ServerSelection|ETIMEDOUT|whitelist|IP/i.test(m)) return 'Atlas did not answer: allow 0.0.0.0/0 in Atlas → Network Access.';
  return 'Could not connect to MongoDB. Check MONGO_URI and Atlas Network Access.';
}

export default async function handler(req, res) {
  try {
    ready ??= connectDB().then(() => seedIfEmpty());
    await ready;
  } catch (err) {
    ready = undefined; // retry on the next request
    const hint = dbHint(err);
    console.error(`[db] ${hint}`, err?.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: `Database connection failed: ${hint}` }));
  }
  return app(req, res);
}
