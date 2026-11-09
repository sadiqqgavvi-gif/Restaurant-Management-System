import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Always load server/.env, whatever folder the process was started from.
const serverDir = fileURLToPath(new URL('../../', import.meta.url));
const envPath = `${serverDir}.env`;

if (existsSync(envPath)) {
  dotenv.config({ path: envPath, quiet: true });
  console.log(`📄 Loaded ${envPath}`);
} else {
  console.warn(`⚠️  No .env file found at ${envPath} (using defaults).`);
}

// Classic Windows trap: Notepad saves ".env" as ".env.txt".
for (const wrong of ['.env.txt', '.env.example.txt', 'env.txt']) {
  if (existsSync(`${serverDir}${wrong}`)) {
    console.warn(`⚠️  Found server\\${wrong}. It is NOT read. Rename it to exactly ".env" (no .txt).`);
  }
}

const uri = process.env.MONGO_URI?.trim();
console.log(
  uri
    ? `🔗 MONGO_URI is set (${uri.replace(/\/\/[^@]*@/, '//***@').split('?')[0]})`
    : '🔗 MONGO_URI is empty → an in-memory MongoDB will be used'
);
