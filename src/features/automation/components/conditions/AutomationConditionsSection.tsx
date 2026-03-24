"use client"

import { Loader2, Plus, SlidersHorizontal, TestTube2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Condition, ConditionMode, ConditionOperator, ConditionType, Device, LastStateDeviceConditionValue, NumericWindowConditionValue } from "@/features/automation/types/automation"

import { ConditionAverageTemperature } from "./ConditionAverageTemperature"
import { ConditionSunshineHours } from "./ConditionSunshineHours"
import { ConditionRain } from "./ConditionRain"
import { ConditionLastStateDevice } from "./LastStateDeviceCondition"

// --- Constants ---
export const MAX_CONDITION_HOURS = 24
export const NUMBER_INPUT_BASE_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

export const CONDITION_CONFIG: Record<
  ConditionType,
  {
    label: string
    defaultHours: number
    defaultThreshold: number
    thresholdLabel: string
    thresholdStep: string
    thresholdSuffix: string
  }
> = {
  average_temperature: {
    label: "Nhiệt độ trung bình trong",
    defaultHours: 2,
    defaultThreshold: 30,
    thresholdLabel: "Nhiệt độ",
    thresholdStep: "0.1",
    thresholdSuffix: "°C",
  },
  sunshine_hours: {
    label: "Số giờ nắng trong",
    defaultHours: 6,
    defaultThreshold: 3,
    thresholdLabel: "Số giờ nắng",
    thresholdStep: "1",
    thresholdSuffix: "giờ",
  },
  rain_minutes: {
    label: "Số phút mưa trong",
    defaultHours: 2,
    defaultThreshold: 20,
    thresholdLabel: "Số phút",
    thresholdStep: "1",
    thresholdSuffix: "phút",
  },
  last_state_device: {
    label: "Trạng thái thiết bị",
    defaultHours: 0,
    defaultThreshold: 0,
    thresholdLabel: "",
    thresholdStep: "1",
    thresholdSuffix: "",
  },
}

export const CONDITION_MODE_OPTIONS: Array<{ value: ConditionMode; label: string }> = [
  { value: "all", label: "Thỏa mãn tất cả điều kiện" },
  { value: "any", label: "Thỏa mãn 1 điều kiện" },
]

export const OPERATOR_OPTIONS: Array<{
  value: ConditionOperator
  label: string
}> = [
  { value: ">=", label: "Lớn hơn hoặc bằng (≥)" },
  { value: "=", label: "Bằng (=)" },
  { value: "<=", label: "Nhỏ hơn hoặc bằng (≤)" },
]

// --- Utils ---
export function clampHours(hours: number) {
  return Math.min(MAX_CONDITION_HOURS, Math.max(1, Math.round(hours)))
}

export function toFiniteNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function resolveConditionType(type: unknown): ConditionType {
  if (type === "sunshine_hours") return "sunshine_hours"
  if (type === "rain_minutes") return "rain_minutes"
  if (type === "last_state_device") return "last_state_device"
  return "average_temperature"
}

export function resolveOperator(operator: unknown): ConditionOperator {
  if (operator === "=" || operator === "<=" || operator === ">=") return operator
  return ">="
}

export function getDefaultConditionValue(type: ConditionType): NumericWindowConditionValue | LastStateDeviceConditionValue {
  const config = CONDITION_CONFIG[type]
  if (type === "last_state_device") {
    return {
      entity_id: "",
      state: "on",
      match: "is_not",
      minutes: 120,
    }
  }
  return {
    hours: config.defaultHours,
    operator: ">=",
    threshold: config.defaultThreshold,
  }
}

