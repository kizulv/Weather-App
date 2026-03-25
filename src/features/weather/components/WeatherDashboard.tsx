"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  getAutomationsAction, 
  createAutomationAction, 
  updateAutomationAction, 
  deleteAutomationAction, 
  getAutomationLogsAction
} from "@/features/automation/automation.actions";
import { getHADevicesAction } from "@/features/setting/home-assistant.actions";
import { getWeatherDataAction } from "@/features/weather/weather.actions";

const WeatherChart = dynamic(
  () => import("./WeatherChart").then((mod) => mod.WeatherChart),
  { ssr: false, loading: () => <div className="h-87.5 w-full rounded-2xl border border-white/10 bg-black/20 animate-pulse" /> }
);

import { RealtimeWeather, HourlyWeather, DailyWeather } from "@/features/weather/server/weather-data";

// New Components
import { CurrentWeatherCard } from "./CurrentWeatherCard";
import { DailyForecast } from "./DailyForecast";
import { HourlyForecast } from "./HourlyForecast";
import { AutomationCard } from "@/features/automation/components/AutomationCard";
import { AutomationDialog } from "@/features/automation/components/AutomationDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Automation, Device } from "@/features/automation/types/automation";

interface WeatherDashboardProps {
  initialData: {
    realtime: RealtimeWeather | null;
    past24h: HourlyWeather[];
    daily: DailyWeather[];
  } | null;
  initialAutomations?: Automation[];
  initialDevices?: Device[];
}

