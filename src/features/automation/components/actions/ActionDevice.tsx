"use client"

import { useState } from "react"
import { Check, CheckCircle2, ChevronDown, Loader2, Play, Trash2, XCircle } from "lucide-react"

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
import { executeActionsAction, ExecutionResult } from "@/features/automation/automation.actions"
import { toast } from "sonner"

interface ActionDeviceProps {
  action: Action
  devices: Device[]
  onRemove: () => void
  onUpdate: (patch: Partial<Action>) => void
}

export function ActionDevice({
  action,
  devices,
  onRemove,
  onUpdate,
}: ActionDeviceProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  // Lọc danh sách thiết bị
  const filteredDevices = devices.filter(d => 
    d.entity_id.startsWith("switch.") || 
    d.entity_id.startsWith("light.") || 
    d.entity_id.startsWith("automation.")
  )

  // Trích xuất phần hành động từ service (ví dụ: turn_on từ switch.turn_on)
  const getActionType = (service: string) => {
    if (service.endsWith(".turn_on")) return "turn_on"
    if (service.endsWith(".turn_off")) return "turn_off"
    if (service.endsWith(".toggle")) return "toggle"
    return "turn_on"
  }

  const currentActionType = getActionType(action.service)

  const handleActionChange = (newType: string) => {
    const domain = action.entity_id.split(".")[0] || "switch"
    onUpdate({ service: `${domain}.${newType}` })
  }

  const handleDeviceSelect = (device: Device) => {
    const domain = device.entity_id.split(".")[0]
    onUpdate({ 
      entity_id: device.entity_id,
      service: `${domain}.${currentActionType}` 
    })
    setOpen(false)
  }

  const handleRun = async () => {
    if (!action.entity_id && !action.service.startsWith("notify.")) {
      toast.error("Vui lòng chọn thiết bị thực thi")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    try {
      const result = await executeActionsAction([action])
      const executionData = result.data as ExecutionResult[]

      if (result.success && Array.isArray(executionData) && executionData[0]?.status === "success") {
        setStatus("success")
        toast.success("Thực thi thành công")
      } else {
        setStatus("error")
        toast.error(result.message || "Thực thi thất bại")
      }
    } catch (error) {
      console.error("Lỗi thực thi:", error)
      setStatus("error")
      toast.error("Lỗi kết nối tới API Server")
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div
      className="group/row relative flex flex-col gap-2 py-3 px-3.5 rounded-sm bg-slate-800/50 hover:bg-slate-800/60 transition-all duration-300 border border-transparent hover:border-slate-700/50"
    >
      <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-emerald-500/40 opacity-0 group-hover/row:opacity-100 transition-opacity" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-row w-full">
          <button
            onClick={handleRun}
            disabled={isLoading}
            title="Chạy thử"
            className={cn(
              "h-9 w-9 shrink-0 items-center justify-center rounded-sm transition-all hidden sm:flex cursor-pointer disabled:opacity-50",
              status === "success" ? "bg-emerald-500/20 text-emerald-400" : 
              status === "error" ? "bg-rose-500/20 text-rose-400" :
              "bg-amber-500/10 text-slate-300 hover:text-amber-400"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : status === "error" ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
          </button>
          <Select
            value={currentActionType}
            onValueChange={handleActionChange}
          >
            <SelectTrigger className="flex w-18 sm:w-38.5 overflow-hidden bg-slate-800/40 border-slate-700/50 rounded-sm h-9 text-xs font-medium">
              <SelectValue placeholder="Lệnh" />
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width] bg-[#1e293b] border-slate-700/50 text-white rounded-sm text-xs">
              <SelectItem value="turn_on" className="text-xs">Bật</SelectItem>
              <SelectItem value="turn_off" className="text-xs">Tắt</SelectItem>
              <SelectItem value="toggle" className="text-xs">Đảo chiều</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "flex-1 shrink-0 justify-between bg-slate-800/40 border-slate-700/50 rounded-sm h-9 font-medium text-xs hover:bg-slate-700/50 text-left px-2.5 sm:px-3 hover:text-white",
                  !action.entity_id && "text-white"
                )}
              >
                <span className="truncate">
                  {action.entity_id
                    ? (filteredDevices.find(d => d.entity_id === action.entity_id)?.name || action.entity_id)
                    : "Chọn thiết bị..."}
                </span>
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="sm:w-80 p-0 bg-transparent border-slate-900/10 rounded-sm shadow-2xl backdrop-blur-sm overflow-hidden"
              onWheel={(e) => e.stopPropagation()}
            >
              <Command className="bg-transparent text-white h-auto overflow-visible">
                <CommandInput placeholder="Tìm thiết bị..." className="text-white border-slate-800/30 text-xs" />
                <CommandList 
                  onWheel={(e) => e.stopPropagation()}
                  className={cn(
                    "max-h-56 mt-3 overflow-y-auto! overflow-x-hidden",
                    "[scrollbar-color:rgba(96,165,250,0.55)_rgba(45,15,15,0)] [scrollbar-width:thin]",
                    "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent",
                    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-slate-800/60 [&::-webkit-scrollbar-thumb]:bg-blue-400/45 [&::-webkit-scrollbar-thumb:hover]:bg-blue-300/55"
                  )}
                >
                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                  <CommandGroup>
                    {filteredDevices.map((device) => (
                      <CommandItem
                        key={device.entity_id}
                        value={`${device.name} ${device.entity_id}`}
                        onSelect={() => handleDeviceSelect(device)}
                        className="flex flex-col items-start gap-0.5 py-2.5 px-3 aria-selected:bg-white/10 cursor-pointer h-13"
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
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRun}
            disabled={isLoading}
            title="Chạy thử"
            className={cn(
              "flex h-9 w-1/2 sm:w-9 items-center justify-center rounded-sm transition-all sm:hidden cursor-pointer disabled:opacity-50",
              status === "success" ? "bg-emerald-500/20 text-emerald-400" : 
              status === "error" ? "bg-rose-500/20 text-rose-400" :
              "bg-amber-500/10 text-slate-300 hover:text-amber-400"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : status === "error" ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span className="text-xs pl-1 sm:hidden">
              {isLoading ? "Đang chạy..." : status === "success" ? "Thành công" : status === "error" ? "Lỗi" : "Chạy thử"}
            </span>
          </button>
          <button
            onClick={onRemove}
            title="Xóa hành động"
            className="flex h-9 w-1/2 sm:w-9 items-center justify-center rounded-sm text-rose-400 transition-all bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs pl-1 sm:hidden">Xóa hành động</span>
          </button>
        </div>
      </div>
    </div>
  )
}
