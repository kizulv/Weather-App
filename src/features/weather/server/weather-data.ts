import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudFog, 
  Wind,
  ThermometerSun,
  type LucideIcon
} from "lucide-react";

export const conditionNames: Record<string, string> = {
  "WEATHER_THUNDERSTORM": "Có giông",
  "WEATHER_HEAVY_RAIN": "Mưa lớn",
  "WEATHER_MODERATE_RAIN": "Mưa vừa",
  "WEATHER_DRIZZLE": "Mưa phùn",
  "WEATHER_EXTREME_HEAT": "Nắng gắt",
  "WEATHER_HOT": "Trời nóng",
  "WEATHER_CLEAR": "Nắng đẹp",
  "WEATHER_MOSTLY_CLOUDY": "Nhiều mây",
  "WEATHER_OVERCAST": "U ám",
  "WEATHER_POSSIBLE_RAIN": "Có mưa",
  "WEATHER_COOL": "Trời mát",
  "WEATHER_DRY": "Khô ráo",
};

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  rainMinutes: number;
  lightIntensity: number;
  condition: string;
}

export interface RealtimeWeather {
  temperature: number;
  humidity: number;
  rainMinutes: number;
  lightIntensity: number;
  condition: string;
  lastUpdated: string;
}

export interface DailyWeather {
  date: string;
  condition: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
}

export const weatherIconMap: Record<string, LucideIcon> = {
  "WEATHER_THUNDERSTORM": CloudLightning,
  "WEATHER_HEAVY_RAIN": CloudRain,
  "WEATHER_MODERATE_RAIN": CloudRain,
  "WEATHER_DRIZZLE": CloudRain,
  "WEATHER_EXTREME_HEAT": ThermometerSun,
  "WEATHER_HOT": Sun,
  "WEATHER_CLEAR": Sun,
  "WEATHER_MOSTLY_CLOUDY": Cloud,
  "WEATHER_OVERCAST": CloudFog,
  "WEATHER_POSSIBLE_RAIN": CloudRain,
  "WEATHER_COOL": Wind,
  "WEATHER_DRY": Sun,
  // Giữ lại các phím cũ để đảm bảo tính tương thích nếu cần
  "Nắng": Sun, "Mây": Cloud, "Mưa": CloudRain, "Giông": CloudLightning,
  "Clear": Sun, "Clouds": Cloud, "Rain": CloudRain,
};

export const getIconByCondition = (condition: string) => {
  return weatherIconMap[condition] || Cloud;
};
// Kết thúc các định nghĩa và mapping. Dữ liệu mock đã bị loại bỏ.


