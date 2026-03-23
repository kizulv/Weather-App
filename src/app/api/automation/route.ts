import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { Automation } from "@/features/automation/types/automation";

/**
 * GET: Lấy danh sách automations
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Gọi API ngoại thay vì MongoDB local
    const response = await apiClient<{ success: boolean; data?: Automation[] }>("/automations", { method: "GET" }, token);
 
    return NextResponse.json({ success: true, data: response.data || [] });
  } catch (error) {
    console.error("Lỗi lấy danh sách automation từ API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * POST: Tạo mới automation
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Gọi API ngoại để tạo automation
    const response = await apiClient<{ success: boolean; message?: string; id?: string }>("/automations", {
      method: "POST",
      body: JSON.stringify(body),
    }, token);
 
    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi tạo automation tại API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
