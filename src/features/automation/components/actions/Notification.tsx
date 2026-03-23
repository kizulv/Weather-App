import { useState } from "react"
import { Bell, Check, ChevronDown, Play, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Action, Device } from "@/features/automation/types/automation"

interface NotificationProps {
  action: Action
  devices: Device[]
  onRemove: () => void
  onRun: () => void
  onUpdate: (patch: Partial<Action>) => void
}

export function ActionNotification({
  action,
  devices,
  onRemove,
  onRun,
  onUpdate,
}: NotificationProps) {
  const [open, setOpen] = useState(false)

  // Lọc danh sách dịch vụ thông báo (notify.*)
  const notifyDevices = devices.filter(d => d.entity_id.startsWith("notify."))
  const currentDevice = devices.find(d => d.entity_id === action.entity_id)

  return (
    <div className="flex flex-col gap-2 py-3 px-3.5 rounded-sm bg-slate-800/50 hover:bg-slate-800/60 transition-all duration-300 border border-transparent hover:border-slate-700/50">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2.5 w-full shrink-0">
        <div className="flex-1 flex flex-col gap-2.5 w-full shrink-0">
          {/* Row 1: Device Selector & Desktop Actions */}
          <div className="flex gap-2.5 flex-row w-full shrink-0">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "flex w-full shrink-0 justify-between bg-slate-800/40 border-slate-700/50 rounded-sm h-9 font-medium text-xs hover:bg-slate-700/50 text-left px-2.5 sm:px-3 hover:text-white transition-colors",
                    !action.entity_id && "text-white/50"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Bell className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {action.entity_id === "notify.notify" 
                        ? "Tất cả thiết bị" 
                        : (currentDevice?.name || action.entity_id || "Chọn thiết bị nhận...")}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="sm:w-80 p-0 bg-transparent border-slate-900/10 rounded-sm shadow-2xl backdrop-blur-sm overflow-hidden"
                onWheel={(e) => e.stopPropagation()}
                align="start"
              >
                <Command className="bg-transparent text-white h-auto overflow-visible">
                  <CommandInput placeholder="Tìm dịch vụ thông báo..." className="text-white border-slate-800/30 text-xs" />
                  <CommandList 
                    onWheel={(e) => e.stopPropagation()}
                    className={cn(
                      "max-h-56 mt-3 overflow-y-auto! overflow-x-hidden",
                      "[scrollbar-color:rgba(96,165,250,0.55)_rgba(45,15,15,0)] [scrollbar-width:thin]",
                      "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent",
                      "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-slate-800/60 [&::-webkit-scrollbar-thumb]:bg-blue-400/45 [&::-webkit-scrollbar-thumb:hover]:bg-blue-300/55"
                    )}
                  >
                    <CommandEmpty className="py-4 text-center text-xs text-slate-500">
                      Không tìm thấy.
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="Tất cả thiết bị notify.notify"
                        onSelect={() => {
                          onUpdate({ 
                            entity_id: "notify.notify",
                            service: "notify.notify" 
                          })
                          setOpen(false)
                        }}
                        className="flex flex-col items-start gap-0.5 py-2.5 px-3 aria-selected:bg-white/10 cursor-pointer h-13"
                      >
                        <div className="flex items-center w-full justify-between">
                          <span className="font-medium text-xs text-white">Tất cả thiết bị</span>
                          {action.entity_id === "notify.notify" && (
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">notify.notify</span>
                      </CommandItem>

                      {notifyDevices.map((device) => (
                        <CommandItem
                          key={device.entity_id}
                          value={`${device.name} ${device.entity_id}`}
                          onSelect={() => {
                            onUpdate({ 
                              entity_id: device.entity_id,
                              service: device.entity_id 
                            })
                            setOpen(false)
                          }}
                          className="flex flex-col items-start gap-0.5 py-2.5 px-3 aria-selected:bg-white/10 cursor-pointer h-13"
                        >
                          <div className="flex items-center w-full justify-between">
                            <span className="font-medium text-xs text-white">{device.name}</span>
                            {action.entity_id === device.entity_id && (
                              <Check className="h-3.5 w-3.5 text-blue-400" />
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
          {/* Row 2: Title & Message */}
          <div className="flex flex-col gap-2.5">
            <Input
              value={action.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Tiêu đề thông báo..."
              className="bg-slate-800/40 border-slate-700/50 rounded-sm h-8 text-[11px] focus-visible:ring-blue-500/30 placeholder:text-white/20"
            />
            <Input
              value={action.message || ""}
              onChange={(e) => onUpdate({ message: e.target.value })}
              placeholder="Nội dung tin nhắn..."
              className="bg-slate-800/40 border-slate-700/50 rounded-sm h-8 text-[11px] focus-visible:ring-blue-500/30 placeholder:text-white/20"
            />
          </div>
        </div>
        {/* Mobile Actions & Trash only Desktop */}
        <div className="flex flex-row sm:flex-col items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={onRun}
            title="Chạy thử"
            className="flex h-9 w-1/2 sm:w-9 items-center justify-center rounded-sm text-slate-300 bg-amber-500/10 hover:text-amber-400 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs pl-1 sm:hidden">Chạy thử</span>
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
