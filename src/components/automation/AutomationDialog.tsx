"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Clock, PlayCircle, Play, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { Automation, Trigger, Action, Device } from "@/types/automation";

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: Automation | null;
  onSave: (data: Partial<Automation>) => void;
}

export function AutomationDialog({
  open,
  onOpenChange,
  automation,
  onSave,
}: AutomationDialogProps) {
  const [name, setName] = useState(automation?.name || "");
  const [trigger, setTrigger] = useState<Trigger>(automation?.trigger || { type: "time", value: "08:00" });
  const [conditions] = useState(automation?.conditions || []);
  const [actions, setActions] = useState<Action[]>(automation?.actions || [{ service: "switch.turn_on", entity_id: "" }]);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/home-assistant/devices");
        const json = await res.json();
        if (json.success) setDevices(json.data);
      } catch (err) {
        console.error("Lỗi fetch devices:", err);
      }
    };
    if (open) fetchDevices();
  }, [open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên tự động hóa");
      return;
    }
    if (actions.some(a => !a.entity_id)) {
      toast.error("Vui lòng chọn thiết bị cho tất cả hành động");
      return;
    }
    onSave({ name, trigger, conditions, actions });
  };

  const addAction = () => {
    setActions([...actions, { service: "switch.turn_on", entity_id: "" }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const runAction = async (action: Action) => {
    if (!action.entity_id) {
      toast.error("Vui lòng chọn thiết bị trước khi chạy thử");
      return;
    }
    try {
      const res = await fetch("/api/home-assistant/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          service: action.service, 
          entity_id: action.entity_id 
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Đã gửi lệnh tới ${action.entity_id}`);
      } else {
        toast.error(json.message || "Lỗi khi thực thi lệnh");
      }
    } catch (err) {
      toast.error("Lỗi kết nối tới Home Assistant");
      console.error(err);
    }
  };

  const runAllActions = async () => {
    if (actions.length === 0) return;
    toast.info("Đang chạy thử toàn bộ kịch bản...");
    for (const action of actions) {
      await runAction(action);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-135 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-0 overflow-hidden shadow-2xl">
        {/* Header — Tên automation nằm ở đây */}
        <DialogHeader className="p-5 pb-4 border-b border-white/5">
          {automation ? (
            <DialogTitle className="text-lg font-semibold text-white/90 truncate">
              {automation.name}
            </DialogTitle>
          ) : (
            <DialogTitle className="text-lg font-semibold text-white/90">
              Tự động hóa mới
            </DialogTitle>
          )}
          <DialogDescription className="sr-only">
            Thiết lập kịch bản tự động điều khiển thiết bị
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="p-5 pt-3 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Tên automation */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-white/50">Tên kịch bản</span>
            <Input 
              placeholder="VD: Bật nóng lạnh 8h sáng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 rounded-xl h-10 focus:ring-blue-500/20 font-medium text-sm"
            />
          </div>

          {/* Trigger */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Kích hoạt
            </span>
            <div className="flex gap-3">
              <Select 
                value={trigger.type} 
                onValueChange={(v) => setTrigger({...trigger, type: v})}
              >
                <SelectTrigger className="w-36 bg-white/5 border-white/10 rounded-xl h-10 text-sm font-medium">
                  <SelectValue placeholder="Loại trigger" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-white/10 text-white rounded-xl">
                  <SelectItem value="time">Theo giờ</SelectItem>
                  <SelectItem value="condition" disabled>Theo điều kiện</SelectItem>
                </SelectContent>
              </Select>
              {trigger.type === "time" && (
                <Input 
                  type="time"
                  value={trigger.value}
                  onChange={(e) => setTrigger({...trigger, value: e.target.value})}
                  className="bg-white/5 border-white/10 rounded-xl h-10 font-medium text-sm flex-1"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/50 flex items-center gap-2">
                <PlayCircle className="h-3.5 w-3.5" /> Hành động
              </span>
              <button 
                onClick={addAction}
                title="Thêm hành động"
                className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {actions.map((action, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-2 items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group/row"
                >
                  <Select 
                    value={action.service}
                    onValueChange={(v) => {
                      const newActions = [...actions];
                      newActions[idx].service = v;
                      setActions(newActions);
                    }}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/10 rounded-lg h-9 text-sm font-medium">
                      <SelectValue placeholder="Lệnh" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-white/10 text-white rounded-xl">
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
                          "flex-1 justify-between bg-white/5 border-white/10 rounded-lg h-9 font-medium text-sm hover:bg-white/10 text-left px-3",
                          !action.entity_id && "text-white/30"
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
                    <PopoverContent className="w-72 p-0 bg-[#1e293b] border-white/10 rounded-xl overflow-hidden shadow-2xl">
                      <Command className="bg-transparent text-white">
                        <CommandInput placeholder="Tìm thiết bị..." className="text-white border-white/5 text-sm" />
                        <CommandList className="max-h-56 no-scrollbar">
                          <CommandEmpty>Không tìm thấy.</CommandEmpty>
                          <CommandGroup>
                            {devices.map((device) => (
                              <CommandItem
                                key={device.entity_id}
                                value={`${device.name} ${device.entity_id}`}
                                onSelect={() => {
                                  const newActions = [...actions];
                                  newActions[idx].entity_id = device.entity_id;
                                  setActions(newActions);
                                }}
                                className="flex flex-col items-start gap-0.5 py-2.5 px-3 aria-selected:bg-white/10 cursor-pointer"
                              >
                                <div className="flex items-center w-full justify-between">
                                  <span className="font-medium text-sm text-white">{device.name}</span>
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

                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => runAction(action)}
                      title="Chạy thử"
                      className="p-1.5 rounded-lg text-blue-400 opacity-0 group-hover/row:opacity-100 hover:bg-blue-500/10 transition-all"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button 
                      onClick={() => removeAction(idx)}
                      title="Xóa hành động"
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 pt-3 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-9 px-4 text-sm font-medium text-white/40 hover:text-white/70"
          >
            Hủy
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={runAllActions}
              className="rounded-xl h-9 px-4 border-white/10 text-white/60 hover:bg-white/5 hover:text-white text-sm font-medium"
            >
              <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
              Chạy thử
            </Button>
            <Button 
              onClick={handleSave}
              className="rounded-xl h-9 px-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
