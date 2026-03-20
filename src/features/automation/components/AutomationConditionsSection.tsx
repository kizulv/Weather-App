"use client"

import { Loader2, Plus, SlidersHorizontal, TestTube2, Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Condition, ConditionMode, NumericWindowConditionValue } from "@/features/automation/types/automation"

import {
  clampHours,
  ConditionTestItem,
  ConditionTestResult,
  CONDITION_CONFIG,
  CONDITION_MODE_OPTIONS,
  getDefaultConditionValue,
  MAX_CONDITION_HOURS,
  normalizeCondition,
  NUMBER_INPUT_BASE_CLASS,
  OPERATOR_OPTIONS,
  resolveConditionType,
  resolveOperator,
  toFiniteNumber,
} from "./automation-dialog-condition"

interface AutomationConditionsSectionProps {
  conditions: Condition[]
  conditionMode: ConditionMode
  isTestingConditions: boolean
  conditionTestResult: ConditionTestResult | null
  onConditionModeChange: (mode: ConditionMode) => void
  onRunConditionTest: () => void
  onAddCondition: () => void
  onRemoveCondition: (index: number) => void
  onUpdateCondition: (index: number, nextCondition: Condition) => void
}

function formatConditionActual(item: ConditionTestItem) {
  if (item.actual === null) return "Không có dữ liệu"
  if (item.type === "average_temperature") {
    return `${item.actual.toFixed(2)}°C`
  }
  return `${item.actual.toFixed(2)} giờ`
}

function formatConditionThreshold(item: ConditionTestItem) {
  const suffix = CONDITION_CONFIG[item.type]?.thresholdSuffix || ""
  return `${item.operator} ${item.threshold}${suffix}`
}

