import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ").openapi({
    description: "Địa chỉ email của người dùng",
    example: "user@example.com",
  }),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").openapi({
    description: "Mật khẩu (tối thiểu 6 ký tự)",
    example: "123456",
  }),
  name: z.string().optional().openapi({
    description: "Họ và tên người dùng",
    example: "Nguyễn Văn A",
  }),
  role: z.enum(["ADMIN", "VIEWER"]).default("VIEWER").openapi({
    description: "Quyền hạn của người dùng",
    example: "VIEWER",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ").openapi({
    description: "Địa chỉ email đăng nhập",
    example: "user@example.com",
  }),
  password: z.string().min(1, "Vui lòng nhập mật khẩu").openapi({
    description: "Mật khẩu đăng nhập",
    example: "123456",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
