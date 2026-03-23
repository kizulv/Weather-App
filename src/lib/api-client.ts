/**
 * Shared API Client for api.pcthanh.com
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.pcthanh.com/v1";

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
 
  const response = await fetch(url, {
    ...options,
    headers,
  });
 
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }
 
  return response.json() as Promise<T>;
}
