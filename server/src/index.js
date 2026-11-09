import './config/env.js';
import { connectDB } from './config/db.js';
import { seedIfEmpty } from './data/seed.js';
import { createApp } from './app.js';

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) {
  if (isProd) throw new Error('JWT_SECRET is required in production');
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
}
if (isProd && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123')) {
  throw new Error('Set a strong ADMIN_PASSWORD in production (the dev default "admin123" is not allowed)');
}

const PORT = process.env.PORT || 5000;
const app = createApp();

const { inMemory } = await connectDB();
await seedIfEmpty();
app.listen(PORT, () => {
  console.log(`🔥 Ember API running on http://localhost:${PORT}${inMemory ? ' (in-memory DB)' : ''}`);
});
