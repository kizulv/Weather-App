"use client"

import { PlayCircle, Plus } from "lucide-react"

import { Action, Device } from "@/features/automation/types/automation"
import { ActionDevice } from "./ActionDevice"

interface AutomationActionsSectionProps {
  title: string
  actions: Action[]
  devices: Device[]
  onAddAction: () => void
  onRemoveAction: (index: number) => void
  onRunAction: (action: Action) => void
  onUpdateAction: (index: number, patch: Partial<Action>) => void
}

export function AutomationActionsSection({
  title,
  actions,
  devices,
  onAddAction,
  onRemoveAction,
  onRunAction,
  onUpdateAction,
}: AutomationActionsSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            {title}
          </span>
        </div>
        <button
          onClick={onAddAction}
          title="Thêm hành động"
          className="w-30 flex items-center justify-center gap-1.5 pr-2 py-2 rounded-sm bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-200 transition-all text-[10px] uppercase tracking-wider font-bold"
        >
          <Plus className="h-3 w-3" />
          Thêm
        </button>
      </div>

      <div className="space-y-2">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-slate-800/10 border border-dashed border-slate-700/50">
            <div className="p-3 rounded-xl bg-white/5 mb-3">
              <PlayCircle className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-xs text-white/30 font-medium">Chưa có hành động nào</p>
            <p className="text-[11px] text-white/15 mt-1">Nhấn &quot;Thêm&quot; để bắt đầu</p>
          </div>
        ) : (
          actions.map((action, idx) => (
            <ActionDevice
              key={idx}
              action={action}
              devices={devices}
              onRemove={() => onRemoveAction(idx)}
              onRun={() => onRunAction(action)}
              onUpdate={(patch) => onUpdateAction(idx, patch)}
            />
          ))
        )}
      </div>
    </div>
  )
}
