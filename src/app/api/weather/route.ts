import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { fetchWeatherData } from "@/features/weather/server/weather-fetch";

export async function GET() {
  // Xác thực token từ Cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ success: false, message: "Invalid or Expired Token" }, { status: 401 });
  }

  try {
    const data = await fetchWeatherData(token);
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        message: "Không tìm thấy dữ liệu thời tiết" 
      }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: { 
        "Cache-Control": "private, max-age=60",
        "X-Accel-Buffering": "no", // Chống Cloudflare Tunnel buffer response
      },
    });
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu từ api.pcthanh.com:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Lỗi khi kết nối tới máy chủ dữ liệu ngoại",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 502 });
  }
}
