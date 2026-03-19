"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, Trash2, Clock, PlayCircle, Play, Check, ChevronDown, Zap, Pencil } from "lucide-react";
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
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

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

  const serviceLabels: Record<string, { label: string; color: string }> = {
    "switch.turn_on": { label: "Bật", color: "text-emerald-400" },
    "switch.turn_off": { label: "Tắt", color: "text-red-400" },
    "light.turn_on": { label: "Bật đèn", color: "text-amber-400" },
    "light.turn_off": { label: "Tắt đèn", color: "text-red-400" },
    "light.toggle": { label: "Đảo", color: "text-purple-400" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-135 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 text-white rounded-2xl p-0 overflow-hidden shadow-2xl focus:outline-none text-xs">
        
        {/* ── Header ── */}
        <DialogHeader className="relative px-6 py-4 border-b border-slate-800/30">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-500",
               "bg-slate-800/40 text-slate-300 shadow-lg border border-slate-700/50"
            )}>
              <Zap className="h-4 w-4 fill-current" />
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingName(false);
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  placeholder="Tên kịch bản..."
                  className="w-full bg-transparent text-white outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b border-emerald-500/50 pb-1 placeholder:text-white/20"
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group/name flex items-center gap-2 w-full text-left outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <DialogTitle className="text-sm font-bold text-white truncate">
                    {name || "Kịch bản mới"}
                  </DialogTitle>
                   <Pencil className="h-3 w-3 text-slate-500 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </div>
          </div>
          
          <DialogDescription className="sr-only">
            Thiết lập kịch bản tự động điều khiển thiết bị
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[65vh]">
          
          {/* ─ Trigger Section ─ */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
               <Clock className="h-3.5 w-3.5 text-slate-400" />
               <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Kích hoạt</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Select 
                  value={trigger.type} 
                  onValueChange={(v) => setTrigger({...trigger, type: v})}
                >
                  <SelectTrigger className="w-36 bg-slate-800/40 border-slate-700/50 rounded-sm h-9 text-xs font-medium">
                    <SelectValue placeholder="Loại trigger" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-slate-700/50 text-white rounded-sm">
                    <SelectItem value="time">Theo giờ</SelectItem>
                    <SelectItem value="condition" disabled>Theo điều kiện</SelectItem>
                  </SelectContent>
                </Select>
                {trigger.type === "time" && (
                  <Input 
                    type="time"
                    value={trigger.value}
                    onChange={(e) => setTrigger({...trigger, value: e.target.value})}
                     className="bg-slate-800/40 border-slate-700/50 rounded-sm h-9 font-semibold text-xs flex-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ─ Actions Section ─ */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <PlayCircle className="h-3.5 w-3.5 text-slate-400" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  Hành động
                </span>
              </div>
              <button 
                onClick={addAction}
                title="Thêm hành động"
                className="flex items-center gap-1.5 pl-2.5 pr-4 py-1.5 rounded-sm bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-200 transition-all text-[10px] uppercase tracking-wider font-bold"
              >
                <Plus className="h-3 w-3" />
                Thêm
              </button>
            </div>
            
            <div className="space-y-2">
              {actions.length === 0 ? (
                /* Empty State */
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
                    key={idx} className="group/row relative flex flex-col gap-2.5 p-3.5 rounded-sm bg-slate-800/50 hover:bg-slate-800/60 transition-all duration-300 border border-transparent hover:border-slate-700/50"
                  >
                    {/* Step indicator */}
                    <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-emerald-500/40 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                    
                    <div className="flex gap-2 items-center">
                      {/* Service Select */}
                      <Select 
                        value={action.service}
                        onValueChange={(v) => {
                          const newActions = [...actions];
                          newActions[idx].service = v;
                          setActions(newActions);
                        }}
                      >
                         <SelectTrigger className="w-32 bg-slate-800/40 border-slate-700/50 rounded-sm h-9 text-xs font-medium">
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

                      {/* Device Selector */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                             className={cn(
                               "flex-1 justify-between bg-slate-800/40 border-slate-700/50 rounded-sm h-9 font-medium text-xs hover:bg-slate-700/50 text-left px-3",
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
                                    onSelect={() => {
                                      const newActions = [...actions];
                                      newActions[idx].entity_id = device.entity_id;
                                      setActions(newActions);
                                    }}
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

                      {/* Row Actions */}
                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={() => runAction(action)}
                          title="Chạy thử"
                          className="p-1.5 rounded-sm text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 transition-all"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button 
                          onClick={() => removeAction(idx)}
                          title="Xóa hành động"
                          className="p-1.5 rounded-sm text-rose-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-sm h-9 px-4 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Hủy
          </Button>
          <div className="flex gap-2">
            {actions.length > 0 && (
              <Button 
                variant="outline"
                onClick={runAllActions}
                className="text-xs rounded-sm h-9 px-4 bg-amber-500/5 border border-amber-500/20  hover:bg-amber-500/15 hover:text-amber-400 font-medium transition-all"
              >
                <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                Chạy thử
              </Button>
            )}
            <Button 
              onClick={handleSave}
              className="rounded-sm h-9 px-5 bg-emerald-600/20  border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-all"
            >
              Lưu kịch bản
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
