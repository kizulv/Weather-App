import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { Device } from "@/features/automation/types/automation";

export async function POST(req: Request) {
  // 1. Xác thực người dùng
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url, haToken } = await req.json();

    if (!url || !haToken) {
      return NextResponse.json({ success: false, message: "Thiếu URL hoặc Token của Home Assistant" }, { status: 400 });
    }

    // 2. Gọi API ngoại để lưu cấu hình
    // Server ngoại sẽ tự kiểm tra kết nối HA trước khi lưu
    const saveRes = await apiClient<{ 
      success: boolean; 
      message?: string; 
      data?: Record<string, unknown> 
    }>("/settings/home-assistant", {
      method: "POST",
      body: JSON.stringify({ url, token: haToken }), // Server ngoại mong đợi field 'token'
    }, token);

    if (!saveRes.success) {
      return NextResponse.json(saveRes, { status: 400 });
    }

    // 3. Gọi API ngoại để đồng bộ thiết bị ngay lập tức
    const syncRes = await apiClient<{ success: boolean }>("/home-assistant/sync", {
      method: "POST"
    }, token);

    if (!syncRes.success) {
      return NextResponse.json(syncRes, { status: 400 });
    }

    // 4. Lấy danh sách thiết bị thực tế sau khi đồng bộ để đếm
    const devicesRes = await apiClient<{ success: boolean; data?: Device[] }>("/home-assistant/devices", {
      method: "GET"
    }, token);

    const deviceCount = devicesRes.data?.length || 0;

    return NextResponse.json({ 
      success: true, 
      message: "Kết nối và đồng bộ thành công qua API server!",
      deviceCount,
      save_info: saveRes,
      sync_info: syncRes,
      devices: devicesRes.data || []
    });

  } catch (error) {
    console.error("Lỗi khi kết nối tới Home Assistant qua API:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Lỗi hệ thống khi xử lý kết nối qua API",
    }, { status: 500 });
  }
}
