"use client"

import { useState } from "react"
import { Check, ChevronDown, Trash2 } from "lucide-react"

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
import { Condition, Device, PersonIsHomeConditionValue } from "@/features/automation/types/automation"

interface ConditionPersonLocationProps {
  condition: Condition
  devices: Device[]
  onRemove: () => void
  onUpdate: (nextCondition: Condition) => void
}

export function ConditionPersonLocation({
  condition,
  devices,
  onRemove,
  onUpdate,
}: ConditionPersonLocationProps) {
  const [open, setOpen] = useState(false)
  const value = condition.value as PersonIsHomeConditionValue

  // Lọc các thực thể person.* và device_tracker.*
  const selectableDevices = devices.filter(
    d => d.entity_id.startsWith("person.") || d.entity_id.startsWith("device_tracker.")
  )

  const handleUpdate = (patch: Partial<PersonIsHomeConditionValue>) => {
    onUpdate({ ...condition, value: { ...value, ...patch } })
  }

  const handlePersonSelect = (device: Device) => {
    handleUpdate({ entity_id: device.entity_id })
    setOpen(false)
  }

  return (
    <div
      className="group/row relative flex flex-col gap-2 py-3 px-3.5 rounded-sm bg-slate-800/40 hover:bg-slate-800/50 transition-all duration-300 border border-transparent hover:border-slate-700/50"
    >
      <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-blue-500/40 opacity-0 group-hover/row:opacity-100 transition-opacity" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-col sm:flex-row w-full sm:flex-1">
          {/* Chọn người dùng */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "sm:flex-1 w-full sm:w-auto justify-between bg-slate-800/40 border-slate-700/50 rounded-sm h-9 font-medium text-xs hover:bg-slate-700/50 text-left px-3 hover:text-white truncate min-w-0",
                  !value.entity_id && "text-white/40"
                )}
              >
                <span className="truncate">
                  {value.entity_id
                    ? (selectableDevices.find(d => d.entity_id === value.entity_id)?.name || value.entity_id)
                    : "Chọn người dùng hoặc thiết bị..."}
                </span>
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="sm:w-80 p-0 bg-transparent border-slate-900/10 rounded-sm shadow-2xl backdrop-blur-sm overflow-hidden"
              onWheel={(e) => e.stopPropagation()}
            >
              <Command className="bg-[#1e293b] text-white">
                <CommandInput placeholder="Tìm người dùng hoặc thiết bị..." className="text-white border-slate-800/30 text-xs" />
                <CommandList className="max-h-56 overflow-y-auto">
                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                  <CommandGroup>
                    {selectableDevices.map((device) => (
                      <CommandItem
                        key={device.entity_id}
                        value={`${device.name} ${device.entity_id}`}
                        onSelect={() => handlePersonSelect(device)}
                        className="flex flex-col items-start gap-0.5 py-2 px-3 aria-selected:bg-white/10 cursor-pointer"
                      >
                        <div className="flex items-center w-full justify-between">
                          <span className="font-medium text-xs text-white">{device.name}</span>
                          {value.entity_id === device.entity_id && (
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

          {/* So khớp trạng thái */}
          <Select
            value={value.state}
            onValueChange={(val) => handleUpdate({ state: val as "home" | "not_home" })}
          >
            <SelectTrigger className="w-full sm:w-80.75 bg-slate-800/40 border-slate-700/50 rounded-sm h-9 text-xs font-medium">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-slate-700/50 text-white rounded-sm text-xs">
              <SelectItem value="home" className="text-xs font-medium">Đang ở nhà</SelectItem>
              <SelectItem value="not_home" className="text-xs font-medium">Không ở nhà</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={onRemove}
          title="Xóa điều kiện"
          className="flex shrink-0 items-center justify-center h-9 w-full sm:w-9 rounded-sm text-rose-400 transition-all bg-rose-500/10 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="text-xs pl-1 sm:hidden">Xóa điều kiện</span>
        </button>
      </div>
    </div>
  )
}
