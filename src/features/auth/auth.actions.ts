"use server";

import { loginSchema, LoginInput } from "./auth.schema";
import { authService } from "./auth.service";
import { cookies } from "next/headers";

/**
 * Server Action xử lý đăng nhập
 */
export async function loginAction(input: LoginInput) {
  try {
    // Validate dữ liệu đầu vào
    const parsedData = loginSchema.parse(input);

    // Gọi service xác thực
    const result = await authService.login(parsedData);
    
    const cookieStore = await cookies();
    
    // Lưu JWT vào HttpOnly Cookie
    cookieStore.set({
      name: "auth_token",
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 ngày
    });

    // Cookie hiển thị thông tin user cho client (non-httpOnly)
    cookieStore.set({
      name: "user_info",
      value: JSON.stringify({ name: result.user.name, role: result.user.role }),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return { success: true, user: result.user };
  } catch (error) {
    console.error("Login Action Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { 
      success: false, 
      message: message === "INVALID_CREDENTIALS" 
        ? "Email hoặc mật khẩu không chính xác." 
        : (message || "Lỗi máy chủ")
    };
  }
}

/**
 * Server Action xử lý đăng xuất
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  
  // Xoá cookie auth_token
  cookieStore.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  // Xoá cookie user_info
  cookieStore.set({
    name: "user_info",
    value: "",
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });

  return { success: true, message: "Đã đăng xuất" };
}
