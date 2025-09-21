import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Global MongoDB client promise
 * Used for unstructured data like resume content, analysis results, etc.
 */
export default clientPromise;

/**
 * Helper function to get a database instance
 */
export async function getDatabase(dbName: string) {
  const client = await clientPromise;
  return client.db(dbName);
}

/**
 * Helper function to get a collection from a database
 */
export async function getCollection(dbName: string, collectionName: string) {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}