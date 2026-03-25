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
    
    if (!data) {
      return { 
        success: false, 
        message: "Không tìm thấy dữ liệu thời tiết" 
      };
    }

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu thời tiết:", error);
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { 
      success: false, 
      message: "Lỗi khi kết nối tới máy chủ dữ liệu ngoại",
      error: message
    };
  }
}
