"use client";

import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudFog, 
  Wind,
  ThermometerSun
} from "lucide-react";

export function ConditionIcon({ condition, className }: { condition: string; className?: string }) {
  switch (condition) {
    case "WEATHER_THUNDERSTORM": case "Giông": case "Thunderstorm": return <CloudLightning className={className} />;
    case "WEATHER_HEAVY_RAIN": case "WEATHER_MODERATE_RAIN": case "WEATHER_DRIZZLE": case "WEATHER_POSSIBLE_RAIN": case "Mưa": case "Rain": case "Drizzle": return <CloudRain className={className} />;
    case "WEATHER_EXTREME_HEAT": return <ThermometerSun className={className} />;
    case "WEATHER_HOT": case "WEATHER_CLEAR": case "WEATHER_DRY": case "Nắng": case "Clear": return <Sun className={className} />;
    case "WEATHER_MOSTLY_CLOUDY": case "Mây": case "Clouds": return <Cloud className={className} />;
    case "WEATHER_OVERCAST": case "Sương mù": case "Mist": case "Smoke": case "Haze": case "Dust": case "Fog": return <CloudFog className={className} />;
    case "WEATHER_COOL": case "Gió": return <Wind className={className} />;
    default: return <Cloud className={className} />;
  }
}
