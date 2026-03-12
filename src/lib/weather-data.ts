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

// Mock data based on the requested metrics
export const mockHourlyData: HourlyWeather[] = [
  { time: "00:00", temperature: 24, humidity: 80, rainMinutes: 0, lightIntensity: 0, condition: "WEATHER_MOSTLY_CLOUDY" },
  { time: "04:00", temperature: 22, humidity: 85, rainMinutes: 5, lightIntensity: 0, condition: "WEATHER_MODERATE_RAIN" },
  { time: "08:00", temperature: 26, humidity: 70, rainMinutes: 0, lightIntensity: 300, condition: "WEATHER_CLEAR" },
  { time: "12:00", temperature: 32, humidity: 60, rainMinutes: 0, lightIntensity: 800, condition: "WEATHER_EXTREME_HEAT" },
  { time: "16:00", temperature: 30, humidity: 65, rainMinutes: 10, lightIntensity: 400, condition: "WEATHER_POSSIBLE_RAIN" },
  { time: "20:00", temperature: 26, humidity: 75, rainMinutes: 0, lightIntensity: 0, condition: "WEATHER_CLEAR" },
];

export const mockRealtimeData: RealtimeWeather = {
  temperature: 28.5,
  humidity: 65,
  rainMinutes: 0,
  lightIntensity: 450,
  condition: "WEATHER_CLEAR",
  lastUpdated: new Date().toLocaleTimeString("vi-VN"),
};

export const mockDailyData: DailyWeather[] = [
  { date: "Hôm nay", condition: "WEATHER_CLEAR", avgTemp: 28.5, minTemp: 22, maxTemp: 33 },
  { date: "Hôm qua", condition: "WEATHER_MOSTLY_CLOUDY", avgTemp: 26.0, minTemp: 21, maxTemp: 31 },
  { date: "10/03", condition: "WEATHER_HEAVY_RAIN", avgTemp: 24.5, minTemp: 20, maxTemp: 28 },
  { date: "09/03", condition: "WEATHER_MODERATE_RAIN", avgTemp: 23.0, minTemp: 19, maxTemp: 26 },
  { date: "08/03", condition: "WEATHER_THUNDERSTORM", avgTemp: 25.5, minTemp: 21, maxTemp: 30 },
  { date: "07/03", condition: "WEATHER_EXTREME_HEAT", avgTemp: 29.0, minTemp: 23, maxTemp: 34 },
  { date: "06/03", condition: "WEATHER_OVERCAST", avgTemp: 27.5, minTemp: 22, maxTemp: 32 },
];

export const mockPast24hData: HourlyWeather[] = Array.from({ length: 24 }, (_, i) => {
  const hour = (new Date().getHours() - (23 - i) + 24) % 24;
  const time = `${hour.toString().padStart(2, '0')}:00`;
  
  // Tạo dữ liệu biến thiên nhẹ xung quanh các giá trị thực tế
  const baseTemp = 24 + Math.sin((hour - 6) * Math.PI / 12) * 6;
  const conditions = ["WEATHER_CLEAR", "WEATHER_MOSTLY_CLOUDY", "WEATHER_POSSIBLE_RAIN", "WEATHER_CLEAR", "WEATHER_HOT"];
  
  return {
    time,
    temperature: Math.round(baseTemp + Math.random() * 2),
    humidity: Math.round(70 + Math.random() * 20),
    rainMinutes: hour > 14 && hour < 18 ? Math.round(Math.random() * 15) : 0,
    lightIntensity: hour > 6 && hour < 18 ? Math.round(Math.random() * 1000) : 0,
    condition: conditions[Math.floor(Math.random() * conditions.length)]
  };
});
