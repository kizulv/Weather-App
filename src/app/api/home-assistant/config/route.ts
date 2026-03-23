import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  try {
    // 1. Xác thực người dùng
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 });
    }

    // 2. Lấy cấu hình từ API ngoại (Server ngoại xử lý giải mã)
    const response = await apiClient("/settings/home-assistant", { method: "GET" }, token);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi lấy cấu hình Home Assistant từ API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // 2. Cập nhật cấu hình qua API ngoại
    const response = await apiClient("/settings/home-assistant", {
      method: "POST",
      body: JSON.stringify(body),
    }, token);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi cập nhật cấu hình Home Assistant tại API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
