"use client";

import { useState, useEffect, useCallback } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getHAConfigAction, testHAConnectionAction } from "@/features/setting/home-assistant.actions";

export function HomeAssistantTab() {
  const [haUrl, setHaUrl] = useState("");
  const [haToken, setHaToken] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  // Hàm lấy cấu hình đã lưu
  const fetchConfig = useCallback(async () => {
    try {
      const result = await getHAConfigAction();
      if (result.success && result.data) {
        setHaUrl(result.data.url || "");
        setHaToken(result.data.token || "");
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình HA:", error);
    }
  }, []);

  // Tải cấu hình khi component mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleTestConnection = async () => {
    if (!haUrl || !haToken) {
      toast.error("Vui lòng nhập đầy đủ URL và Token");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const data = await testHAConnectionAction(haUrl, haToken);

      if (data.success) {
        setTestResult({ 
          success: true, 
          message: data.message || "Kết nối thành công!",
          count: data.deviceCount 
        });
        toast.success(data.message || "Kết nối Home Assistant thành công");
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
    <TabsPrimitive.Content value="home-assistant" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
      <div className="space-y-1">
        <h3 className="text-lg font-bold">Home Assistant</h3>
        <p className="text-xs text-slate-500 font-medium">Kết nối với hệ thống nhà thông minh của bạn.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ha-url" className="text-xs uppercase tracking-wider text-slate-400">URL của Home Assistant</Label>
          <Input 
            id="ha-url" 
            placeholder="https://hass.domain.com" 
            value={haUrl}
            onChange={(e) => setHaUrl(e.target.value)}
            className="bg-slate-800/40 border-slate-700/50 rounded-sm h-10 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600 font-medium text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ha-token" className="text-xs uppercase tracking-wider text-slate-400">Long-Lived Access Token</Label>
          <Input 
            id="ha-token" 
            type="password"
            placeholder="Nhập token tại đây..." 
            value={haToken}
            onChange={(e) => setHaToken(e.target.value)}
            className="bg-slate-800/40 border-slate-700/50 rounded-sm h-10 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600 font-medium text-xs"
          />
        </div>

        <Button 
          onClick={handleTestConnection}
          disabled={isTesting}
          className="w-full h-10 rounded-sm bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 font-bold text-xs shadow-lg transition-all"
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
            "p-4 rounded-sm border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
            testResult.success 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {testResult.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <div className="text-[11px] font-semibold leading-relaxed">
              {testResult.message}
            </div>
          </div>
        )}
      </div>
    </TabsPrimitive.Content>
  );
}
