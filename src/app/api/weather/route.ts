import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { DailyWeather } from "@/lib/weather-data";

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

  // Lấy dữ liệu thực tế từ API ngoại (24h cho chart/realtime và 7d cho forecast)
  try {
    const commonHeaders = {
      "Authorization": `Bearer ${token}`,
    };

    // Gọi song song 3 requests để tối ưu tốc độ.
    // data 24h và 7d cấu hình aggregate để tối ưu biểu đồ/dự báo
    // data Rt (Realtime) gọi trong 1h gần nhất không aggregate để lấy chính xác số đo hiện tại
    const [res24h, res7d, resRt] = await Promise.all([
      fetch(`https://api.pcthanh.com/v1/weather/history?deviceId=esp8266&range=-24h&aggregate=1h`, { 
        headers: commonHeaders,
        cache: "no-store" 
      }),
      fetch(`https://api.pcthanh.com/v1/weather/history?deviceId=esp8266&range=-7d&aggregate=1d`, { 
        headers: commonHeaders, 
        cache: "no-store"
      }),
      fetch(`https://api.pcthanh.com/v1/weather/history?deviceId=esp8266&range=-1h&aggregate=none`, { 
        headers: commonHeaders, 
        cache: "no-store"
      })
    ]);

    if (!res24h.ok || !res7d.ok || !resRt.ok) {
      throw new Error(`External API Error: ${res24h.status} / ${res7d.status} / ${resRt.status}`);
    }

    const [data24h, data7d, dataRt] = await Promise.all([res24h.json(), res7d.json(), resRt.json()]);
    
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

    if (data24h.success && Array.isArray(data24h.data)) {
      // 1. Xử lý dữ liệu 24h (Realtime & Hourly & Chart)
      const mapped24h = data24h.data.map((item: ExternalWeatherData) => {
        const date = new Date(item.timestamp * 1000); // Chuyển từ giây sang mili giây
        const h = date.getHours();
        const rainMinutes = Math.round(item.is_raining);
        const lightIntensity = Math.round(item.light_intensity);
        
        const condition = item.condition || "WEATHER_CLEAR";

        return {
          timestamp: date,
          time: (h === 0 ? 24 : h).toString() + ":00",
          temperature: Math.round(item.temperature * 10) / 10,
          humidity: Math.round(item.humidity),
          rainMinutes: rainMinutes,
          lightIntensity: lightIntensity,
          condition,
        };
      });

      // Lấy Realtime từ API không Aggregate (Điểm cuối cùng trong 1h gần nhất)
      let realtime = null;
      if (dataRt.success && Array.isArray(dataRt.data) && dataRt.data.length > 0) {
        const latestRaw = dataRt.data[dataRt.data.length - 1] as ExternalWeatherData;
        const rtDate = new Date(latestRaw.timestamp * 1000);
        realtime = {
          temperature: Math.round(latestRaw.temperature * 10) / 10,
          humidity: Math.round(latestRaw.humidity),
          rainMinutes: Math.round(latestRaw.is_raining),
          lightIntensity: Math.round(latestRaw.light_intensity),
          condition: latestRaw.condition || "WEATHER_CLEAR",
          lastUpdated: rtDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        };
      } else {
        // Fallback về 24h nếu API Realtime bị lỗi
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
      if (data7d.success && Array.isArray(data7d.data)) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        daily = data7d.data.map((item: ExternalWeatherData) => {
          const d = new Date(item.timestamp * 1000);
          d.setHours(0, 0, 0, 0);

          // Xử lý nhãn ngày (Hôm nay, Hôm qua, Thứ...)
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

          return {
            date: displayDate,
            condition: item.condition || "WEATHER_CLEAR",
            avgTemp: Math.round(item.temperature),
            minTemp: Math.round(item.minTemperature ?? item.temperature),
            maxTemp: Math.round(item.maxTemperature ?? item.temperature),
          };
        }).slice(-7);
      }

      return NextResponse.json({
        success: true,
        realtime,
        hourly: mapped24h.slice(-6).reverse(), 
        daily: daily.reverse().slice(0, 7),
        past24h: mapped24h,
      });

    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Không tìm thấy dữ liệu thời tiết" 
      }, { status: 404 });
    }
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu từ api.pcthanh.com:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Lỗi khi kết nối tới máy chủ dữ liệu ngoại",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 502 });
  }
}



