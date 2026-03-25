"use client";

import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Zap, Clock, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Action, Device } from "@/features/automation/types/automation";
import { resolveAutomationActionBranches } from "../utils/action-branches";

import { serviceLabels } from "./shared/service-labels";

interface AutomationCardProps {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { type: string; value: string };
  actions?: Action[];
  actions_when_matched?: Action[];
  actions_when_unmatched?: Action[];
  devices?: Device[];
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
  devices = [],
  last_ran_at,
  onToggle,
  onClick,
  onDelete,
}: AutomationCardProps) {
  const [] = useState(false);


  const handleToggle = async (checked: boolean) => {
    await onToggle(id, checked);
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
    
    // Ưu tiên hiển thị hành động đầu tiên của nhánh thỏa mãn
    const mainAction = matchedActions[0] || unmatchedActions[0];
    
    if (!mainAction) return "Trống";
    
    const serviceInfo = serviceLabels[mainAction.service];
    const serviceText = serviceInfo?.label || mainAction.service;
    
    const deviceName = devices.find(d => d.entity_id === mainAction.entity_id)?.name || mainAction.entity_id;
    
    const extraCount = matchedActions.length + unmatchedActions.length - 1;
    const extraSuffix = extraCount > 0 ? ` (+${extraCount})` : "";
    
    return `${serviceText} ${deviceName}${extraSuffix}`;
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
            className="data-[state=checked]:bg-green-600 scale-110 border-white/10"
          />
        </div>
      </div>

      {/* Info & Metadata */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="mt-2 flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex flex-row items-center gap-1 shrink-0">
            <Clock className="h-3.5 w-3.5 text-white/80" />
            <span className="text-xs font-semibold text-white/70">{getTriggerLabel()}</span>
          </div>
          <div className="flex-1 flex flex-row items-center overflow-hidden gap-1">
            <ChevronRight className="h-3 w-3 text-white/80" />
            <span className="text-xs font-bold text-white/70 truncate">{getActionLabel()}</span>
          </div>
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
            title="Xóa"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
