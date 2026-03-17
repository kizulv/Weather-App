"use client";

import { ConditionIcon } from "./ConditionIcon";
import { HourlyWeather, conditionNames } from "@/lib/weather-data";

interface HourlyForecastProps {
  data: HourlyWeather[];
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white/90 mb-3">24 giờ qua</h3>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex gap-3 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 w-full">
          {data.slice(-24).reverse().map((hour, i) => (
            <div key={i} className="flex-none w-26">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group text-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white/70">{hour.time}</span>
                    <span className="text-[10px] text-white/40 truncate w-20 mx-auto">
                      {conditionNames[hour.condition] || hour.condition}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <ConditionIcon condition={hour.condition} className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  <div className="pt-2 border-t border-white/5 w-full">
                    <span className="text-lg font-bold text-white">
                      {Math.round(hour.temperature)}°
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
