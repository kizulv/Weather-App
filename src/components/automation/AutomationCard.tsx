"use client";

import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Zap, Clock, Play, Trash2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AutomationCardProps {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { type: string; value: string };
  actions: { service: string; entity_id: string }[];
  last_ran_at?: string;
  onToggle: (id: string, enabled: boolean) => void;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function AutomationCard({
  id,
  name,
  enabled,
  trigger,
  actions,
  last_ran_at,
  onToggle,
  onClick,
  onDelete,
}: AutomationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onToggle(id, checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTriggerLabel = () => {
    if (trigger.type === "time") return `Vào lúc ${trigger.value}`;
    return "Theo điều kiện";
  };

  const getActionLabel = () => {
    if (actions.length === 0) return "Chưa có hành động";
    const action = actions[0];
    const serviceLabel = action.service.includes("turn_on") ? "Bật" : "Tắt";
    return `${serviceLabel} ${action.entity_id.split(".")[1] || action.entity_id}`;
  };

  const formatLastRan = (dateStr?: string) => {
    if (!dateStr) return "Chưa chạy";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-3xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] cursor-pointer",
        !enabled && "opacity-60"
      )}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button 
          title="Xóa tự động hóa"
          aria-label="Xóa tự động hóa"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl",
              enabled ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/40"
            )}>
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">{name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">
                {enabled ? "Đang hoạt động" : "Đã tắt"}
              </p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch 
              checked={enabled} 
              onCheckedChange={handleToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3 w-3 text-white/30" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Kích hoạt</span>
            </div>
            <p className="text-sm font-bold text-white/80">{getTriggerLabel()}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Play className="h-3 w-3 text-white/30" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Hành động</span>
            </div>
            <p className="text-sm font-bold text-white/80">{getActionLabel()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-white/20 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Settings2 className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Bấm để sửa</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            {last_ran_at && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                Chạy: {formatLastRan(last_ran_at)}
              </span>
            )}
            {enabled && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">Online</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
