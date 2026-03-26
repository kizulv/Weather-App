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
import { Condition, ConditionMode, ConditionOperator, ConditionType, Device, LastStateDeviceConditionValue, NumericWindowConditionValue, PersonIsHomeConditionValue } from "@/features/automation/types/automation"

import { ConditionAverageTemperature } from "./ConditionAverageTemperature"
import { ConditionSunshineHours } from "./ConditionSunshineHours"
import { ConditionRain } from "./ConditionRain"
import { ConditionLastStateDevice } from "./LastStateDeviceCondition"
import { ConditionPersonLocation } from "./ConditionPersonLocation"

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
  person_is_home: {
    label: "Người dùng ở nhà",
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
  if (type === "person_is_home") return "person_is_home"
  return "average_temperature"
}

export function resolveOperator(operator: unknown): ConditionOperator {
  if (operator === "=" || operator === "<=" || operator === ">=") return operator
  return ">="
}

export function getDefaultConditionValue(type: ConditionType): NumericWindowConditionValue | LastStateDeviceConditionValue | PersonIsHomeConditionValue {
  const config = CONDITION_CONFIG[type]
  if (type === "last_state_device") {
    return {
      entity_id: "",
      state: "on",
      match: "is_not",
      minutes: 120,
    }
  }
  if (type === "person_is_home") {
    return {
      entity_id: "",
      state: "home",
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
    const d = defaultValue as unknown as LastStateDeviceConditionValue
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

  if (type === "person_is_home") {
    const v = rawValue as Partial<PersonIsHomeConditionValue>
    const d = defaultValue as unknown as PersonIsHomeConditionValue
    return {
      type,
      value: {
        entity_id: v.entity_id || d.entity_id,
        state: v.state || d.state,
      },
    }
  }

  const v = rawValue as Partial<NumericWindowConditionValue>
  const d = defaultValue as unknown as NumericWindowConditionValue
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
  type: ConditionType
  condition: string
  actual: string
  target: string
  passed: boolean
  time_range: string
  sample_count?: number
  last_occurrence?: string
}

export interface ConditionTestResult {
  matched: boolean
  details: ConditionTestItem[]
  hasEvaluableConditions?: boolean
  window_end?: string | null
}

// --- Sub-components ---
export function ConditionTestResultDisplay({ result }: { result: ConditionTestResult, devices?: Device[] }) {
  return (
    <div className="space-y-2 rounded-sm border border-white/10 bg-slate-950/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Kết quả kiểm thử</div>
        <span className={cn("rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", result.matched ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300")}>
          {result.matched ? "Đạt" : "Không đạt"}
        </span>
      </div>
      
        {result.details?.map((item: ConditionTestItem, idx: number) => {
          const cleanTarget = item.target?.replace(/(bật|tắt)\s+\1/gi, "$1")
          return (
          <div key={`${item.type}-${idx}`} className="rounded-sm border border-white/10 bg-slate-900/40 p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white">{item.condition}</p>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", item.passed ? "text-emerald-300" : "text-rose-300")}>{item.passed ? "Đạt" : "Không đạt"}</span>
              </div>
            <p className="mt-1 text-[11px] text-white/60">Thực tế: <span className="text-white">{item.actual}</span> | Mục tiêu: <span className="text-white">{cleanTarget}</span></p>
            <p className="text-[11px] text-white/60">
              Thời gian: {item.time_range} 
              {item.sample_count !== undefined && ` | Số mẫu: ${item.sample_count}`}
                  {item.last_occurrence && (
                <span className="opacity-80">
                  {` | Đã ${cleanTarget?.toLowerCase().includes("tắt") ? "tắt" : "bật"} lúc: ${item.last_occurrence}`}
                    </span>
                  )}
                </p>
              </div>
          )
        })}
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
            if (type === "person_is_home") {
              return (
                <ConditionPersonLocation
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
