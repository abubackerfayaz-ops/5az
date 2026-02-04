import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not configured');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 5000,
      family: 4,
    };

    console.log('⏳ Connecting to MongoDB...');

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    return null;
  }

  return cached.conn;
}

/**
 * Get database statistics for monitoring
 */
export async function getDbStats() {
  try {
    const conn = await dbConnect();
    if (!conn) return null;

    const db = conn.connection.db;
    if (!db) return null;

    const stats = await db.stats();

    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      totalSize: stats.dataSize + stats.indexSize,
      avgObjSize: stats.avgObjSize,
      connections: mongoose.connection.readyState,
    };
  } catch (error) {
    console.error('Failed to get DB stats:', error);
    return null;
  }
}

/**
 * Health check for database connection
 */
export async function dbHealthCheck(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();

  try {
    const conn = await dbConnect();
    if (!conn || !conn.connection.db) {
      return { healthy: false, latency: 0 };
    }

    // Ping database
    await conn.connection.db.admin().ping();
    const latency = Date.now() - start;

    return { healthy: true, latency };
  } catch (error) {
    console.error('DB health check failed:', error);
    return { healthy: false, latency: Date.now() - start };
  }
}

export { dbConnect };
export default dbConnect;
