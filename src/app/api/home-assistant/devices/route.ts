import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { Device } from "@/features/automation/types/automation";

/**
 * GET: Lấy danh sách thiết bị
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Lấy danh sách thiết bị từ API ngoại
    const response = await apiClient<{ success: boolean; data?: Device[] }>("/home-assistant/devices", { method: "GET" }, token);

    return NextResponse.json({ 
      success: true, 
      data: response.data || [] 
    });

  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    console.error("Lỗi lấy danh sách thiết bị từ API:", err);
    return NextResponse.json({ success: false, message: err.message || "Lỗi hệ thống" }, { status: err.status || 500 });
  }
}

/**
 * POST: Đồng bộ thiết bị mới từ Home Assistant
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Gọi API sync trên server ngoại
    const response = await apiClient("/home-assistant/sync", { method: "POST" }, token);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi đồng bộ thiết bị tại API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
