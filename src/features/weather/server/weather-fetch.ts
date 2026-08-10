import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { DailyWeather } from "./weather-data";

// Cho phép server gọi API qua IP nội bộ thay vì qua domain công khai (tránh hairpin routing)
const WEATHER_API_BASE = process.env.WEATHER_API_BASE_URL;

// ========== IN-MEMORY CACHE ==========
const CACHE_TTL_MS = 60 * 1000; // 60 giây — khớp với interval auto-refresh ở client

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
}

let weatherCache: WeatherCache | null = null;

function getCachedData(): WeatherData | null {
  if (weatherCache && (Date.now() - weatherCache.timestamp) < CACHE_TTL_MS) {
    return weatherCache.data;
  }
  return null;
}

function setCacheData(data: WeatherData) {
  weatherCache = { data, timestamp: Date.now() };
}
// =====================================

interface ExternalWeatherData {
  timestamp: number;
  temperature: number;
  humidity: number;
  is_raining: number;
  light_intensity: number;
  condition?: string;
  minTemperature?: number;
  maxTemperature?: number;
}

export interface WeatherData {
  success: boolean;
  realtime: {
    temperature: number;
    humidity: number;
    rainMinutes: number;
    lightIntensity: number;
    condition: string;
    lastUpdated: string;
  } | null;
  hourly: Array<{
    time: string;
    temperature: number;
    humidity: number;
    rainMinutes: number;
    lightIntensity: number;
    condition: string;
  }>;
  daily: DailyWeather[];
  past24h: Array<{
    timestamp: Date;
    time: string;
    temperature: number;
    humidity: number;
    rainMinutes: number;
    lightIntensity: number;
    condition: string;
  }>;
}

/**
 * Fetch dữ liệu thời tiết từ API ngoại.
 * Hàm này được dùng cho cả Server Component (page.tsx) và API Route (/api/weather).
 * Tự động cache kết quả trong 30 giây.
 */
