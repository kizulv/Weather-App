"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { verifyToken } from "@/lib/auth/jwt";
import { Device } from "@/features/automation/types/automation";

/**
 * Helper để lấy token và xác thực quyền
 */
async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token || !(await verifyToken(token))) return null;
  return token;
}

/**
 * Lấy cấu hình Home Assistant
 */
export async function getHAConfigAction() {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<{ success: boolean; data?: { url: string; token: string } }>("/settings/home-assistant", { method: "GET" }, token);
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Cập nhật cấu hình Home Assistant
 */
export async function updateHAConfigAction(config: { url: string; token: string }) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<{ success: boolean; data?: unknown }>("/settings/home-assistant", {
      method: "POST",
      body: JSON.stringify(config),
    }, token);
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Kiểm tra kết nối và đồng bộ thiết bị Home Assistant
 */
export async function testHAConnectionAction(url: string, haToken: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    // 1. Lưu cấu hình qua API ngoại
    const saveRes = await apiClient<{ success: boolean; message?: string }>("/settings/home-assistant", {
      method: "POST",
      body: JSON.stringify({ url, token: haToken }),
    }, token);

    if (!saveRes.success) {
      return { success: false, message: saveRes.message || "Không thể lưu cấu hình" };
    }

    // 2. Gọi API ngoại để đồng bộ thiết bị
    const syncRes = await apiClient<{ success: boolean; message?: string }>("/home-assistant/sync", {
      method: "POST"
    }, token);

    if (!syncRes.success) {
      return { success: false, message: syncRes.message || "Đồng bộ thất bại" };
    }

    // 3. Lấy danh sách thiết bị thực tế
    const devicesRes = await apiClient<{ success: boolean; data?: Device[] }>("/home-assistant/devices", {
      method: "GET"
    }, token);

    const devices = devicesRes.data || [];

    return { 
      success: true, 
      message: "Kết nối và đồng bộ thành công!",
      deviceCount: devices.length,
      devices
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Lấy danh sách thiết bị Home Assistant
 */
export async function getHADevicesAction() {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<{ success: boolean; data?: Device[] }>("/home-assistant/devices", {
      method: "GET"
    }, token);
    return { success: true, data: data.data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Proxy điều khiển thiết bị Home Assistant
 */
export async function proxyHAAction(payload: unknown) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<{ success: boolean; data?: unknown }>("/home-assistant/proxy", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}
