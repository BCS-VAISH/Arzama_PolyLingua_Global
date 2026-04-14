import mongoose from 'mongoose';

// Prefer MONGODB_URI, fallback to DATABASE_URL
// MONGODB_URI should include database name: mongodb+srv://user:pass@cluster.mongodb.net/database_name?options
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI or DATABASE_URL environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      cached.promise = null;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`MongoDB connection failed: ${errorMessage}`);
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const errorMessage = e instanceof Error ? e.message : 'Unknown connection error';
    throw new Error(`MongoDB connection failed: ${errorMessage}. Please check your connection string in .env.local`);
  }

  return cached.conn;
}

export default connectDB;

