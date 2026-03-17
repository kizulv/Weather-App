"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SidebarTrigger } from "@/components/ui/sidebar";

const WeatherChart = dynamic(
  () => import("@/components/weather-chart").then((mod) => mod.WeatherChart),
  { ssr: false, loading: () => <div className="h-87.5 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" /> }
);

// Định nghĩa kiểu dữ liệu mặc định để tránh lỗi khi render lần đầu
import { RealtimeWeather, HourlyWeather, DailyWeather } from "@/lib/weather-data";

// New Components
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { HourlyForecast } from "@/components/weather/HourlyForecast";


export default function WeatherDashboard() {
  const [data, setData] = useState<RealtimeWeather | null>(null);
  const [past24h, setPast24h] = useState<HourlyWeather[]>([]);
  const [daily, setDaily] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm fetch dữ liệu từ API
  const fetchWeatherData = async () => {
    try {
      // Ép trình duyệt không được dùng cache kết quả cũ bằng cache: no-store và timestamp
      const response = await fetch(`/api/weather?t=${Date.now()}`, { 
        cache: "no-store" 
      });
      
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result && result.success) {
          setData(result.realtime);
          setPast24h(result.past24h);
          setDaily(result.daily);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thời tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    const dataTimer = setInterval(fetchWeatherData, 60000);
    return () => clearInterval(dataTimer);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex-1 min-h-svh flex items-center justify-center bg-[#020617]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/40 text-sm font-medium animate-pulse">Đang kết nối với trạm khí tượng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-svh text-slate-200 selection:bg-blue-500/30">
      <div className="relative z-10 flex flex-col min-h-svh">
        {/* Navigation Sidebar Trigger */}
        <div className="p-4 flex items-center justify-between">
          <SidebarTrigger className="text-white/60 hover:text-white" />
        </div>

        <main className="flex-1 p-4 md:p-8 md:pt-0 space-y-8 max-w-8xl mx-auto w-full pt-0 min-w-0">
          {/* Combined Real-time Weather Card */}
          {data && <CurrentWeatherCard data={data} />}

          {/* Chart Section - Flex Layout for dynamic width */}
          <section className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              <WeatherChart data={past24h} />
              <div className="flex-1">
                <HourlyForecast data={past24h} />
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-95 lg:min-w-95 shrink-0">
              <DailyForecast data={daily} />
            </div>
          </section>

        </main>

        
        <footer className="h-15 flex items-center justify-center text-center text-white/20 text-[10px] sm:text-xs border-t border-white/5">
          © 2026 Weather Intelligence Dashboard • Thiết kế cao cấp bởi Phạm Công Thành
        </footer>
      </div>
    </div>
  );
}
