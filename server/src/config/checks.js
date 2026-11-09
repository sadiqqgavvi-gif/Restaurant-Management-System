/** Fail fast on unsafe configuration. Shared by the long-running server and the Vercel function. */
export function checkConfig() {
  // Forgive common copy-paste slips in hosting dashboards: surrounding quotes/spaces
  // or the whole `MONGO_URI=...` line pasted into the value field.
  if (process.env.MONGO_URI) {
    process.env.MONGO_URI = process.env.MONGO_URI.trim().replace(/^MONGO_URI\s*=\s*/, '').replace(/^["']|["']$/g, '').trim();
  }
  const isProd = process.env.NODE_ENV === 'production';
  if (!process.env.JWT_SECRET) {
    if (isProd) throw new Error('JWT_SECRET is required in production');
    process.env.JWT_SECRET = 'dev-only-secret-change-me';
  }
  if (isProd && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123')) {
    throw new Error('Set a strong ADMIN_PASSWORD in production (the dev default "admin123" is not allowed)');
  }
}
