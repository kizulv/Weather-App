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

      if (!data.user) {
        console.error("Login successful but 'user' object is missing in response!");
        const dataPayload = data.data as Record<string, unknown> | undefined;
        const userData = (dataPayload?.user as Record<string, unknown>) || dataPayload || {};
        return {
          user: {
            id: String(userData.id || userData._id || "unknown"),
            email: String(userData.email || input.email),
            name: String(userData.name || "User"),
            role: String(userData.role || "VIEWER"),
          },
          token: data.token || (dataPayload?.token as string | undefined),
        };
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role || "VIEWER",
        },
        token: data.token,
      };
    } catch (error) {
      console.error("AuthService Login Error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
