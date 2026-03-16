export function ConditionIcon({ condition, className }: { condition: string; className?: string }) {
  const getIconPath = (cond: string) => {
    switch (cond) {
      case "WEATHER_THUNDERSTORM": case "Giông": case "Thunderstorm": return "/weather-icons/thunderstorm.png";
      case "WEATHER_HEAVY_RAIN": case "WEATHER_MODERATE_RAIN": case "WEATHER_DRIZZLE": case "WEATHER_POSSIBLE_RAIN": case "Mưa": case "Rain": case "Drizzle": return "/weather-icons/rainy.png";
      case "WEATHER_EXTREME_HEAT": return "/weather-icons/hot.png";
      case "WEATHER_HOT": case "WEATHER_CLEAR": case "WEATHER_DRY": case "Nắng": case "Clear": return "/weather-icons/sunny.png";
      case "WEATHER_MOSTLY_CLOUDY": case "Mây": case "Clouds": return "/weather-icons/cloudy.png";
      case "WEATHER_OVERCAST": case "Sương mù": case "Mist": case "Smoke": case "Haze": case "Dust": case "Fog": return "/weather-icons/foggy.png";
      case "WEATHER_COOL": case "Gió": return "/weather-icons/windy.png";
      default: return "/weather-icons/cloudy.png";
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={getIconPath(condition)} 
      alt={condition} 
      className={`${className} object-contain`}
    />
  );
}
