"use client";

import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Zap, Clock, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Action } from "@/features/automation/types/automation";
import { resolveAutomationActionBranches } from "@/features/automation/server/action-branches";

interface AutomationCardProps {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { type: string; value: string };
  actions?: Action[];
  actions_when_matched?: Action[];
  actions_when_unmatched?: Action[];
  last_ran_at?: string;
  onToggle: (id: string, enabled: boolean) => void;
  onClick: () => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => Promise<void>;
}

export function AutomationCard({
  id,
  name,
  enabled,
  trigger,
  actions,
  actions_when_matched,
  actions_when_unmatched,
  last_ran_at,
  onToggle,
  onClick,
  onDelete,
  onRun,
}: AutomationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) return;
    setIsRunning(true);
    try {
      await onRun(id);
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onToggle(id, checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTriggerLabel = () => {
    if (trigger.type === "time") return `Lúc ${trigger.value}`;
    return "Điều kiện";
  };

  const getActionLabel = () => {
    const { matchedActions, unmatchedActions } = resolveAutomationActionBranches({
      actions,
      actions_when_matched,
      actions_when_unmatched,
    });
    if (matchedActions.length === 0 && unmatchedActions.length === 0) return "Trống";
    return `Đạt: ${matchedActions.length} | Không đạt: ${unmatchedActions.length}`;
  };

  const formatLastRan = (dateStr?: string) => {
    if (!dateStr) return "Sẵn sàng";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return "Vừa chạy";
    if (diffMin < 60) return `${diffMin}p trước`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h trước`;
    
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all duration-500 cursor-pointer",
        "bg-slate-900/50 border-white/10 backdrop-blur-3xl rounded-2xl",
        "hover:bg-slate-900/70 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1",
        "min-h-30 px-6 pt-6 pb-4 flex flex-col justify-between",
        enabled ? "ring-1 ring-white/10 shadow-lg shadow-blue-500/5" : "opacity-60"
      )}
    >

      {/* Header Area */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-xl transition-all duration-500",
            enabled 
              ? "bg-white/5 text-white shadow-lg group-hover:bg-blue-500/20 scale-110" 
              : "bg-white/5 text-white/20"
          )}>
            <Zap className={cn("h-5 w-5", enabled && "fill-current")} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white transition-colors">
              {name}
            </h3>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-0.75">
              Automation Control
            </span>
          </div>
        </div>
        
        <div onClick={(e) => e.stopPropagation()} className="relative z-20">
          <Switch 
            checked={enabled} 
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="data-[state=checked]:bg-green-600 scale-110 border-white/10"
          />
        </div>
      </div>

      {/* Info & Metadata */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="mt-2 flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
          <Clock className="h-3.5 w-3.5 text-white/80" />
          <span className="text-xs font-semibold text-white/70">{getTriggerLabel()}</span>
          <ChevronRight className="h-3 w-3 text-white/80 ml-auto" />
          <span className="text-xs font-bold text-white/70">{getActionLabel()}</span>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            enabled ? "bg-emerald-500 animate-pulse" : "bg-white/20"
          )} />
          <span className="text-[10px] font-bold uppercase text-white/40">
            {formatLastRan(last_ran_at)}
          </span>
        </div>

        {/* Action Buttons (Visible on hover) */}
        <div className="flex items-center gap-2 duration-300">
          <button 
            title="Chạy ngay"
            disabled={isRunning}
            onClick={handleRun}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase transition-all",
              isRunning 
                ? "bg-white/5 text-white" 
                : "bg-blue-500/10 text-white hover:bg-blue-500/20 hover:text-white"
            )}
          >
            {isRunning ? "Running..." : "Chạy thử"}
          </button>
          <button 
            title="Xóa"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
