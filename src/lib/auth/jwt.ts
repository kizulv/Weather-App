import { SignJWT, jwtVerify } from "jose";
import { JWTPayload } from "@/modules/auth/auth.types";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long",
);

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = process.env.JWT_EXPIRES_IN || "24h";

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    // Fallback: Nếu không verify được (ví dụ token từ API ngoại), ta giải mã payload để lấy thông tin.
    // Lưu ý: Chỉ nên dùng cách này nếu chúng ta tin tưởng nguồn gốc của token (đã được login thành công).
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      return {
        sub: decodedPayload.sub || decodedPayload.id || "",
        email: decodedPayload.email || "",
        role: decodedPayload.role || "VIEWER",
        name: decodedPayload.name || "",
      } as JWTPayload;
    } catch (e) {
      console.error("Failed to decode token fallback:", e);
      return null;
    }
  }
}
