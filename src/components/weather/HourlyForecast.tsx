"use client";

import { ConditionIcon } from "./ConditionIcon";
import { HourlyWeather, conditionNames } from "@/lib/weather-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface HourlyForecastProps {
  data: HourlyWeather[];
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white/90 mb-3">24 giờ qua</h3>
      <div className="flex-1 flex flex-col justify-center">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {data.slice(-6).reverse().map((hour, i) => (
              <CarouselItem key={i} className="pl-5 basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group text-center h-full">
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
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
