"use client"

import { Clock } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trigger } from "@/features/automation/types/automation"
import { TriggerTime } from "./TriggerTime"

interface TriggerSectionProps {
  trigger: Trigger
  onTriggerChange: (trigger: Trigger) => void
}

export function AutomationTriggerSection({
  trigger,
  onTriggerChange,
}: TriggerSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
          Kích hoạt
        </span>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={trigger.type}
            onValueChange={(value) => onTriggerChange({ ...trigger, type: value })}
          >
            <SelectTrigger className="w-full bg-slate-800/40 border-slate-700/50 rounded-sm h-9 text-xs font-medium">
              <SelectValue placeholder="Loại trigger" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-slate-700/50 text-white rounded-sm">
              <SelectItem value="time">Theo giờ</SelectItem>
              <SelectItem value="condition" disabled>Theo điều kiện</SelectItem>
            </SelectContent>
          </Select>
          {trigger.type === "time" && (
            <TriggerTime
              value={trigger.value}
              onChange={(value) => onTriggerChange({ ...trigger, value })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
