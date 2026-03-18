import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long";
// Dẫn xuất khóa 32 bytes từ JWT_SECRET
const KEY = crypto.createHash("sha256").update(SECRET).digest();
const IV_LENGTH = 16; // Đối với AES, IV luôn là 16 bytes

/**
 * Mã hóa chuỗi văn bản
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  // Lưu IV cùng với bản mã để giải mã sau này (iv:encrypted)
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Giải mã chuỗi đã mã hóa
 */
export function decrypt(hash: string): string {
  const [ivHex, encryptedText] = hash.split(":");
  if (!ivHex || !encryptedText) {
    throw new Error("Định dạng chuỗi mã hóa không hợp lệ");
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
