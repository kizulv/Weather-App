import { LoginInput } from "./auth.schema";
import { apiClient } from "@/lib/api-client";

export class AuthService {
  async login(input: LoginInput) {
    try {
      const data = await apiClient<{
        success: boolean;
        message?: string;
        user?: { id: string; email: string; name: string; role?: string };
        token?: string;
        data?: {
          user?: { id: string | number; email: string; name: string; role?: string };
          token?: string;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });

      if (!data.success) {
        throw new Error(data.message || "INVALID_CREDENTIALS");
      }

      // Lấy token từ response
      const token = data.token || data.data?.token;

      if (!token) {
        throw new Error("Không nhận được token từ máy chủ");
      }

      // Trích xuất thông tin user từ các cấu trúc response khác nhau của API
      const userObj = data.user || data.data?.user;
      const dataPayload = data.data as Record<string, unknown> | undefined;
      const userData = (userObj as Record<string, unknown>) || dataPayload || {};

      return {
        user: {
          id: String(userData.id || userData._id || "unknown"),
          email: String(userData.email || input.email),
          name: String(userData.name || "User"),
          role: String(userData.role || "VIEWER"),
        },
        token,
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "status" in error && error.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
      console.error("AuthService Login Error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
