import { MongoClient } from "mongodb";

let clientPromise = globalThis._mongoClientPromise;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

export async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
    globalThis._mongoClientPromise = clientPromise;
  }
  const client = await clientPromise;
  return client.db("mount_rushmore");
}

export async function ensureIndexes() {
  const db = await getDb();
  await db
    .collection("answers")
    .createIndex({ promptId: 1, userId: 1 }, { unique: true });
  await db
    .collection("prompts")
    .createIndex({ date: 1 }, { unique: true, sparse: true });
}
