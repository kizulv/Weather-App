"use client";

import { Thermometer, Droplets, CloudRain, Zap } from "lucide-react";
import { WeatherCard } from "@/components/weather-card";

interface WeatherMetricsGridProps {
  data: {
    temperature: number;
    humidity: number;
    rainMinutes: number;
    lightIntensity: number;
  };
}

export function WeatherMetricsGrid({ data }: WeatherMetricsGridProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <WeatherCard 
        label="Nhiệt độ" 
        value={data.temperature} 
        unit="°C" 
        icon={Thermometer} 
        color="orange"
        description="Nhiệt độ ngoài trời hiện tại"
      />
      <WeatherCard 
        label="Độ ẩm" 
        value={data.humidity} 
        unit="%" 
        icon={Droplets} 
        color="blue"
        description="Độ ẩm không khí tương đối"
      />
      <WeatherCard 
        label="Lượng mưa" 
        value={data.rainMinutes} 
        unit="phút" 
        icon={CloudRain} 
        color="green"
        description="Số phút mưa trung bình dự kiến"
      />
      <WeatherCard 
        label="Cường độ sáng" 
        value={data.lightIntensity} 
        unit="lux" 
        icon={Zap} 
        color="yellow"
        description="Cường độ ánh sáng mặt trời"
      />
    </section>
  );
}
