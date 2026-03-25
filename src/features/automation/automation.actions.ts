"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { verifyToken } from "@/lib/auth/jwt";
import { Automation, Action } from "./types/automation";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ExecutionResult {
  status: "success" | "error";
  message?: string;
  [key: string]: unknown;
}

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
 * Lấy danh sách automation
 */
export async function getAutomationsAction() {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<ApiResponse<Automation[]>>("/automations", { method: "GET" }, token);
    return { success: true, data: data.data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Tạo mới automation
 */
export async function createAutomationAction(automation: Partial<Automation>) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<ApiResponse<Automation>>("/automations", {
      method: "POST",
      body: JSON.stringify(automation),
    }, token);
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Cập nhật automation
 */
export async function updateAutomationAction(id: string, automation: Partial<Automation>) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<ApiResponse<Automation>>(`/automations/${id}`, {
      method: "PUT",
      body: JSON.stringify(automation),
    }, token);
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Xóa automation
 */
export async function deleteAutomationAction(id: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    await apiClient(`/automations/${id}`, { method: "DELETE" }, token);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return { success: false, message };
  }
}

/**
 * Chạy thử (Execute) một automation cụ thể
 */
export async function executeAutomationAction(id: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<{ success: boolean; message?: string }> (`/automations/${id}/execute`, { method: "POST" }, token);
    return { success: true, message: data.message || "Thực thi thành công" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi thực thi";
    return { success: false, message };
  }
}

/**
 * Thực thi một hành động trực tiếp (không qua automation)
 */
export async function executeActionsAction(actions: Action[]) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };
  const payload = Array.isArray(actions) ? { actions } : actions;

  try {
    const result = await apiClient<ApiResponse<ExecutionResult[]>>("/automations/actions/execute", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
    return { success: true, data: result.data || [], message: result.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi thực thi";
    return { success: false, message };
  }
}

/**
 * Kiểm tra điều kiện (Check condition)
 */
export async function checkConditionsAction(payload: { conditions: unknown[]; mode: string; trigger?: unknown }) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<ApiResponse<unknown>>("/automations/conditions/check", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
    return { success: true, data: data.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi kiểm tra";
    return { success: false, message };
  }
}

/**
 * Lấy lịch sử log của automation
 */
export async function getAutomationLogsAction(automation_id: string, limit: number = 10) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized" };

  try {
    const data = await apiClient<ApiResponse<unknown[]>>(`/automations/logs?automation_id=${automation_id}&limit=${limit}`, {
      method: "GET"
    }, token);
    return { success: true, data: data.data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi lấy log";
    return { success: false, message };
  }
}
