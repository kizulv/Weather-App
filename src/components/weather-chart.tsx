"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { HourlyWeather } from "@/lib/weather-data";
import { formatWeatherValue } from "@/lib/utils";

interface WeatherChartProps {
  data: HourlyWeather[];
}

export function WeatherChart({ data }: WeatherChartProps) {
  return (
    <div className="h-87.5 w-full rounded-2xl border border-white/10 bg-black/20 p-4 md:p-6 backdrop-blur-xl shadow-2xl flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-white/90">Xu hướng nhiệt độ 24h qua</h3>
          <p className="text-xs text-white/40">Dữ liệu ghi nhận theo từng giờ</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-160 h-full">
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={[...data].reverse()} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#ffffff40', fontSize: 12 }} 
                dy={10}
                interval={1} // Hiển thị nhiều tick hơn khi đã có scroll
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#ffffff40', fontSize: 12 }} 
                tickFormatter={(value) => formatWeatherValue(value).toString()}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                  if (value === undefined) return ["", ""];
                  if (Array.isArray(value)) {
                    return [value.map(v => formatWeatherValue(v)).join(", "), ""];
                  }
                  return [formatWeatherValue(value as number | string), "Nhiệt độ (°C)"];
                }}
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar
                dataKey="temperature"
                fill="url(#colorTemp)"
                radius={[4, 4, 0, 0]}
                name="Nhiệt độ"
                barSize={16}
              >
                <LabelList dataKey="temperature" position="top" fill="#ffffff60" fontSize={10} offset={8} formatter={(val: unknown) => val != null ? Math.round(Number(val)) : ""} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
