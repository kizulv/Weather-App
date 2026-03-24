import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "@/features/auth/auth.types";

/**
 * Xác thực token từ xa bằng cách gọi API /auth/me của Server.
 * Cách này không cần App biết JWT_SECRET nhưng vẫn đảm bảo token thật.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // 1. Giải mã thô để lấy payload (không check chữ ký) - Dùng cho UI
    const decoded = jwtDecode(token) as Record<string, unknown>;
    
    // 2. Gọi API ngoại để xác thực thực sự
    const baseUrl = process.env.WEATHER_API_BASE_URL;
    
    const response = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Remote Auth Check failed with status:", response.status);
      return null;
    }

    const result = await response.json();
    
    if (result.success) {
      // API có thể trả về user ở result.user hoặc result.data.user hoặc result.data
      const userData = result.data?.user || result.user || result.data || {};
      
      // Trả về payload đã được server xác nhận
      return {
        ...decoded,
        sub: String(userData.id || userData._id || decoded.sub || "unknown"),
        email: userData.email || decoded.email || "",
        role: userData.role || decoded.role || "VIEWER",
        name: userData.name || decoded.name || "",
      } as unknown as JWTPayload;
    }

    return null;
  } catch (error) {
    console.error("Remote JWT Verification failed:", error);
    return null;
  }
}

// Giữ lại signToken cho các mục đích nội bộ nếu cần, nhưng cảnh báo
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function signToken(_payload: unknown) {
  console.warn("signToken was called but App is in Remote Auth mode. This token is local-only.");
  return "local-token-not-verifiable-by-server";
}
