import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { verifyToken } from "@/lib/auth/jwt";

// Hàm helper để lấy token và kiểm tra quyền
async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token || !(await verifyToken(token))) return null;
  return token;
}

/**
 * Proxy GET /automations
 */
export async function GET() {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const data = await apiClient("/automations", { method: "GET" }, token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json({ success: false, message: err.message || "Lỗi hệ thống" }, { status: err.status || 500 });
  }
}

/**
 * Proxy POST /automations
 */
export async function POST(req: Request) {
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await apiClient("/automations", { 
      method: "POST", 
      body: JSON.stringify(body) 
    }, token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number };
    return NextResponse.json({ success: false, message: err.message || "Lỗi hệ thống" }, { status: err.status || 500 });
  }
}
