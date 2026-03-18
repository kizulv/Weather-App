"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Plus, Trash2, Clock, PlayCircle, Play, Check, ChevronDown } from "lucide-react";
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
      <DialogContent className="sm:max-w-150 bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white rounded-3xl p-0 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
        <DialogHeader className="p-8 pb-4 border-b border-white/5">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-400" />
            {automation ? "Sửa Tự động hóa" : "Thêm Tự động hóa mới"}
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            Thiết lập kịch bản tự động điều khiển thiết bị của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8 overflow-y-auto max-h-110">
          {/* Tên */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-white/30">Thông tin cơ bản</Label>
            <Input 
              placeholder="VD: Bật nóng lạnh 8h sáng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-blue-500/20 font-bold"
            />
          </div>

          {/* Trigger */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Trigger (Kích hoạt)
            </Label>
            <div className="flex gap-4">
              <Select 
                value={trigger.type} 
                onValueChange={(v) => setTrigger({...trigger, type: v})}
              >
                <SelectTrigger className="w-45 bg-white/5 border-white/10 rounded-2xl h-12 font-bold">
                  <SelectValue placeholder="Chọn loại trigger" />
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
                  className="bg-white/5 border-white/10 rounded-2xl h-12 font-bold w-full"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                <PlayCircle className="h-3 w-3" /> Hành động thực thi
              </Label>
              <Button 
                variant="ghost" 
                size="icon-xs" 
                onClick={addAction}
                className="rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group/row">
                  <Select 
                    value={action.service}
                    onValueChange={(v) => {
                      const newActions = [...actions];
                      newActions[idx].service = v;
                      setActions(newActions);
                    }}
                  >
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 rounded-xl h-10 font-bold">
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
                          "flex-1 justify-between bg-white/5 border-white/10 rounded-xl h-10 font-bold hover:bg-white/10 text-left px-3",
                          !action.entity_id && "text-white/30"
                        )}
                      >
                        <span className="truncate">
                          {action.entity_id 
                            ? (devices.find(d => d.entity_id === action.entity_id)?.name || action.entity_id) 
                            : "Tìm chọn thiết bị..."}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-75 p-0 bg-[#1e293b] border-white/10 rounded-xl overflow-hidden shadow-2xl">
                      <Command className="bg-transparent text-white">
                        <CommandInput placeholder="Tìm tên hoặc ID thiết bị..." className="text-white border-white/5" />
                        <CommandList className="max-h-64 no-scrollbar">
                          <CommandEmpty>Không tìm thấy thiết bị nào.</CommandEmpty>
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
                                className="flex flex-col items-start gap-1 py-3 px-4 aria-selected:bg-white/10 cursor-pointer"
                              >
                                <div className="flex items-center w-full justify-between">
                                  <span className="font-bold text-sm text-white">{device.name}</span>
                                  {action.entity_id === device.entity_id && (
                                    <Check className="h-4 w-4 text-blue-400" />
                                  )}
                                </div>
                                <span className="text-[10px] text-white/40 font-mono tracking-tight">{device.entity_id}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon-xs" 
                      onClick={() => runAction(action)}
                      title="Chạy thử hành động"
                      className="text-blue-400 opacity-0 group-hover/row:opacity-100 hover:bg-blue-500/10 transition-all"
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-xs" 
                      onClick={() => removeAction(idx)}
                      className="text-white/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-white/5 bg-white/5">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs text-white/40"
          >
            Hủy
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={runAllActions}
              className="rounded-2xl h-12 px-6 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-black uppercase tracking-widest text-xs"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              Chạy thử
            </Button>
            <Button 
              onClick={handleSave}
              className="rounded-2xl h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
            >
              Lưu cài đặt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