export function normalizeCondition(condition?: Condition): Condition {
  const type = resolveConditionType(condition?.type)
  const rawValue =
    condition?.value && typeof condition.value === "object"
      ? (condition.value as Partial<NumericWindowConditionValue>)
      : {}

  const defaultValue = getDefaultConditionValue(type)

  if (type === "last_state_device") {
    const v = rawValue as Partial<LastStateDeviceConditionValue>
    const d = defaultValue as LastStateDeviceConditionValue
    return {
      type,
      value: {
        entity_id: v.entity_id || d.entity_id,
        state: v.state || d.state,
        match: v.match || d.match,
        minutes: toFiniteNumber(v.minutes, d.minutes),
      },
    }
  }

  const v = rawValue as Partial<NumericWindowConditionValue>
  const d = defaultValue as NumericWindowConditionValue
  return {
    type,
    value: {
      hours: clampHours(toFiniteNumber(v.hours, d.hours)),
      operator: resolveOperator(v.operator),
      threshold: toFiniteNumber(v.threshold, d.threshold),
    },
  }
}

export interface ConditionTestItem {
  index: number
  type: ConditionType
  hours: number
  operator: ConditionOperator
  threshold: number
  actual: number | string | null
  passed: boolean
  sampleCount: number
  windowStartMs: number
  windowEndMs: number
  // Fields for last_state_device
  entity_id?: string
  target_state?: string
  match_type?: string
  minutes?: number
  last_occurrence_at?: number
}

export interface ConditionTestResult {
  mode: ConditionMode
  matched: boolean
  items: ConditionTestItem[]
  hasEvaluableConditions: boolean
  tested_at: string
  window_end: string | null
}

