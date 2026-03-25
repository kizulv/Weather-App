import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Mở rộng Zod với OpenAPI metadata
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Đăng ký Bearer Auth
export const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
);

// Đăng ký Sensor API Key (Header)
export const sensorAuth = registry.registerComponent(
  "securitySchemes",
  "sensorAuth",
  {
    type: "apiKey",
    name: "X-Sensor-Token",
    in: "header",
    description: "Token bảo mật cho thiết bị cảm biến (SENSOR_API_KEY)",
  },
);

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "API Server Documentation",
      version: "1.0.0",
      description: "Tài liệu hướng dẫn sử dụng API cho hệ thống API Server.",
    },
    servers: [
      {
        url: "v1", // Đổi lại thành /api/v1 cho đúng folder structure nếu cần, hoặc giữ /v1 tùy config
        description: "V1 API",
      },
    ],
    security: [{ [bearerAuth.name]: [] }],
    tags: [
      {
        name: "Auth",
        description:
          "Các API liên quan đến xác thực và quản lý tài khoản người dùng.",
      },
      {
        name: "Weather",
        description:
          "Các API liên quan đến dữ liệu thời tiết và thu thập thông tin từ cảm biến.",
      },
    ],
  });
}
