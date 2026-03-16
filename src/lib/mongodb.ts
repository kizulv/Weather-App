import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  throw new Error("Vui lòng thêm MONGODB_URI hoặc MONGO_URI vào file .env");
}
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Trong chế độ development, sử dụng biến global để tránh tạo nhiều kết nối khi HMR (Hot Module Replacement)
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // Trong chế độ production, tạo kết nối mới
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
