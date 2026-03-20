"use client"

import {
  Condition,
  ConditionMode,
  ConditionOperator,
  ConditionType,
  NumericWindowConditionValue,
} from "@/features/automation/types/automation"

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
  return type === "sunshine_hours" ? "sunshine_hours" : "average_temperature"
}

export function resolveOperator(operator: unknown): ConditionOperator {
  if (operator === "=" || operator === "<=" || operator === ">=") return operator
  return ">="
}

export function getDefaultConditionValue(type: ConditionType): NumericWindowConditionValue {
  const config = CONDITION_CONFIG[type]
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

  return {
    type,
    value: {
      hours: clampHours(toFiniteNumber(rawValue.hours, defaultValue.hours)),
      operator: resolveOperator(rawValue.operator),
      threshold: toFiniteNumber(rawValue.threshold, defaultValue.threshold),
    },
  }
}

export interface ConditionTestItem {
  index: number
  type: ConditionType
  hours: number
  operator: ConditionOperator
  threshold: number
  actual: number | null
  passed: boolean
  sampleCount: number
  windowStartMs: number
  windowEndMs: number
}

export interface ConditionTestResult {
  mode: ConditionMode
  matched: boolean
  items: ConditionTestItem[]
  hasEvaluableConditions: boolean
  tested_at: string
  window_end: string | null
}