// --- Sub-components ---
function ConditionTestResultDisplay({ result, devices }: { result: ConditionTestResult, devices: Device[] }) {
  const formatConditionActual = (item: ConditionTestItem) => {
    if (item.actual === null) return "Không có dữ liệu"
    if (item.type === "last_state_device") return item.passed ? "Đúng" : "Sai"
    if (typeof item.actual === "number") {
      if (item.type === "average_temperature") return `${item.actual.toFixed(2)}°C`
      if (item.type === "rain_minutes") return `${item.actual.toFixed(0)} phút`
      return `${item.actual.toFixed(2)} giờ`
    }
    return String(item.actual)
  }

  const formatConditionThreshold = (item: ConditionTestItem) => {
    if (item.type === "last_state_device") {
      const deviceName = devices.find(d => d.entity_id === item.entity_id)?.name || item.entity_id
      const matchLabel = item.match_type === "is" ? "phải" : "không được"
      const stateLabel = item.target_state === "on" ? "Bật" : "Tắt"
      return `${deviceName} ${matchLabel} ${stateLabel}`
    }
    const suffix = CONDITION_CONFIG[item.type]?.thresholdSuffix || ""
    return `${item.operator} ${item.threshold}${suffix}`
  }

  const formatWindowLabel = (item: ConditionTestItem) => {
    const windowStart = new Date(item.windowStartMs)
    const windowEnd = new Date(Math.max(item.windowStartMs, item.windowEndMs - 60000))
    return `${windowStart.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${windowEnd.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
  }

  return (
    <div className="space-y-2 rounded-sm border border-white/10 bg-slate-950/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Kết quả kiểm thử</div>
        <span className={cn("rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", result.matched ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300")}>
          {result.matched ? "Đạt" : "Không đạt"}
        </span>
      </div>
      {result.window_end && (
        <p className="text-[11px] text-white/40">Mốc đánh giá: {new Date(result.window_end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
      )}
      {!result.hasEvaluableConditions && <p className="text-[11px] text-white/40">Không có điều kiện hợp lệ để kiểm thử.</p>}
      {result.items.map((item) => (
        <div key={`${item.type}-${item.index}`} className="rounded-sm border border-white/10 bg-slate-900/40 p-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white">{CONDITION_CONFIG[item.type]?.label || item.type}</p>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", item.passed ? "text-emerald-300" : "text-rose-300")}>{item.passed ? "Đạt" : "Không đạt"}</span>
          </div>
          <p className="mt-1 text-[11px] text-white/60">Thực tế: {formatConditionActual(item)} | Mục tiêu: {formatConditionThreshold(item)}</p>
          <p className="text-[11px] text-white/60">Thời gian: từ {formatWindowLabel(item)} {item.type === "last_state_device" ? "" : `| Số mẫu: ${item.sampleCount}`} 
          {item.type === "last_state_device" && item.last_occurrence_at && (
            <>
              | {item.target_state === "on" ? "Bật" : "Tắt"} gần nhất lúc {new Date(item.last_occurrence_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </>
          )}
          </p>
        </div>
      ))}
    </div>
  )
}

// --- Main component ---
interface AutomationConditionsSectionProps {
  conditions: Condition[]
  devices: Device[]
  conditionMode: ConditionMode
  isTestingConditions: boolean
  conditionTestResult: ConditionTestResult | null
  onConditionModeChange: (mode: ConditionMode) => void
  onRunConditionTest: () => void
  onAddCondition: () => void
  onRemoveCondition: (index: number) => void
  onUpdateCondition: (index: number, nextCondition: Condition) => void
}

export function AutomationConditionsSection({
  conditions,
  devices,
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
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Điều kiện</span>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            onClick={onRunConditionTest}
            disabled={isTestingConditions || conditions.length === 0}
            title="Kiểm thử điều kiện"
            className="w-30 flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-300 transition-all hover:bg-blue-500/20 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {isTestingConditions ? <Loader2 className="h-3 w-3 animate-spin" /> : <TestTube2 className="h-3 w-3" />}
            Kiểm thử
          </button>
          <button
            onClick={onAddCondition}
            title="Thêm điều kiện"
            className="w-30 flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200 sm:flex-none sm:pl-2.5 sm:pr-4 cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Thêm
          </button>
        </div>
      </div>

      {conditions.length > 0 && (
        <Select value={conditionMode} onValueChange={(value) => onConditionModeChange(value === "any" ? "any" : "all")}>
          <SelectTrigger className="h-9 w-full rounded-sm border-slate-700/50 bg-slate-800/40 text-xs font-medium">
            <SelectValue placeholder="Chọn cách đánh giá" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-slate-700/50 bg-[#1e293b] text-xs text-white">
            {CONDITION_MODE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="space-y-2">
        {conditions.length === 0 ? (
          <div className="rounded-sm border border-dashed border-slate-700/50 bg-slate-800/10 px-3 py-4">
            <p className="text-xs text-white/35">Chưa có điều kiện. Khi để trống, kịch bản sẽ chạy theo giờ đã chọn.</p>
          </div>
        ) : (
          conditions.map((condition, idx) => {
            const type = resolveConditionType(condition.type)
            if (type === "average_temperature") {
              return (
                <ConditionAverageTemperature
                  key={idx}
                  condition={condition}
                  onRemove={() => onRemoveCondition(idx)}
                  onUpdate={(next: Condition) => onUpdateCondition(idx, next)}
                />
              )
            }
            if (type === "sunshine_hours") {
              return (
                <ConditionSunshineHours
                  key={idx}
                  condition={condition}
                  onRemove={() => onRemoveCondition(idx)}
                  onUpdate={(next: Condition) => onUpdateCondition(idx, next)}
                />
              )
            }
            if (type === "rain_minutes") {
              return (
                <ConditionRain
                  key={idx}
                  condition={condition}
                  onRemove={() => onRemoveCondition(idx)}
                  onUpdate={(next: Condition) => onUpdateCondition(idx, next)}
                />
              )
            }
            if (type === "last_state_device") {
              return (
                <ConditionLastStateDevice
                  key={idx}
                  condition={condition}
                  devices={devices}
                  onRemove={() => onRemoveCondition(idx)}
                  onUpdate={(next: Condition) => onUpdateCondition(idx, next)}
                />
              )
            }
            return null
          })
        )}
      </div>

      {conditionTestResult && <ConditionTestResultDisplay result={conditionTestResult} devices={devices} />}
    </div>
  )
}
