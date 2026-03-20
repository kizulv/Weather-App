"use client";

import { Droplets, Zap, MapPin, Clock, LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { ConditionIcon } from "./ConditionIcon";
import { formatWeatherValue, cn } from "@/lib/utils";
import { conditionNames } from "@/features/weather/server/weather-data";

interface Particle {
  id: number;
  left?: string;
  delay: string;
  duration: string;
  width?: string;
  height?: string;
  top?: string;
  opacity?: number;
}

interface CurrentWeatherCardProps {
  data: {
    temperature: number;
    humidity: number;
    rainMinutes: number;
    lightIntensity: number;
    condition: string;
    lastUpdated: string;
  };
}

function WeatherEffects({ condition }: { condition: string }) {
  const [particles, setParticles] = useState<{ drops: Particle[], clouds: Particle[] } | null>(null);

  useEffect(() => {
    // We use a small timeout to ensure it runs correctly and avoids hydration issues
    const timer = setTimeout(() => {
      const drops = [...Array(50)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${0.3 + Math.random() * 0.4}s`
      }));

      const clouds = [...Array(6)].map((_, i) => ({
        id: i,
        width: `${150 + Math.random() * 250}px`,
        height: `${60 + Math.random() * 80}px`,
        top: `${Math.random() * 70}%`,
        duration: `${60 + Math.random() * 60}s`,
        delay: `-${Math.random() * 60}s`,
        opacity: 0.1 + Math.random() * 0.15
      }));

      setParticles({ drops, clouds });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!particles) return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
      <style jsx global>{`
        @keyframes rain-fall {
          0% { transform: translateY(-20vh) translateX(0) scaleY(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(120vh) translateX(-15vh) scaleY(1.2); opacity: 0; }
        }
        .animate-rain-fall {
          animation-name: rain-fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes drift-cloud {
          from { transform: translateX(-150%); }
          to { transform: translateX(150vw); }
        }
        .animate-drift-cloud {
          animation-name: drift-cloud;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        @keyframes lightning-flash {
          0%, 93%, 98%, 100% { background-color: transparent; }
          94%, 99% { background-color: rgba(255, 255, 255, 0.4); }
          95% { background-color: rgba(255, 255, 255, 0.8); }
        }
        .animate-lightning-flash {
          animation: lightning-flash 8s infinite;
        }
        @keyframes float-sun {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.15; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.35; }
        }
        .animate-float-sun {
          animation: float-sun 12s ease-in-out infinite;
        }
        @keyframes sun-ray {
          0% { transform: scale(1) rotate(0deg); opacity: 0.1; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.25; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.1; }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-icon {
          animation: float-icon 6s ease-in-out infinite;
        }
        @keyframes spin-icon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-icon {
          animation: spin-icon 40s linear infinite;
        }
      `}</style>
      
      {/* BACKGROUND WEATHER ICON */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 opacity-40 pointer-events-none z-0">
        <ConditionIcon 
          condition={condition} 
          className={cn(
            "w-full h-full object-contain filter drop-shadow-md",
            (condition === "WEATHER_HOT" || condition === "WEATHER_EXTREME_HEAT") ? "animate-spin-icon" : "animate-float-icon"
          )} 
        />
      </div>

      {/* THUNDERSTORM LAYER */}
      {condition === "WEATHER_THUNDERSTORM" && (
        <div className="absolute inset-0 animate-lightning-flash mix-blend-overlay z-0" />
      )}

      {/* CLOUDS LAYER */}
      {(condition.includes("CLOUDY") || condition === "WEATHER_OVERCAST" || condition === "WEATHER_THUNDERSTORM" || condition.includes("RAIN")) && (
        <div className="absolute inset-0 z-0">
          {particles.clouds.map((drift) => (
            <div 
              key={drift.id} 
              className="absolute bg-white/40 rounded-full blur-[45px] animate-drift-cloud"
              style={{
                width: drift.width,
                height: drift.height,
                top: drift.top,
                animationDuration: drift.duration,
                animationDelay: drift.delay,
                opacity: (condition.includes("RAIN") || condition === "WEATHER_THUNDERSTORM") ? Number(drift.opacity) * 0.7 : drift.opacity
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* RAIN LAYER */}
      {(condition.includes("RAIN") || condition === "WEATHER_DRIZZLE" || condition === "WEATHER_POSSIBLE_RAIN" || condition === "WEATHER_THUNDERSTORM") && (
        <div className="absolute inset-0 opacity-70 z-0">
          {particles.drops.slice(0, condition === "WEATHER_HEAVY_RAIN" || condition === "WEATHER_THUNDERSTORM" ? 50 : (condition === "WEATHER_DRIZZLE" ? 20 : 35)).map((drop) => (
            <div 
              key={drop.id} 
              className="absolute bg-linear-to-b from-transparent via-white/50 to-white/80 w-px h-14 animate-rain-fall"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration
              }}
            />
          ))}
        </div>
      )}

      {/* CLEAR / SUNNY LAYER */}
      {(condition === "WEATHER_CLEAR" || condition === "WEATHER_HOT" || condition === "WEATHER_EXTREME_HEAT") && (
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-400/20 rounded-full blur-[80px] animate-float-sun" />
          <div className="absolute -top-10 -right-10 w-125 h-125 bg-yellow-300/10 rounded-full blur-[100px] animate-sun-ray mix-blend-overlay" />
          <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-red-400/10 rounded-full blur-[60px] animate-float-sun" style={{ animationDelay: '3s', animationDuration: '15s' }} />
        </div>
      )}

      {/* FOG/HAZE OVERLAY */}
      {(condition === "WEATHER_OVERCAST") && (
        <div className="absolute inset-0 bg-white/5 blur-md z-0" />
      )}
    </div>
  );
}

const weatherThemes: Record<string, string> = {
  "WEATHER_CLEAR": "from-orange-500/15 to-orange-600/5 border-orange-500/20",
  "WEATHER_EXTREME_HEAT": "from-red-500/15 to-orange-600/5 border-red-500/20",
  "WEATHER_HOT": "from-orange-400/15 to-red-500/5 border-orange-400/20",
  "WEATHER_MOSTLY_CLOUDY": "from-blue-400/15 to-indigo-500/5 border-blue-400/20",
  "WEATHER_OVERCAST": "from-slate-500/15 to-slate-600/5 border-slate-500/20",
  "WEATHER_HEAVY_RAIN": "from-blue-600/15 to-indigo-700/5 border-blue-600/20",
  "WEATHER_MODERATE_RAIN": "from-blue-500/15 to-indigo-600/5 border-blue-500/20",
  "WEATHER_THUNDERSTORM": "from-purple-600/15 to-indigo-900/5 border-purple-600/20",
};

export function CurrentWeatherCard({ data }: CurrentWeatherCardProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setCurrentTime(new Date());
    }, 0);
    
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const conditionName = conditionNames[data.condition] || data.condition;
  const theme = weatherThemes[data.condition] || "from-white/10 to-white/5 border-white/10";

  return (
    <section className={cn(
      "relative overflow-hidden rounded-3xl border bg-linear-to-br px-3 py-6 md:px-6 md:py-8 backdrop-blur-3xl shadow-lg transition-all duration-700 group w-full",
      theme
    )}>
      {/* Immersive Weather Effects Background */}
      <WeatherEffects condition={data.condition} />
      
      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-6 w-full">
        {/* Main Info Group */}
        <div className="flex flex-col xl:flex-row items-center gap-6 xl:gap-8 flex-1 w-full xl:w-auto">
          {/* Location & Title */}
          <div className="flex flex-col gap-2 items-center xl:items-start text-center xl:text-left w-full xl:w-fit">
            <div className="flex items-center gap-1.5 text-white/90 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20">
              <MapPin className="w-2.5 h-2.5 text-white" />
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">Lai Châu • VN</span>
            </div>
            <h2 className="text-sm font-bold text-white/50 whitespace-nowrap">
              Thời tiết <span className="text-white">hiện tại</span>
            </h2>
          </div>

          {/* Temperature & State - Responsive Box */}
          <div className="flex flex-row items-center justify-center gap-25 xl:gap-4 w-full xl:w-auto text-white">
            <div className="relative flex items-start">
              <span className="text-5xl sm:text-6xl xl:text-6xl font-black text-white tracking-tighter drop-shadow-md font-sans">
                {formatWeatherValue(data.temperature)}
              </span>
              <span className="text-2xl font-bold text-white -mt-1 ml-1 opacity-80">°C</span>
            </div>
            
            <div className="h-12 w-0.5 bg-white/10 hidden md:block" />

            <div className="flex items-center gap-4 sm:gap-3">
              <div className="p-2.5 bg-white/10 sm:bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm hidden sm:block">
                <ConditionIcon condition={data.condition} className="w-8 h-8 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-lg sm:text-sm font-black text-white leading-tight">{conditionName}</p>
                <div className="flex items-center gap-1 text-white/70 mt-1.5 bg-black/20 sm:bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5" suppressHydrationWarning>
                  <Clock className="w-2.5 h-2.5 text-white" />
                  <span className="text-[10px] font-bold tracking-widest mt-0.5">
                    {isMounted && currentTime ? currentTime.toLocaleTimeString('vi-VN') : "--:--:--"}
                  </span>
                </div>
              </div>
            </div>
        </div>
      </div>
        
        {/* Metrics Row - Occupies exactly 1/2 of the width on desktop */}
        <div className="grid grid-cols-2 gap-3 w-full xl:w-1/3 shrink-0">
          <MetricSmall 
            icon={Droplets} 
            label="Độ ẩm" 
            value={formatWeatherValue(data.humidity)} 
            unit="%" 
          />
          <MetricSmall 
            icon={Zap} 
            label="Ánh sáng" 
            value={formatWeatherValue(data.lightIntensity)} 
            unit="lux" 
          />
        </div>
      </div>
    </section>
  );
}

function MetricSmall({ 
  icon: Icon, 
  label, 
  value, 
  unit 
}: { 
  icon: LucideIcon, 
  label: string, 
  value: string | number, 
  unit: string 
}) {
  return (
    <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl group/metric hover:bg-white/10 transition-all duration-300 w-full min-w-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 shadow-xs shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col min-w-0 leading-tight">
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-md font-bold text-white tracking-tight truncate">{value}</span>
          {unit && <span className="text-xs font-bold text-white/60 uppercase shrink-0">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