export async function fetchWeatherData(token: string): Promise<WeatherData | null> {
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  const commonHeaders = {
    "Authorization": `Bearer ${token}`,
  };

  const emptyResponse: WeatherData = {
    success: true,
    realtime: null,
    hourly: [],
    daily: [],
    past24h: [],
  };

  try {
    const [res24h, res7d, resRt] = await Promise.all([
      fetch(`${WEATHER_API_BASE}/weather/history?deviceId=esp8266&range=-24h&aggregate=1h`, { 
        headers: commonHeaders,
        cache: "no-store",
      }),
      fetch(`${WEATHER_API_BASE}/weather/history?deviceId=esp8266&range=-7d&aggregate=1d`, { 
        headers: commonHeaders, 
        cache: "no-store",
      }),
      fetch(`${WEATHER_API_BASE}/weather/history?deviceId=esp8266&range=-1h&aggregate=none`, { 
        headers: commonHeaders, 
        cache: "no-store",
      })
    ]);

    if (!res24h.ok || !res7d.ok || !resRt.ok) {
      console.warn(`External API Warning: ${res24h.status} / ${res7d.status} / ${resRt.status}`);
      return emptyResponse;
    }

    const [data24h, data7d, dataRt] = await Promise.all([
      res24h.json().catch(() => null),
      res7d.json().catch(() => null),
      resRt.json().catch(() => null)
    ]);

    if (!data24h || !data24h.success || !Array.isArray(data24h.data)) {
      return emptyResponse;
    }

    // 1. Xử lý dữ liệu 24h (Realtime & Hourly & Chart)
    const raw24h = Array.isArray(data24h.data) ? data24h.data : [];
    const mapped24h = raw24h
      .filter((item: ExternalWeatherData) => Boolean(item && typeof item === "object" && typeof item.temperature === "number" && !isNaN(item.temperature)))
      .map((item: ExternalWeatherData) => {
        const date = new Date((item.timestamp || 0) * 1000);
        const h = date.getHours();
        const rainMinutes = Math.round(item.is_raining || 0);
        const lightIntensity = Math.round(item.light_intensity || 0);
        const condition = item.condition || "WEATHER_CLEAR";

        return {
          timestamp: date,
          time: (h === 0 ? 24 : h).toString() + ":00",
          temperature: Math.round((item.temperature || 0) * 10) / 10,
          humidity: Math.round(item.humidity || 0),
          rainMinutes,
          lightIntensity,
          condition,
        };
      });

    // Lấy Realtime từ API không Aggregate
    let realtime = null;
    const rawRt = dataRt && dataRt.success && Array.isArray(dataRt.data) ? dataRt.data : [];
    const validRt = rawRt.filter((item: ExternalWeatherData) => Boolean(item && typeof item === "object" && typeof item.temperature === "number" && !isNaN(item.temperature)));

    if (validRt.length > 0) {
      const latestRaw = validRt[validRt.length - 1];
      const rtDate = new Date((latestRaw.timestamp || 0) * 1000);
      realtime = {
        temperature: Math.round((latestRaw.temperature || 0) * 10) / 10,
        humidity: Math.round(latestRaw.humidity || 0),
        rainMinutes: Math.round(latestRaw.is_raining || 0),
        lightIntensity: Math.round(latestRaw.light_intensity || 0),
        condition: latestRaw.condition || "WEATHER_CLEAR",
        lastUpdated: rtDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
    } else if (mapped24h.length > 0) {
      const latest = mapped24h[mapped24h.length - 1];
      realtime = {
        temperature: latest.temperature,
        humidity: latest.humidity,
        rainMinutes: latest.rainMinutes,
        lightIntensity: latest.lightIntensity,
        condition: latest.condition,
        lastUpdated: latest.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
    }

    // 2. Xử lý dữ liệu 7d cho Daily Forecast
    let daily: DailyWeather[] = [];
    const raw7d = data7d && data7d.success && Array.isArray(data7d.data) ? data7d.data : [];
    const valid7d = raw7d.filter((item: ExternalWeatherData) => Boolean(item && typeof item === "object" && typeof item.temperature === "number" && !isNaN(item.temperature)));

    if (valid7d.length > 0) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;

      daily = valid7d.map((item: ExternalWeatherData) => {
        const d = new Date((item.timestamp || 0) * 1000);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.round((startOfToday - d.getTime()) / oneDayMs);

        let displayDate = "";
        if (diffDays === 0) {
          displayDate = "Hôm nay";
        } else if (diffDays === 1) {
          displayDate = "Hôm qua";
        } else {
          const weekday = d.getDay(); 
          const weekdayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
          displayDate = weekdayNames[weekday];
        }

        const temp = item.temperature || 0;
        return {
          date: displayDate,
          condition: item.condition || "WEATHER_CLEAR",
          avgTemp: Math.round(temp),
          minTemp: Math.round(item.minTemperature ?? temp),
          maxTemp: Math.round(item.maxTemperature ?? temp),
        };
      }).slice(-7);
    }

    const responseData: WeatherData = {
      success: true,
      realtime,
      hourly: mapped24h.slice(-6).reverse(), 
      daily: daily.reverse().slice(0, 7),
      past24h: mapped24h,
    };

    setCacheData(responseData);

    return responseData;
  } catch (error) {
    console.warn("Lỗi khi xử lý dữ liệu thời tiết:", error);
    return emptyResponse;
  }
}

/**
 * Hàm server-side: đọc token từ cookie và fetch weather data.
 * Dùng trong Server Component (page.tsx).
 */
export async function getWeatherDataFromCookies(): Promise<WeatherData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    return await fetchWeatherData(token);
  } catch (error) {
    console.warn("Lỗi khi fetch dữ liệu thời tiết từ cookies:", error);
    return {
      success: true,
      realtime: null,
      hourly: [],
      daily: [],
      past24h: [],
    };
  }
}
