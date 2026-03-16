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
    return null;
  }
}
