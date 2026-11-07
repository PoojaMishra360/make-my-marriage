import { Db, MongoClient } from "mongodb";
import { ApiError } from "@/lib/api/errors";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "saath";

let clientPromise: Promise<MongoClient> | undefined;

export async function getDb(): Promise<Db> {
  if (!uri) throw new ApiError(503, "DATABASE_NOT_CONFIGURED", "MONGODB_URI is not configured for this deployment.");
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  try {
    return (await clientPromise).db(databaseName);
  } catch (error) {
    clientPromise = undefined;
    console.error("MongoDB connection failed", error);
    throw new ApiError(503, "DATABASE_UNAVAILABLE", "The database could not be reached. Check the MongoDB connection string and network access settings.");
  }
}
