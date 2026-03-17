"use client";

import { ConditionIcon } from "./ConditionIcon";
import { DailyWeather, conditionNames } from "@/lib/weather-data";
import { formatWeatherValue } from "@/lib/utils";

interface DailyForecastProps {
  data: DailyWeather[];
}

export function DailyForecast({ data }: DailyForecastProps) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white/90 mb-4">7 ngày gần nhất</h3>
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {data.map((day, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group flex-1">
            <div className="flex items-center gap-3">
              <div className="flex flex-col w-16">
                <span className="text-sm font-medium text-white/70">{day.date}</span>
                <span className="text-[10px] text-white/40 truncate max-w-full">
                  {conditionNames[day.condition] || day.condition}
                </span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <ConditionIcon condition={day.condition} className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 justify-end w-32 sm:w-42">
              <span className="text-base font-bold text-white w-8 text-right">{formatWeatherValue(day.avgTemp)}°</span>
              <div className="flex items-center gap-2 select-none">
                <span className="text-[10px] text-blue-400/80 font-bold w-6 text-right leading-none">{formatWeatherValue(day.minTemp)}°</span>
                
                <div className="h-1.5 w-10 sm:w-13 rounded-full bg-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-orange-400 to-red-500" />
                </div>
                
                <span className="text-[10px] text-red-500/80 font-bold w-6 text-left leading-none">{formatWeatherValue(day.maxTemp)}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
