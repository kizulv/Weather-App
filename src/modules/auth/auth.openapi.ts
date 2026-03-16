import { registry } from "@/lib/openapi";
import { loginSchema, registerSchema } from "./auth.schema";
import { z } from "zod";

// Đăng ký Schemas
registry.register("RegisterInput", registerSchema);
registry.register("LoginInput", loginSchema);

// Đăng ký Endpoint: Đăng ký
registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Đăng ký tài khoản mới",
  tags: ["Auth"],
  description: "Tạo tài khoản người dùng mới trong hệ thống.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
          example: {
            email: "newuser@example.com",
            password: "securepassword",
            name: "Nguyễn Văn B",
            role: "VIEWER",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Tài khoản đã được tạo",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string().optional(),
            }),
          }),
          example: {
            success: true,
            data: {
              id: "65e6d6f5f3e4a1234567890",
              email: "newuser@example.com",
              name: "Nguyễn Văn B",
            },
          },
        },
      },
    },
  },
});

// Đăng ký Endpoint: Đăng nhập
registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Đăng nhập",
  tags: ["Auth"],
  description: "Xác thực người dùng và trả về JWT token.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
          example: {
            email: "user@example.com",
            password: "123456",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Đăng nhập thành công",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            token: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string().optional(),
            }),
          }),
          example: {
            success: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
              id: "65e6d6f5f3e4a1234567890",
              email: "user@example.com",
              name: "Nguyễn Văn A",
            },
          },
        },
      },
    },
    401: {
      description: "Sai email hoặc mật khẩu",
    },
  },
});
