const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarthire';

  try {
    // Attempt standard connection with 3s timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Local/Remote MongoDB not reachable at ${mongoURI} (${err.message}).`);
    console.log('[MongoDB] Spinning up in-memory MongoDB Server for seamless zero-config operation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const inMemoryURI = mongod.getUri();
      await mongoose.connect(inMemoryURI);
      console.log(`[MongoDB] Connected to In-Memory MongoDB Server at: ${inMemoryURI}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to start in-memory database:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
