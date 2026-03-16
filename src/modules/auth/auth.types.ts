import { ObjectId } from "mongodb";

export type UserRole = "ADMIN" | "VIEWER";

export interface User {
  _id?: ObjectId; // Thêm _id từ MongoDB
  id?: string; // id dạng string cho API
  email: string;
  passwordHash: string;
  role: UserRole;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
}
