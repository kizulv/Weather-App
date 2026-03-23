import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { Automation } from "@/features/automation/types/automation";

/**
 * PUT: Cập nhật automation
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Gọi API ngoại để cập nhật automation
    const response = await apiClient<{ success: boolean; message?: string; data?: Automation }>(`/automations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, token);
 
    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi cập nhật automation tại API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * DELETE: Xóa automation
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Gọi API ngoại để xóa automation
    const response = await apiClient<{ success: boolean; message?: string }>(`/automations/${id}`, {
      method: "DELETE"
    }, token);
 
    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi xóa automation tại API:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
