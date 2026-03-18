import { getWeatherDataFromCookies } from "@/lib/weather-fetch";
import { WeatherDashboard } from "@/components/WeatherDashboard";

export default async function WeatherPage() {
  // Fetch dữ liệu trực tiếp trên server — không cần client-side API call lần đầu
  const weatherData = await getWeatherDataFromCookies();

  return (
    <WeatherDashboard 
      initialData={weatherData ? {
        realtime: weatherData.realtime,
        past24h: weatherData.past24h,
        daily: weatherData.daily,
      } : null} 
    />
  );
}
