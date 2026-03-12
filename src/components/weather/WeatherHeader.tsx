"use client";

import { ConditionIcon } from "./ConditionIcon";

const conditionNames: Record<string, string> = {
  "WEATHER_THUNDERSTORM": "Có giông",
  "WEATHER_HEAVY_RAIN": "Mưa lớn",
  "WEATHER_MODERATE_RAIN": "Mưa vừa",
  "WEATHER_DRIZZLE": "Mưa phùn",
  "WEATHER_EXTREME_HEAT": "Nắng gắt",
  "WEATHER_HOT": "Trời nóng",
  "WEATHER_CLEAR": "Nắng đẹp",
  "WEATHER_MOSTLY_CLOUDY": "Nhiều mây",
  "WEATHER_OVERCAST": "U ám",
  "WEATHER_POSSIBLE_RAIN": "Có thể mưa",
  "WEATHER_COOL": "Trời mát",
  "WEATHER_DRY": "Khô ráo",
};

export function WeatherHeader({ condition, lastUpdated }: { condition: string; lastUpdated: string }) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          Hôm nay tại <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">Hà Nội</span>
        </h2>
        <p className="text-slate-400">Cập nhật lần cuối: {lastUpdated}</p>
      </div>
      
      <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="p-3 bg-orange-500/20 rounded-2xl">
          <ConditionIcon condition={condition} className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/40 uppercase tracking-wider text-right">Tình trạng</p>
          <p className="text-2xl font-bold text-white text-right">{conditionNames[condition] || condition} </p>
        </div>
      </div>
    </section>
  );
}

export { conditionNames };
