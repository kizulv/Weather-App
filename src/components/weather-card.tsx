import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: "green" | "orange" | "blue" | "red" | "purple" | "yellow";
  description?: string;
  className?: string;
}

const colorStyles = {
  green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10",
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400 shadow-orange-500/10",
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400 shadow-blue-500/10",
  red: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-400 shadow-red-500/10",
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400 shadow-purple-500/10",
  yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400 shadow-yellow-500/10",
};

const iconBackgrounds = {
  green: "bg-emerald-500/10",
  orange: "bg-orange-500/10",
  blue: "bg-blue-500/10",
  red: "bg-red-500/10",
  purple: "bg-purple-500/10",
  yellow: "bg-yellow-500/10",
};

export function WeatherCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  description,
  className
}: WeatherCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-linear-to-br p-6 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg backdrop-blur-md",
      colorStyles[color],
      className
    )}>
      {/* Decorative glow in the corner */}
      <div className={cn(
        "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-30",
        color === 'green' ? 'bg-emerald-500' :
        color === 'orange' ? 'bg-orange-500' :
        color === 'blue' ? 'bg-blue-500' :
        color === 'red' ? 'bg-red-500' :
        color === 'purple' ? 'bg-purple-500' : 'bg-yellow-500'
      )} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider opacity-60">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {value}
            </h3>
            {unit && <span className="text-sm font-medium opacity-60">{unit}</span>}
          </div>
        </div>
        <div className={cn("rounded-xl p-2.5", iconBackgrounds[color])}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
      </div>

      {description && (
        <p className="mt-4 text-xs font-medium opacity-50">
          {description}
        </p>
      )}
    </div>
  );
}
