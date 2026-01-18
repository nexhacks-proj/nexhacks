import mongoose from 'mongoose'

// Default connection string - can be overridden with MONGODB_URI env variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://elgooseman321_db_user:VkOrkGwTYnu64tuz@maincluster.ndr3cps.mongodb.net/swipehire?retryWrites=true&w=majority&appName=MainCluster'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Use global cache to prevent multiple connections in Next.js dev mode
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      // Retry connection on failures
      retryWrites: true,
      // Allow connection even if TLS/SSL validation fails (for some network setups)
      tlsAllowInvalidCertificates: false,
      // Direct connection option (bypass DNS if needed)
      directConnection: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB connected to: ${mongoose.connection.db?.databaseName || 'swipehire'}`)
      return mongoose
    }).catch((err) => {
      console.error('❌ MongoDB connection failed:', err)
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
