"use client"

import { Check, ChevronDown, Play, PlayCircle, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Action, Device } from "@/features/automation/types/automation"

interface AutomationActionsSectionProps {
  title: string
  actions: Action[]
  devices: Device[]
  onAddAction: () => void
  onRemoveAction: (index: number) => void
  onRunAction: (action: Action) => void
  onUpdateAction: (index: number, patch: Partial<Action>) => void
}

const serviceLabels: Record<string, { label: string; color: string }> = {
  "switch.turn_on": { label: "Bật", color: "text-emerald-400" },
  "switch.turn_off": { label: "Tắt", color: "text-red-400" },
  "light.turn_on": { label: "Bật đèn", color: "text-amber-400" },
  "light.turn_off": { label: "Tắt đèn", color: "text-red-400" },
  "light.toggle": { label: "Đảo", color: "text-purple-400" },
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
            <div
              key={idx}
              className="group/row relative flex flex-col gap-2 py-3 sm:p-3.5 sm:rounded-sm sm:bg-slate-800/50 hover:bg-slate-800/60 sm:transition-all duration-300 sm:border sm:border-transparent hover:border-slate-700/50"
            >
              <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-emerald-500/40 opacity-0 group-hover/row:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between gap-2.5">
                <Select
                  value={action.service}
                  onValueChange={(service) => onUpdateAction(idx, { service })}
                >
                  <SelectTrigger className="w-30 sm:w-32 bg-slate-800/40 border-slate-700/50 rounded-sm h-9 text-xs font-medium">
                    <SelectValue placeholder="Lệnh">
                      <span className={serviceLabels[action.service]?.color}>
                        {serviceLabels[action.service]?.label || action.service}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-slate-700/50 text-white rounded-sm">
                    <SelectItem value="switch.turn_on">Bật (On)</SelectItem>
                    <SelectItem value="switch.turn_off">Tắt (Off)</SelectItem>
                    <SelectItem value="light.turn_on">Bật đèn</SelectItem>
                    <SelectItem value="light.turn_off">Tắt đèn</SelectItem>
                    <SelectItem value="light.toggle">Đảo trạng thái</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "flex-1 justify-between bg-slate-800/40 border-slate-700/50 rounded-sm h-9 font-medium text-xs hover:bg-slate-700/50 text-left px-2.5 sm:px-3",
                        !action.entity_id && "text-slate-500"
                      )}
                    >
                      <span className="truncate">
                        {action.entity_id
                          ? (devices.find(d => d.entity_id === action.entity_id)?.name || action.entity_id)
                          : "Chọn thiết bị..."}
                      </span>
                      <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0 bg-[#1e293b] border-slate-700/50 rounded-sm overflow-hidden shadow-2xl">
                    <Command className="bg-transparent text-white">
                      <CommandInput placeholder="Tìm thiết bị..." className="text-white border-slate-800/30 text-xs" />
                      <CommandList className="max-h-56 no-scrollbar">
                        <CommandEmpty>Không tìm thấy.</CommandEmpty>
                        <CommandGroup>
                          {devices.map((device) => (
                            <CommandItem
                              key={device.entity_id}
                              value={`${device.name} ${device.entity_id}`}
                              onSelect={() =>
                                onUpdateAction(idx, { entity_id: device.entity_id })
                              }
                              className="flex flex-col items-start gap-0.5 py-2.5 px-3 aria-selected:bg-white/10 cursor-pointer"
                            >
                              <div className="flex items-center w-full justify-between">
                                <span className="font-medium text-xs text-white">{device.name}</span>
                                {action.entity_id === device.entity_id && (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                )}
                              </div>
                              <span className="text-[10px] text-white/40 font-mono">{device.entity_id}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex shrink-0 items-center gap-2.5">
                  <button
                    onClick={() => onRunAction(action)}
                    title="Chạy thử"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-slate-300 bg-amber-500/10 hover:text-amber-400 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onRemoveAction(idx)}
                    title="Xóa hành động"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-rose-400 transition-all bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
