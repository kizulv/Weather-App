"use client"

import { Bell, PlayCircle, Plus, Zap } from "lucide-react"

import { Action, Device } from "@/features/automation/types/automation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActionDevice } from "./ActionDevice"
import { ActionNotification } from "./Notification"

interface AutomationActionsSectionProps {
  title: string
  actions: Action[]
  devices: Device[]
  onAddAction: (type: "device" | "notification") => void
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Thêm hành động"
              className="w-30 flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200 sm:flex-none sm:pl-2.5 sm:pr-4 cursor-pointer"
            >
              <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
              Thêm
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-60 bg-slate-900/10 border-slate-700/50 text-white rounded-sm p-2 shadow-2xl backdrop-blur-xl"
          >
            <DropdownMenuItem 
              onClick={() => onAddAction("device")}
              className="flex items-center gap-2 px-2.5 py-3 text-xs font-medium rounded-sm focus:bg-slate-800 cursor-pointer transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              Điều khiển thiết bị
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onAddAction("notification")}
              className="flex items-center gap-2 px-2.5 py-3 text-xs font-medium rounded-sm focus:bg-slate-800 cursor-pointer transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              Gửi thông báo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          actions.map((action, idx) => {
            const isNotification = action.service.startsWith("notify.") || action.title !== undefined || action.message !== undefined
            
            if (isNotification) {
              return (
                <ActionNotification
                  key={idx}
                  action={action}
                  devices={devices}
                  onRemove={() => onRemoveAction(idx)}
                  onRun={() => onRunAction(action)}
                  onUpdate={(patch: Partial<Action>) => onUpdateAction(idx, patch)}
                />
              )
            }

            return (
              <ActionDevice
                key={idx}
                action={action}
                devices={devices}
                onRemove={() => onRemoveAction(idx)}
                onRun={() => onRunAction(action)}
                onUpdate={(patch: Partial<Action>) => onUpdateAction(idx, patch)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
