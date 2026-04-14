"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getAutomationLogsAction } from "../../automation.actions"
import { AutomationLog, Device, Action } from "../../types/automation"
import { ConditionTestItem, ConditionTestResultDisplay } from "../conditions/AutomationConditionsSection"
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from "lucide-react"
import { serviceLabels } from "./service-labels"

interface AutomationLogListProps {
  automationId: string
  devices: Device[]
  limit?: number
  refreshTrigger?: number
}

export function AutomationLogList({
  automationId,
  devices,
  limit = 5,
  refreshTrigger,
}: AutomationLogListProps) {
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!automationId) return
    setLoading(true)
    try {
      const result = await getAutomationLogsAction(automationId, limit)
      if (result.success) {
        setLogs(result.data as AutomationLog[])
      } else {
        setError(result.message || "Không thể tải lịch sử")
      }
    } catch {
      setError("Lỗi kết nối máy chủ")
    } finally {
      setLoading(false)
    }
  }, [automationId, limit])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs, refreshTrigger])

  const visibleLogs = logs.slice(0, limit)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  };


  if (loading && logs.length === 0) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 bg-white/5 animate-pulse rounded-full" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 w-full bg-white/5 animate-pulse rounded-sm" />
        ))}
      </div>
    )
  }

  if (error && logs.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-8 pb-4">
      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
        <Clock className="h-4 w-4 text-white/50" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          Lịch sử thực thi
        </h3>
      </div>

      {visibleLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-sm border border-dashed border-white/10 bg-white/2">
          <AlertCircle className="h-5 w-5 text-white/20 mb-2" />
          <p className="text-xs text-white/30 italic">Chưa có dữ liệu thực thi cho kịch bản này</p>
          <p className="text-[10px] text-white/20 mt-1">Lịch sử sẽ xuất hiện sau khi kịch bản được kích hoạt hoặc chạy thử</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2">
        {visibleLogs.map((log) => (
          <AccordionItem
            key={log._id}
            value={log._id}
            className="border border-white/10 bg-slate-900/50 rounded-sm overflow-hidden px-1"
          >
            <AccordionTrigger className="hover:no-underline px-3 py-3 group">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  {log.matched ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-slate-500" />
                  )}
                  <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                    {formatDate(log.executed_at)}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4 pt-1 space-y-2">
              {/* Kết quả điều kiện */}
              {!!log.details && (
                <ConditionTestResultDisplay
                  result={{
                    matched: log.matched,
                    details: log.details as ConditionTestItem[]
                  }}
                />
              )}

              {/* Hành động đã thực thi */}
              {log.actions_results && log.actions_results.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Hành động</div>
                  </div>
                  <div className="space-y-2">
                    {log.actions_results.map((action: Action, idx: number) => (
                      <div 
                        key={idx}
                        className="rounded-sm border border-white/10 bg-blue-500/5 p-3 transition-all hover:bg-blue-500/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20 text-white/60 shrink-0">
                            <PlayCircle className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate mb-0! text-white">
                              {serviceLabels[action.service]?.label || action.service}
                            </p>
                             <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-0.5">
                               {action.entity_id === "notify.notify" 
                                 ? "Tất cả thiết bị" 
                                 : (devices.find(d => d.entity_id === action.entity_id)?.name || action.entity_id)}
                             </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {log.error && (
                <div className="p-2 rounded-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  Lỗi: {log.error}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      )}
    </div>
  )
}
