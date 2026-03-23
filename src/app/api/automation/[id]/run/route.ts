import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";

/**
 * POST /api/automation/[id]/run
 * Chạy thử một automation cụ thể (gọi qua API ngoại)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Xác thực
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Gọi API thực thi trên server ngoại
    const response = await apiClient<{ success: boolean; message?: string }>(`/automations/${id}/execute`, {
      method: "POST"
    }, token);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi thực thi automation tại API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
