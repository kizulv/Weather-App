"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { fetchWeatherData } from "./server/weather-fetch";

/**
 * Lấy dữ liệu thời tiết từ server ngoại
 */
export async function getWeatherDataAction() {
  // Xác thực token từ Cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return { success: false, message: "Invalid or Expired Token" };
  }

  try {
    const data = await fetchWeatherData(token);
    
    return { 
      success: true, 
      data: data || {
        success: true,
        realtime: null,
        hourly: [],
        daily: [],
        past24h: [],
      }
    };
  } catch (error) {
    console.warn("Lỗi khi kết nối dữ liệu thời tiết:", error);
    return { 
      success: true, 
      data: {
        success: true,
        realtime: null,
        hourly: [],
        daily: [],
        past24h: [],
      }
    };
  }
}
