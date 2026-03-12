"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Clock } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const WeatherChart = dynamic(
  () => import("@/components/weather-chart").then((mod) => mod.WeatherChart),
  { ssr: false, loading: () => <div className="h-87.5 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" /> }
);

import { 
  mockHourlyData, 
  mockRealtimeData,
  mockDailyData,
  mockPast24hData
} from "@/lib/weather-data";

// New Components
import { WeatherHeader } from "@/components/weather/WeatherHeader";
import { WeatherMetricsGrid } from "@/components/weather/WeatherMetricsGrid";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { HourlyForecast } from "@/components/weather/HourlyForecast";

export default function WeatherDashboard() {
  const [data] = useState(mockRealtimeData);
  const [hourly] = useState(mockHourlyData);
  const [past24h] = useState(mockPast24hData);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 text-slate-200 selection:bg-blue-500/30">
      <div className="relative z-10 flex flex-col">
        {/* Navigation Sidebar Trigger */}
        <div className="p-4 flex items-center justify-between">
          <SidebarTrigger className="text-white/60 hover:text-white" />
          <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
            <Clock className="w-4 h-4" />
            <span suppressHydrationWarning>
              {currentTime.toLocaleTimeString('vi-VN')}
            </span>
          </div>
        </div>

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full pt-0">
          {/* Real-time Header */}
          <WeatherHeader condition={data.condition} lastUpdated={data.lastUpdated} />

          {/* Metric Cards Grid */}
          <WeatherMetricsGrid data={data} />

          {/* Chart Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <WeatherChart data={hourly} />
              <div className="flex-1">
                <HourlyForecast data={past24h} />
              </div>
            </div>
            <div className="flex flex-col">
              <DailyForecast data={mockDailyData} />
            </div>
          </section>

          {/* Advice Card moved below for balance */}
          <div className="p-6 rounded-2xl border border-white/10 bg-linear-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl relative overflow-hidden group max-w-7xl mx-auto w-full">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-lg font-semibold text-white/90 mb-2">Lời khuyên hôm nay</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Trời nắng đẹp, thích hợp cho các hoạt động ngoài trời. Lưu ý bôi kem chống nắng khi cường độ sáng đạt đỉnh vào buổi trưa.
            </p>
          </div>
        </main>
        
        <footer className="py-8 text-center text-white/20 text-xs border-t border-white/5">
          © 2026 Weather Intelligence Dashboard • Thiết kế cao cấp bởi Antigravity
        </footer>
      </div>
    </div>
  );
}
