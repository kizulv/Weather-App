import { cookies } from "next/headers";
import { Automation, Device } from "@/features/automation/types/automation";
import { apiClient } from "@/lib/api-client";

/**
 * Đọc danh sách automations từ API ngoại.
 * Dùng trong Server Component.
 */
export async function getAutomationsFromDB(): Promise<Automation[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return [];

    const response = await apiClient<{ success: boolean; data?: Automation[] }>("/automations", { method: "GET" }, token);
    return response.data || [];
  } catch (error) {
    console.error("Lỗi đọc automations từ API:", error);
    return [];
  }
}

/**
 * Đọc danh sách devices từ API ngoại.
 * Dùng trong Server Component.
 */
export async function getDevicesFromDB(): Promise<Device[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return [];

    const response = await apiClient<{ success: boolean; data?: Device[] }>("/home-assistant/devices", { method: "GET" }, token);
    return response.data || [];
  } catch (error) {
    console.error("Lỗi đọc devices từ API:", error);
    return [];
  }
}
