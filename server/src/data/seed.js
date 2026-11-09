import '../config/env.js';
import { fileURLToPath } from 'node:url';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import menu from './menu.json' with { type: 'json' };

/** Seeds menu + admin user only when the collections are empty. */
export async function seedIfEmpty({ force = false } = {}) {
  if (force) await MenuItem.deleteMany({});
  if ((await MenuItem.estimatedDocumentCount()) === 0) {
    await MenuItem.insertMany(menu);
    console.log(`🌱 Seeded ${menu.length} menu items`);
  }

  const email = process.env.ADMIN_EMAIL || 'admin@ember.com';
  if (!(await User.findOne({ email }))) {
    await User.create({
      name: 'Ember Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });
    console.log(`👤 Admin user created: ${email}`);
  }
}

// Allow `npm run seed` to reset the menu in a real database.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { connectDB, disconnectDB } = await import('../config/db.js');
  await connectDB();
  await seedIfEmpty({ force: true });
  await disconnectDB();
}
