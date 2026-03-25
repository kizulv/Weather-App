/**
 * Shared API Client for api.pcthanh.com
 */

const API_BASE_URL = process.env.WEATHER_API_BASE_URL || "";

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = API_BASE_URL;
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
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
    const error = new Error(errorData.message || `API Error: ${response.statusText}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
 
  return response.json() as Promise<T>;
}
