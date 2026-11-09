import './config/env.js';
import { connectDB } from './config/db.js';
import { seedIfEmpty } from './data/seed.js';
import { createApp } from './app.js';
import { checkConfig } from './config/checks.js';

checkConfig();

const PORT = process.env.PORT || 5000;
const app = createApp();

const { inMemory } = await connectDB();
await seedIfEmpty();
app.listen(PORT, () => {
  console.log(`🔥 Ember API running on http://localhost:${PORT}${inMemory ? ' (in-memory DB)' : ''}`);
});
