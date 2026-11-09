import mongoose from 'mongoose';

let memoryServer;
const isProd = process.env.NODE_ENV === 'production';

async function startMemoryServer() {
  console.log('⏳ Starting in-memory MongoDB — the first run downloads the MongoDB binary once (can be 700+ MB on Windows), please wait…');
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    return memoryServer.getUri('ember');
  } catch (err) {
    console.error('\n❌ Could not start the in-memory MongoDB:', err.message);
    console.error('   Fix: install MongoDB locally, or create a free MongoDB Atlas cluster,');
    console.error('   then set MONGO_URI in server/.env and restart.\n');
    process.exit(1);
  }
}

export async function connectDB() {
  let uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    if (isProd) throw new Error('MONGO_URI is required in production');
    uri = await startMemoryServer();
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    if (isProd || memoryServer) throw err;
    const isLocal = /\/\/(localhost|127\.0\.0\.1)[:/]/.test(uri);
    if (!isLocal) {
      // A remote (e.g. Atlas) URI was given: show the real problem instead of hiding it.
      console.error(`\n❌ Could not connect to MongoDB: ${err.message}`);
      console.error('   Checklist for MongoDB Atlas:');
      console.error('   • Network Access → "Allow access from anywhere" (0.0.0.0/0) is active');
      console.error('   • Username/password in MONGO_URI match Database Access (no < > around the password)');
      console.error('   • "querySrv"/"ENOTFOUND" errors are DNS: set Windows DNS to 8.8.8.8, or use the');
      console.error('     non-SRV "mongodb://" connection string from Atlas instead of "mongodb+srv://"\n');
      process.exit(1);
    }
    // Dev convenience: a local MONGO_URI was set but no MongoDB is running there.
    console.warn(`\n⚠️  Could not connect to MongoDB at ${uri.replace(/\/\/[^@]*@/, '//***@')} (${err.message}).`);
    console.warn('   Falling back to an in-memory database. Leave MONGO_URI empty to skip this check.\n');
    uri = await startMemoryServer();
    await mongoose.connect(uri);
  }

  console.log(`🍃 MongoDB connected: ${mongoose.connection.host}${memoryServer ? ' (in-memory, data resets on restart)' : ''}`);
  return { inMemory: Boolean(memoryServer) };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