export function WeatherDashboard({ initialData, initialAutomations, initialDevices }: WeatherDashboardProps) {
  const [data, setData] = useState<RealtimeWeather | null>(initialData?.realtime ?? null);
  const [past24h, setPast24h] = useState<HourlyWeather[]>(initialData?.past24h ?? []);
  const [daily, setDaily] = useState<DailyWeather[]>(initialData?.daily ?? []);

  // Automation states — sử dụng initial data từ server nếu có
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations ?? []);
  const [automationLogs, setAutomationLogs] = useState<Record<string, { lastRan?: string; loading: boolean; error?: string }>>({});
  const [devices, setDevices] = useState<Device[]>(initialDevices ?? []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const fetchAutomationLogs = useCallback(async (automationIds: string[]) => {
    // Khởi tạo trạng thái loading cho các kịch bản mới
    setAutomationLogs(prev => {
      const next = { ...prev };
      automationIds.forEach(id => {
        if (!next[id]) next[id] = { loading: true };
        else next[id] = { ...next[id], loading: true, error: undefined };
      });
      return next;
    });

    try {
      const results = await Promise.all(
        automationIds.map(async (id) => {
          const res = await getAutomationLogsAction(id, 1);
          return { id, res };
        })
      );

      setAutomationLogs(prev => {
        const next = { ...prev };
        results.forEach(({ id, res }) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const logs = res.data as Array<{ created_at?: string }>;
            next[id] = { lastRan: logs[0]?.created_at, loading: false };
          } else {
            next[id] = { ...next[id], loading: false, error: res.success ? undefined : (res.message || "Lỗi") };
          }
        });
        return next;
      });
    } catch (error) {
      console.error("Lỗi fetch logs:", error);
    }
  }, []);

  const fetchAutomations = useCallback(async () => {
    const result = await getAutomationsAction();
    if (result.success) {
      const fetchedAutomations = result.data || [];
      setAutomations(fetchedAutomations);
      if (fetchedAutomations.length > 0) {
        fetchAutomationLogs(fetchedAutomations.map(a => a._id));
      }
    }
  }, [fetchAutomationLogs]);

  const fetchDevices = useCallback(async () => {
    const result = await getHADevicesAction();
    if (result.success) setDevices(result.data || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      // Chỉ fetch nếu chưa có initial data từ server
      if (!initialAutomations?.length) {
        await fetchAutomations();
      } else {
        // Nếu có initial data, vẫn fetch logs
        fetchAutomationLogs(initialAutomations.map(a => a._id));
      }
      if (!initialDevices?.length) await fetchDevices();
    };
    init();
  }, [fetchAutomations, fetchAutomationLogs, fetchDevices, initialAutomations, initialDevices]);

  const handleSaveAutomation = async (data: Partial<Automation>) => {
    try {
      const isEdit = !!selectedAutomation;
      const result = isEdit 
        ? await updateAutomationAction(selectedAutomation?._id as string, data)
        : await createAutomationAction(data);

      if (result.success) {
        toast.success(isEdit ? "Cập nhật thành công" : "Tạo mới thành công");
        setIsDialogOpen(false);
        fetchAutomations();
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleToggleAutomation = async (id: string, enabled: boolean) => {
    // Tìm automation hiện tại từ danh sách để lấy đầy đủ dữ liệu
    const currentAutomation = automations.find(a => a._id === id);
    if (!currentAutomation) return;

    // Optimistic UI update: Cập nhật ngay lập tức trong UI
    const previousAutomations = [...automations];
    setAutomations(prev => prev.map(a => a._id === id ? { ...a, enabled } : a));

    try {
      const result = await updateAutomationAction(id, { ...currentAutomation, enabled });
      
      if (!result.success) {
        // Hoàn tác nếu server báo lỗi
        setAutomations(previousAutomations);
        toast.error(result.message || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      // Hoàn tác nếu lỗi kết nối
      setAutomations(previousAutomations);
      console.error("Lỗi toggle automation:", err);
      toast.error("Lỗi kết nối khi thay đổi trạng thái");
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tự động hóa này?")) return;
    try {
      const result = await deleteAutomationAction(id);
      if (result.success) {
        toast.success("Đã xóa");
        fetchAutomations();
      }
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };


  // Hàm refresh dữ liệu từ API (chỉ dùng cho auto-refresh sau lần đầu)
  const refreshWeatherData = useCallback(async () => {
    try {
      const result = await getWeatherDataAction();
      
      if (result.success && result.data) {
        setData(result.data.realtime);
        setPast24h(result.data.past24h);
        setDaily(result.data.daily);
      } else if (result.message === "Unauthorized") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thời tiết:", error);
    }
  }, []);

  // Auto-refresh mỗi 60 giây (không còn check automation tại đây)
  useEffect(() => {
    const dataTimer = setInterval(() => {
      refreshWeatherData();
      fetchDevices();
    }, 60000);

    return () => clearInterval(dataTimer);
  }, [refreshWeatherData, fetchDevices]);

  // Nếu không có initial data (fallback), fetch lần đầu từ client
  useEffect(() => {
    if (!initialData) {
      const initWeather = async () => {
        await refreshWeatherData();
      };
      initWeather();
    }
  }, [initialData, refreshWeatherData]);

  if (!data) {
    return (
      <div className="flex-1 min-h-svh flex items-center justify-center bg-[#020617]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/40 text-sm font-medium animate-pulse">Đang kết nối và lấy dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-svh text-slate-200 selection:bg-blue-500/30">
      <div className="relative z-10 flex flex-col min-h-svh">
        {/* Navigation Sidebar Trigger */}
        <div className="p-4 flex items-center justify-between">
          <SidebarTrigger className="text-white/60 hover:text-white" />
        </div>

        <main className="flex-1 p-4 md:p-8 md:pt-0 space-y-8 max-w-8xl mx-auto w-full pt-0 min-w-0">
          {/* Combined Real-time Weather Card */}
          {data && <CurrentWeatherCard data={data} />}

          {/* Chart Section - Flex Layout for dynamic width */}
          <section className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              <WeatherChart data={past24h} />
              <div className="flex-1">
                <HourlyForecast data={past24h} />
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-95 lg:min-w-95 shrink-0">
              <DailyForecast data={daily} />
            </div>
          </section>

          {/* Automation Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">Tự động hóa</h2>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setSelectedAutomation(null);
                  setDialogKey(k => k + 1);
                  setIsDialogOpen(true);
                }}
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all flex gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm mới
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {automations.map((automation) => (
                <AutomationCard
                  key={automation._id}
                  id={automation._id}
                  name={automation.name}
                  enabled={automation.enabled}
                  trigger={automation.trigger}
                  actions={automation.actions}
                  actions_when_matched={automation.actions_when_matched}
                  actions_when_unmatched={automation.actions_when_unmatched}
                  devices={devices}
                  onToggle={handleToggleAutomation}
                  onDelete={handleDeleteAutomation}
                  logData={automationLogs[automation._id]}
                  onClick={() => {
                    setSelectedAutomation(automation);
                    setDialogKey(k => k + 1);
                    setIsDialogOpen(true);
                  }}
                />
              ))}
              
              <div 
                onClick={() => {
                  setSelectedAutomation(null);
                  setDialogKey(k => k + 1);
                  setIsDialogOpen(true);
                }}
                className="min-h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/10 hover:text-white/30 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="p-4 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Thêm kịch bản mới</span>
              </div>
            </div>
          </section>

          <AutomationDialog
            key={dialogKey}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            automation={selectedAutomation}
            onSave={handleSaveAutomation}
          />
        </main>

        
        <footer className="h-15 flex items-center justify-center text-center text-white/20 text-[10px] sm:text-xs border-t border-white/5">
          © 2026 Weather Intelligence Dashboard • Thiết kế cao cấp bởi Phạm Công Thành
        </footer>
      </div>
    </div>
  );
}
