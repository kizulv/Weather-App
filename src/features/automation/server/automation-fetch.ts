import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { verifyToken } from "@/lib/auth/jwt";
import { Automation, Device } from "../types/automation";

/**
 * Lấy danh sách Automation từ API External.
 * Hàm này dùng cho Server Component (page.tsx).
 */
export async function getAutomationsFromDB(): Promise<Automation[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return [];

  const payload = await verifyToken(token);
  if (!payload) return [];

  try {
    const response = await apiClient("/automations", { method: "GET" }, token) as { success: boolean; data: Automation[] };
    return response.success ? response.data : [];
  } catch (error) {
    console.error("Lỗi khi fetch Automations cho SSR:", error);
    return [];
  }
}

/**
 * Lấy danh sách Devices từ API External (thông qua HA proxy hoặc endpoint devices).
 * Hàm này dùng cho Server Component (page.tsx).
 */
export async function getDevicesFromDB(): Promise<Device[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return [];

  try {
    // Gọi endpoint lấy danh sách thiết bị từ Home Assistant proxy trên Server API
    const response = await apiClient("/home-assistant/devices", { method: "GET" }, token) as { success: boolean; data: Device[] };
    return response.success ? response.data : [];
  } catch (error) {
    console.error("Lỗi khi fetch Devices cho SSR:", error);
    return [];
  }
}