function formatWindowLabel(item: ConditionTestItem) {
  const windowStart = new Date(item.windowStartMs)
  const windowEnd = new Date(Math.max(item.windowStartMs, item.windowEndMs - 60000))
  return `${windowStart.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${windowEnd.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

export function AutomationConditionsSection({
  conditions,
  conditionMode,
  isTestingConditions,
  conditionTestResult,
  onConditionModeChange,
  onRunConditionTest,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
}: AutomationConditionsSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            Điều kiện
          </span>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            onClick={onRunConditionTest}
            disabled={isTestingConditions || conditions.length === 0}
            title="Kiểm thử điều kiện"
            className="w-30 flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-300 transition-all hover:bg-blue-500/20 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {isTestingConditions ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <TestTube2 className="h-3 w-3" />
            )}
            Kiểm thử
          </button>
          <button
            onClick={onAddCondition}
            title="Thêm điều kiện"
            className="w-30 flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200 sm:flex-none sm:pl-2.5 sm:pr-4"
          >
            <Plus className="h-3 w-3" />
            Thêm
          </button>
        </div>
      </div>

      {conditions.length > 0 && (
        <Select
          value={conditionMode}
          onValueChange={(value) =>
            onConditionModeChange(value === "any" ? "any" : "all")
          }
        >
          <SelectTrigger className="h-9 w-full rounded-sm border-slate-700/50 bg-slate-800/40 text-xs font-medium">
            <SelectValue placeholder="Chọn cách đánh giá" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-slate-700/50 bg-[#1e293b] text-white">
            {CONDITION_MODE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="space-y-2">
        {conditions.length === 0 ? (
          <div className="rounded-sm border border-dashed border-slate-700/50 bg-slate-800/10 px-3 py-4">
            <p className="text-xs text-white/35">
              Chưa có điều kiện. Khi để trống, kịch bản sẽ chạy theo giờ đã chọn.
            </p>
          </div>
        ) : (
          conditions.map((condition, idx) => {
            const normalized = normalizeCondition(condition)
            const type = resolveConditionType(normalized.type)
            const value = normalized.value as NumericWindowConditionValue
            const config = CONDITION_CONFIG[type]
            return (
              <div
                key={idx}
                className="rounded-sm bg-slate-800/40 p-3.5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5">
                  <div className="flex items-center justify-between gap-2.5 flex-row w-full">
                    <Select
                      value={type}
                      onValueChange={(nextTypeValue) => {
                        const nextType = resolveConditionType(nextTypeValue)
                        onUpdateCondition(idx, {
                          type: nextType,
                          value: {
                            ...getDefaultConditionValue(nextType),
                            operator: value.operator,
                            hours: value.hours,
                          },
                        })
                      }}
                    >
                      <SelectTrigger className="h-9 flex-1 rounded-sm border-slate-700/50 bg-slate-800/40 text-xs font-medium">
                        <SelectValue placeholder="Loại điều kiện" />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm border-slate-700/50 bg-[#1e293b] text-white">
                        {Object.entries(CONDITION_CONFIG).map(
                          ([conditionType, item]) => (
                            <SelectItem key={conditionType} value={conditionType}>
                              {item.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <div className="relative w-16 sm:w-16">
                      <Input
                        type="number"
                        min={1}
                        max={MAX_CONDITION_HOURS}
                        value={value.hours}
                        onChange={(e) => {
                          const nextHours = clampHours(
                            toFiniteNumber(e.target.value, value.hours)
                          )
                          onUpdateCondition(idx, {
                            ...normalized,
                            value: {
                              ...value,
                              hours: nextHours,
                            },
                          })
                        }}
                        className={`h-9 w-16 rounded-sm border-slate-700/50 bg-slate-800/40 text-center pr-8 text-xs ${NUMBER_INPUT_BASE_CLASS}`}
                        placeholder="Số giờ"
                      />
                      <span className="pointer-events-none absolute right-3 bottom-px -translate-y-1/2 text-white/40">
                        giờ
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-row w-full">
                    <Select
                      value={value.operator}
                      onValueChange={(operator) =>
                        onUpdateCondition(idx, {
                          ...normalized,
                          value: {
                            ...value,
                            operator: resolveOperator(operator),
                          },
                        })
                      }
                    >
                      <SelectTrigger className="h-9 flex-1 min-w-36 sm:w-44 sm:flex-none rounded-sm border-slate-700/50 bg-slate-800/40 text-xs font-medium">
                        <SelectValue placeholder="So sánh" />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm border-slate-700/50 bg-[#1e293b] text-white">
                        {OPERATOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative w-16 sm:w-16">
                      <Input
                        type="number"
                        step={config.thresholdStep}
                        min={0}
                        value={value.threshold}
                        onChange={(e) =>
                          onUpdateCondition(idx, {
                            ...normalized,
                            value: {
                              ...value,
                              threshold: toFiniteNumber(
                                e.target.value,
                                value.threshold
                              ),
                            },
                          })
                        }
                        className={`h-9 w-16 rounded-sm border-slate-700/50 bg-slate-800/40 text-center pr-8 text-xs ${NUMBER_INPUT_BASE_CLASS}`}
                        placeholder={config.thresholdLabel}
                      />
                      <span className="pointer-events-none absolute right-3 bottom-px -translate-y-1/2 text-white/40">
                        {config.thresholdSuffix}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveCondition(idx)}
                      title="Xóa điều kiện"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-rose-400 transition-all bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {conditionTestResult && (
        <div className="space-y-2 rounded-sm border border-white/10 bg-slate-950/30 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Kết quả kiểm thử
            </div>
            <span
              className={cn(
                "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                conditionTestResult.matched
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              )}
            >
              {conditionTestResult.matched ? "Đạt" : "Không đạt"}
            </span>
          </div>

          {conditionTestResult.window_end && (
            <p className="text-[11px] text-white/40">
              Mốc đánh giá:{" "}
              {new Date(conditionTestResult.window_end).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}

          {!conditionTestResult.hasEvaluableConditions && (
            <p className="text-[11px] text-white/40">
              Không có điều kiện hợp lệ để kiểm thử.
            </p>
          )}

          {conditionTestResult.items.map((item) => (
            <div
              key={`${item.type}-${item.index}`}
              className="rounded-sm border border-white/10 bg-slate-900/40 p-2.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white">
                  {CONDITION_CONFIG[item.type]?.label || item.type}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    item.passed ? "text-emerald-300" : "text-rose-300"
                  )}
                >
                  {item.passed ? "Đạt" : "Không đạt"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-white/60">
                Thực tế: {formatConditionActual(item)} | Mục tiêu:{" "}
                {formatConditionThreshold(item)}
              </p>
              <p className="text-[11px] text-white/40">
                Cửa sổ: {formatWindowLabel(item)} | Số mẫu: {item.sampleCount}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
