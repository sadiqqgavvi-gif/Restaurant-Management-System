import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

/** Builds the Express app without connecting to a database or listening — so tests can import it. */
export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // behind Render/Railway/NGINX: correct client IPs for rate limiting
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

  app.use('/api', routes);

  // After `npm run build`, the API also serves the built React app (single-server deploy).
  const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '7d', index: false }));
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use('/api', notFound);
  app.use(errorHandler);
  return app;
}
