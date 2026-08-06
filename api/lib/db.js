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

// Call once (e.g. from a setup script) to enforce one-answer-per-user-per-day.
export async function ensureIndexes() {
  const db = await getDb();
  await db
    .collection("answers")
    .createIndex({ promptId: 1, userId: 1 }, { unique: true });
  // sparse: true is important here — suggestions don't have a `date` field
  // yet, and a plain unique index treats every missing value as the same
  // null, which would let only ONE date-less suggestion exist at a time.
  await db
    .collection("prompts")
    .createIndex({ date: 1 }, { unique: true, sparse: true });
}
