import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { connectDB } from './config/db.js';
import { seedIfEmpty } from './data/seed.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production');
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api', routes);

// After `npm run build`, the API also serves the built React app (single-server deploy).
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use('/api', notFound);
app.use(errorHandler);

const { inMemory } = await connectDB();
await seedIfEmpty();
app.listen(PORT, () => {
  console.log(`🔥 Ember API running on http://localhost:${PORT}${inMemory ? ' (in-memory DB)' : ''}`);
});
