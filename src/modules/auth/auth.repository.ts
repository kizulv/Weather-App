import clientPromise from "@/lib/mongodb";
import { User } from "./auth.types";
import { ObjectId } from "mongodb";

export class AuthRepository {
  private async getCollection() {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<User>("users");
  }

  async findByEmail(email: string): Promise<User | null> {
    const col = await this.getCollection();
    return col.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    const col = await this.getCollection();
    return col.findOne({ _id: new ObjectId(id) });
  }

  async createUser(user: Omit<User, "id" | "_id">): Promise<string> {
    const col = await this.getCollection();
    const result = await col.insertOne(user as User);
    return result.insertedId.toString();
  }
}

export const authRepository = new AuthRepository();
