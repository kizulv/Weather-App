"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Home, Globe, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [haUrl, setHaUrl] = useState("");
  const [haToken, setHaToken] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  // Hàm lấy cấu hình đã lưu
  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/home-assistant/config");
      const result = await response.json();
      if (result.success && result.data) {
        setHaUrl(result.data.url || "");
        setHaToken(result.data.token || "");
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình HA:", error);
    }
  }, []);

  // Tự động tải cấu hình khi mở Dialog
  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open, fetchConfig]);

  const handleTestConnection = async () => {
    if (!haUrl || !haToken) {
      toast.error("Vui lòng nhập đầy đủ URL và Token");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/home-assistant/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: haUrl, haToken: haToken }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({ 
          success: true, 
          message: `Kết nối thành công! Đã đồng bộ ${data.deviceCount} thiết bị.`,
          count: data.deviceCount 
        });
        toast.success("Kết nối Home Assistant thành công");
      } else {
        setTestResult({ success: false, message: data.message || "Kết nối thất bại" });
        toast.error(data.message || "Kết nối thất bại");
      }
    } catch {
      setTestResult({ success: false, message: "Lỗi hệ thống khi kết nối" });
      toast.error("Lỗi hệ thống khi kết nối");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white rounded-3xl p-0 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
        <DialogTitle className="sr-only">Cài đặt ứng dụng</DialogTitle>
        <DialogDescription className="sr-only">Quản lý kết nối Home Assistant và các thiết lập cơ bản của ứng dụng.</DialogDescription>
        <div className="flex h-125">
          {/* Sidebar Tabs */}
          <TabsPrimitive.Root defaultValue="home-assistant" className="flex w-full">
            <div className="w-45 bg-white/5 border-r border-white/5 p-4 flex flex-col gap-2">
              <div className="px-2 py-4 mb-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Cài đặt</h2>
              </div>
              <TabsPrimitive.List className="flex flex-col gap-1">
                <TabsPrimitive.Trigger 
                  value="general" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all hover:text-white/70"
                >
                  <Globe className="h-4 w-4" />
                  Chung
                </TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger 
                  value="home-assistant" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/40 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 transition-all hover:text-white/70"
                >
                  <Home className="h-4 w-4" />
                  Home Assistant
                </TabsPrimitive.Trigger>
                <TabsPrimitive.Trigger 
                  value="security" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all hover:text-white/70"
                >
                  <Shield className="h-4 w-4" />
                  Bảo mật
                </TabsPrimitive.Trigger>
              </TabsPrimitive.List>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto min-w-0">
              <TabsPrimitive.Content value="home-assistant" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">Home Assistant</h3>
                  <p className="text-sm text-white/40 font-medium">Kết nối với hệ thống nhà thông minh của bạn.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ha-url" className="text-xs font-bold uppercase tracking-wider text-white/60">URL của Home Assistant</Label>
                    <Input 
                      id="ha-url" 
                      placeholder="https://hass.domain.com" 
                      value={haUrl}
                      onChange={(e) => setHaUrl(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-white/20 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ha-token" className="text-xs font-bold uppercase tracking-wider text-white/60">Long-Lived Access Token</Label>
                    <Input 
                      id="ha-token" 
                      type="password"
                      placeholder="Nhập token tại đây..." 
                      value={haToken}
                      onChange={(e) => setHaToken(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-white/20 font-medium"
                    />
                  </div>

                  <Button 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang kiểm tra...
                      </>
                    ) : "Kiểm tra kết nối"}
                  </Button>

                  {testResult && (
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                      testResult.success 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {testResult.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                      <div className="text-sm font-semibold leading-relaxed">
                        {testResult.message}
                      </div>
                    </div>
                  )}
                </div>
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="general" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">Cài đặt chung</h3>
                  <p className="text-sm text-white/40 font-medium">Quản lý các thiết lập cơ bản của ứng dụng.</p>
                </div>
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                  <Globe className="h-8 w-8 text-white/10 mb-4" />
                  <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Đang phát triển</p>
                </div>
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="security" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">Bảo mật</h3>
                  <p className="text-sm text-white/40 font-medium">Bảo vệ tài khoản và dữ liệu của bạn.</p>
                </div>
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                  <Shield className="h-8 w-8 text-white/10 mb-4" />
                  <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Đang phát triển</p>
                </div>
              </TabsPrimitive.Content>
            </div>
          </TabsPrimitive.Root>
        </div>
      </DialogContent>
    </Dialog>
  );
}
