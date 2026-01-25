import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach } from 'vitest';

let mongo: MongoMemoryServer;

beforeAll(async () => {
    // Start in-memory mongodb
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);
});

beforeEach(async () => {
    // Clean collections before each test
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    // Shutdown memory server and disconnect
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.disconnect();
});
