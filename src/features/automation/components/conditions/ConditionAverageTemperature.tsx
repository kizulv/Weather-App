"use client"

import { Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Condition, NumericWindowConditionValue } from "@/features/automation/types/automation"

import {
  CONDITION_CONFIG,
  MAX_CONDITION_HOURS,
  NUMBER_INPUT_BASE_CLASS,
  OPERATOR_OPTIONS,
  resolveConditionType,
  resolveOperator,
  toFiniteNumber,
  clampHours,
  getDefaultConditionValue
} from "./AutomationConditionsSection"

interface ConditionProps {
  condition: Condition
  onRemove: () => void
  onUpdate: (nextCondition: Condition) => void
}

export function ConditionAverageTemperature({
  condition,
  onRemove,
  onUpdate,
}: ConditionProps) {
  const type = resolveConditionType(condition.type)
  const value = condition.value as NumericWindowConditionValue
  const config = CONDITION_CONFIG.average_temperature

  const handleUpdate = (patch: Partial<NumericWindowConditionValue>) => {
    onUpdate({ ...condition, value: { ...value, ...patch } })
  }

  return (
    <div className="rounded-sm bg-slate-800/40 p-3.5">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5">
        <div className="flex items-center justify-between gap-2.5 flex-row w-full">
          <Select
            value={type}
            onValueChange={(nextTypeValue) => {
              const nextType = resolveConditionType(nextTypeValue)
              onUpdate({
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
              {Object.entries(CONDITION_CONFIG).map(([conditionType, item]) => (
                <SelectItem key={conditionType} value={conditionType}>
                  {item.label}
                </SelectItem>
              ))}
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
                handleUpdate({ hours: nextHours })
              }}
              className={`h-9 w-16 rounded-sm border-slate-700/50 bg-slate-800/40 text-center pr-8 text-xs ${NUMBER_INPUT_BASE_CLASS}`}
              placeholder="Số giờ"
            />
            <span className="pointer-events-none absolute right-3 bottom-0.5 -translate-y-1/2 text-white/40">
              giờ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-row w-full sm:w-auto shrink-0">
          <Select
            value={value.operator}
            onValueChange={(operator) =>
              handleUpdate({ operator: resolveOperator(operator) })
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
                handleUpdate({
                  threshold: toFiniteNumber(e.target.value, value.threshold),
                })
              }
              className={`h-9 w-16 rounded-sm border-slate-700/50 bg-slate-800/40 text-center pr-8 text-xs ${NUMBER_INPUT_BASE_CLASS}`}
              placeholder={config.thresholdLabel}
            />
            <span className="pointer-events-none absolute right-3 bottom-0.5 -translate-y-1/2 text-white/40">
              {config.thresholdSuffix}
            </span>
          </div>
        </div>

        <button
          onClick={onRemove}
          title="Xóa điều kiện"
          className="flex shrink-0 items-center justify-center h-9 w-full sm:w-9 rounded-sm text-rose-400 transition-all bg-rose-500/10 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="text-xs pl-1 sm:hidden">Xóa điều kiện</span>
        </button>
      </div>
    </div>
  )
}
