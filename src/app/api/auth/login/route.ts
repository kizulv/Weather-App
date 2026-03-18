import { NextResponse } from "next/server";
import { loginSchema } from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import { ZodError } from "zod";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const parsedData = loginSchema.parse(body);

    // Call authentication service
    const result = await authService.login(parsedData);
    
    // Lưu JWT vào HttpOnly Cookie
    const cookieStore = await cookies();
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

    return NextResponse.json(
      { success: true, user: result.user },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu không hợp lệ", errors: error.issues },
        { status: 400 }
      );
    }
    const err = error as Error;
    if (err.message === "INVALID_CREDENTIALS") {
      return NextResponse.json(
        { success: false, message: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ", error: err.message },
      { status: 500 }
    );
  }
}
