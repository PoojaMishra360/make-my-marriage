import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "saath";

if (!uri && process.env.NODE_ENV === "production") {
  throw new Error("MONGODB_URI must be configured in production.");
}

let clientPromise: Promise<MongoClient> | undefined;

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("Database is not configured. Set MONGODB_URI to enable data access.");
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return (await clientPromise).db(databaseName);
}
