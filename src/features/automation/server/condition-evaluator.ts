import {
  Condition,
  ConditionMode,
  ConditionOperator,
  ConditionType,
  LastStateDeviceConditionValue,
  NumericWindowConditionValue,
} from "@/features/automation/types/automation"

export const MAX_CONDITION_HOURS = 24
const SUNLIGHT_THRESHOLD = 0
const WEATHER_API_BASE =
  process.env.WEATHER_API_BASE_URL
const HOUR_MS = 60 * 60 * 1000
const MINUTE_MS = 60 * 1000
const DAY_MS = 24 * HOUR_MS
const VN_OFFSET_MS = 7 * HOUR_MS

export type WeatherSample = {
  timestampMs: number
  temperature: number
  lightIntensity: number
  isRaining: number
}

export type DeviceStateSample = {
  state: string
  last_changed: number // timestamp in ms
}

type ExternalMinuteWeatherData = {
  timestamp: number
  temperature: number
  light_intensity: number
  is_raining: number
}

type ExternalMinuteWeatherResponse = {
  success?: boolean
  data?: ExternalMinuteWeatherData[]
}

type EvaluableCondition = {
  index: number
  type: ConditionType
  value: NumericWindowConditionValue | LastStateDeviceConditionValue
}

export interface ConditionEvaluationItem {
  index: number
  type: ConditionType
  label?: string
  actual: number | string | null
  passed: boolean
  sampleCount: number
  windowStartMs: number
  windowEndMs: number
  // Metadata for different types
  hours?: number
  operator?: ConditionOperator
  threshold?: number
  entity_id?: string
  entity_name?: string
  target_state?: string
  match_type?: string
  minutes?: number
  last_occurrence_at?: number
}

export interface ConditionEvaluationSummary {
  mode: ConditionMode
  matched: boolean
  items: ConditionEvaluationItem[]
  hasEvaluableConditions: boolean
}

function resolveConditionType(type: unknown): ConditionType | null {
  if (type === "average_temperature" || type === "sunshine_hours" || type === "rain_minutes" || type === "last_state_device") return type
  return null
}

function resolveConditionMode(mode: unknown): ConditionMode {
  return mode === "any" ? "any" : "all"
}

function resolveOperator(operator: unknown): ConditionOperator | null {
  if (operator === ">=" || operator === "=" || operator === "<=") return operator
  return null
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function parseConditionValue(
  rawValue: unknown,
  type: ConditionType
): NumericWindowConditionValue | LastStateDeviceConditionValue | null {
  if (!rawValue || typeof rawValue !== "object") return null
  const candidate = rawValue as Record<string, unknown>

  if (type === "last_state_device") {
    const rawMinutes = toFiniteNumber(candidate.minutes)
    if (rawMinutes === null || rawMinutes < 1 || !candidate.entity_id || !candidate.state || !candidate.match) {
      return null
    }
    return {
      entity_id: candidate.entity_id as string,
      match: candidate.match as "is" | "is_not",
      state: candidate.state as string,
      minutes: Math.max(1, Math.round(rawMinutes))
    }
  }

  const rawHours = toFiniteNumber(candidate.hours)
  const rawThreshold = toFiniteNumber(candidate.threshold)
  const operator = resolveOperator(candidate.operator)

  if (rawHours === null || rawHours < 1 || rawThreshold === null || !operator) {
    return null
  }

  return {
    hours: Math.min(MAX_CONDITION_HOURS, Math.max(1, Math.round(rawHours))),
    operator,
    threshold: rawThreshold,
  }
}

function toEvaluableCondition(
  rawCondition: unknown,
  index: number
): EvaluableCondition | null {
  if (!rawCondition || typeof rawCondition !== "object") return null
  const condition = rawCondition as Condition

  const type = resolveConditionType(condition.type)
  if (!type) return null

  const value = parseConditionValue(condition.value, type)
  if (!value) return null

  return { index, type, value }
}

function compareWithOperator(
  actual: number,
  operator: ConditionOperator,
  target: number
) {
  if (operator === ">=") return actual >= target
  if (operator === "<=") return actual <= target
  return Math.abs(actual - target) < 0.01
}

function filterWindowSamples(
  weatherHistory: WeatherSample[],
  hours: number,
  windowEndMs: number
) {
  const windowStartMs = windowEndMs - hours * HOUR_MS
  return weatherHistory.filter(
    (item) => item.timestampMs >= windowStartMs && item.timestampMs < windowEndMs
  )
}

function buildEvaluationItem(
  condition: EvaluableCondition,
  weatherHistory: WeatherSample[] | null,
  deviceHistories: Record<string, DeviceStateSample[]> | null,
  windowEndMs: number
): ConditionEvaluationItem {
  if (condition.type === "last_state_device") {
    const val = condition.value as LastStateDeviceConditionValue
    const windowStartMs = windowEndMs - val.minutes * MINUTE_MS
    const history = deviceHistories?.[val.entity_id] || []
    
    // Logic: Kiểm tra xem trạng thái mục tiêu có xuất hiện trong khoảng thời gian không
    // Lưu ý: Cần tính cả trạng thái của sample ngay trước windowStartMs
    const samplesInWindow = history.filter(s => s.last_changed >= windowStartMs && s.last_changed < windowEndMs)
    
    // Tìm trạng thái tại thời điểm bắt đầu window (trạng thái gần nhất trước hoặc bằng windowStartMs)
    const priorSamples = history.filter(s => s.last_changed < windowStartMs).sort((a,b) => b.last_changed - a.last_changed)
    const initialState = priorSamples[0]?.state || null
    
    const statesOccurred = new Set<string>()
    if (initialState) statesOccurred.add(initialState)
    samplesInWindow.forEach(s => statesOccurred.add(s.state))
    
    const hasTargetState = statesOccurred.has(val.state)
    const passed = val.match === "is" ? hasTargetState : !hasTargetState
    
    // Tìm thời điểm gần nhất có trạng thái này (có thể trong window hoặc trước đó)
    const targetSamples = history.filter(s => s.state === val.state).sort((a,b) => b.last_changed - a.last_changed)
    const lastOccurrenceAt = targetSamples[0]?.last_changed || (initialState === val.state ? priorSamples[0]?.last_changed : undefined)

    return {
      index: condition.index,
      type: condition.type,
      entity_id: val.entity_id,
      target_state: val.state,
      match_type: val.match,
      minutes: val.minutes,
      actual: hasTargetState ? val.state : (initialState || "unknown"),
      passed,
      sampleCount: samplesInWindow.length,
      windowStartMs,
      windowEndMs,
      last_occurrence_at: lastOccurrenceAt
    }
}

  const val = condition.value as NumericWindowConditionValue
  const windowStartMs = windowEndMs - val.hours * HOUR_MS

  if (!weatherHistory || weatherHistory.length === 0) {
    return {
      index: condition.index,
      type: condition.type,
      hours: val.hours,
      operator: val.operator,
      threshold: val.threshold,
      actual: null,
      passed: false,
      sampleCount: 0,
      windowStartMs,
      windowEndMs,
    }
  }

  const weatherWindow = filterWindowSamples(
    weatherHistory,
    val.hours,
    windowEndMs
  )

  if (weatherWindow.length === 0) {
    return {
      index: condition.index,
      type: condition.type,
      hours: val.hours,
      operator: val.operator,
      threshold: val.threshold,
      actual: null,
      passed: false,
      sampleCount: 0,
      windowStartMs,
      windowEndMs,
    }
  }

  if (condition.type === "average_temperature") {
    const actual =
      weatherWindow.reduce((sum, item) => sum + item.temperature, 0) /
      weatherWindow.length
    return {
      index: condition.index,
      type: condition.type,
      hours: val.hours,
      operator: val.operator,
      threshold: val.threshold,
      actual,
      passed: compareWithOperator(
        actual,
        val.operator,
        val.threshold
      ),
      sampleCount: weatherWindow.length,
      windowStartMs,
      windowEndMs,
    }
  }

  if (condition.type === "rain_minutes") {
    const actual = weatherWindow.reduce((sum, item) => sum + (item.isRaining === 1 ? 1 : 0), 0)
    return {
      index: condition.index,
      type: condition.type,
      hours: val.hours,
      operator: val.operator,
      threshold: val.threshold,
      actual,
      passed: compareWithOperator(
        actual,
        val.operator,
        val.threshold
      ),
      sampleCount: weatherWindow.length,
      windowStartMs,
      windowEndMs,
    }
  }

  // Sunshine hours
  const actual =
    weatherWindow.filter((item) => item.lightIntensity > SUNLIGHT_THRESHOLD).length /
    60
  return {
    index: condition.index,
    type: condition.type,
    hours: val.hours,
    operator: val.operator,
    threshold: val.threshold,
    actual,
    passed: compareWithOperator(
      actual,
      val.operator,
      val.threshold
    ),
    sampleCount: weatherWindow.length,
    windowStartMs,
    windowEndMs,
  }
}

export function getMaxRequiredHoursFromConditions(rawConditions: unknown) {
  const conditions = Array.isArray(rawConditions) ? rawConditions : []
  const evaluableConditions = conditions
    .map((condition, index) => toEvaluableCondition(condition, index))
    .filter(
      (condition): condition is EvaluableCondition => condition !== null
    )

  if (evaluableConditions.length === 0) return 0
  
  return evaluableConditions.reduce((max, condition) => {
    if (condition.type === "last_state_device") {
      const val = condition.value as LastStateDeviceConditionValue
      return Math.max(max, val.minutes / 60)
    }
    const val = condition.value as NumericWindowConditionValue
    return Math.max(max, val.hours)
  }, 0)
}

export function getMaxRequiredHoursFromAutomations(automations: unknown[]) {
  let maxHours = 0
  for (const auto of automations) {
    if (!auto || typeof auto !== "object") continue
    const candidate = auto as { conditions?: unknown }
    const maxByCondition = getMaxRequiredHoursFromConditions(candidate.conditions)
    if (maxByCondition > maxHours) maxHours = maxByCondition
  }
  return maxHours
}

export async function fetchMinuteWeatherHistory(
  token: string,
  lookbackHours: number
): Promise<WeatherSample[]> {
  const res = await fetch(
    `${WEATHER_API_BASE}/weather/history?deviceId=esp8266&range=-${lookbackHours}h&aggregate=none`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error(`External weather API error: ${res.status}`)
  }

  const data = (await res.json()) as ExternalMinuteWeatherResponse
  if (!data.success || !Array.isArray(data.data)) {
    return []
  }

  return data.data
    .map((item) => ({
      timestampMs: item.timestamp * 1000,
      temperature: item.temperature,
      lightIntensity: item.light_intensity,
      isRaining: item.is_raining,
    }))
    .sort((a, b) => a.timestampMs - b.timestampMs)
}

function toVnDateTimeParts(ms: number) {
  const shifted = new Date(ms + VN_OFFSET_MS)
  const year = shifted.getUTCFullYear()
  const month = shifted.getUTCMonth() + 1
  const day = shifted.getUTCDate()
  const hour = shifted.getUTCHours()
  const minute = shifted.getUTCMinutes()
  return { year, month, day, hour, minute }
}

function toVnDateString(ms: number) {
  const { year, month, day } = toVnDateTimeParts(ms)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function toVnHourMinuteString(ms: number) {
  const { hour, minute } = toVnDateTimeParts(ms)
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function startOfVnDayUtcMs(ms: number) {
  const { year, month, day } = toVnDateTimeParts(ms)
  return Date.UTC(year, month - 1, day, 0, 0, 0, 0) - VN_OFFSET_MS
}

function buildWindowSegments(windowStartMs: number, windowEndExclusiveMs: number) {
  const segments: Array<{ startMs: number; endMs: number }> = []
  const windowEndInclusiveMs = windowEndExclusiveMs - MINUTE_MS
  if (windowEndInclusiveMs < windowStartMs) return segments

  let cursorMs = windowStartMs
  while (cursorMs <= windowEndInclusiveMs) {
    const dayStartUtcMs = startOfVnDayUtcMs(cursorMs)
    const dayEndUtcMs = dayStartUtcMs + DAY_MS - MINUTE_MS
    const segmentEndMs = Math.min(windowEndInclusiveMs, dayEndUtcMs)
    segments.push({ startMs: cursorMs, endMs: segmentEndMs })
    cursorMs = segmentEndMs + MINUTE_MS
  }
  return segments
}

export async function fetchMinuteWeatherHistoryByWindow(
  token: string,
  windowStartMs: number,
  windowEndExclusiveMs: number
): Promise<WeatherSample[]> {
  const segments = buildWindowSegments(windowStartMs, windowEndExclusiveMs)
  if (segments.length === 0) return []

  const responses = await Promise.all(
    segments.map(async (segment) => {
      const params = new URLSearchParams({
        deviceId: "esp8266",
        aggregate: "none",
        date: toVnDateString(segment.startMs),
        start: toVnHourMinuteString(segment.startMs),
        end: toVnHourMinuteString(segment.endMs),
      })

      const res = await fetch(`${WEATHER_API_BASE}/weather/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error(`External weather API error: ${res.status}`)
      }

      const data = (await res.json()) as ExternalMinuteWeatherResponse
      if (!data.success || !Array.isArray(data.data)) {
        return [] as WeatherSample[]
      }

      return data.data.map((item) => ({
        timestampMs: item.timestamp * 1000,
        temperature: item.temperature,
        lightIntensity: item.light_intensity,
        isRaining: item.is_raining,
      }))
    })
  )

  return responses
    .flat()
    .filter(
      (item) =>
        item.timestampMs >= windowStartMs && item.timestampMs < windowEndExclusiveMs
    )
    .sort((a, b) => a.timestampMs - b.timestampMs)
}

export async function fetchHAHistory(
  haUrl: string,
  haToken: string,
  entityId: string,
  startMs: number,
  endMs: number
): Promise<DeviceStateSample[]> {
  const startTime = new Date(startMs).toISOString()
  const endTime = new Date(endMs).toISOString()
  
  const url = `${haUrl.replace(/\/$/, "")}/api/history/period/${startTime}?filter_entity_id=${entityId}&end_time=${endTime}`
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${haToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Home Assistant history API error: ${res.status}`)
  }

  const data = (await res.json()) as Array<Array<{ state: string; last_changed: string }>>
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
    return []
  }

  return data[0].map((item) => ({
    state: item.state,
    last_changed: new Date(item.last_changed).getTime(),
  }))
}

export function evaluateConditionsWithDetails(
  rawConditions: unknown,
  rawConditionMode: unknown,
  weatherHistory: WeatherSample[] | null,
  deviceHistories: Record<string, DeviceStateSample[]> | null,
  windowEndMs: number
): ConditionEvaluationSummary {
  const conditions = Array.isArray(rawConditions) ? rawConditions : []
  const evaluableConditions = conditions
    .map((condition, index) => toEvaluableCondition(condition, index))
    .filter(
      (condition): condition is EvaluableCondition => condition !== null
    )

  if (evaluableConditions.length === 0) {
    return {
      mode: resolveConditionMode(rawConditionMode),
      matched: true,
      items: [],
      hasEvaluableConditions: false,
    }
  }

  const items = evaluableConditions.map((condition) =>
    buildEvaluationItem(condition, weatherHistory, deviceHistories, windowEndMs)
  )

  const mode = resolveConditionMode(rawConditionMode)
  const matched =
    mode === "any"
      ? items.some((item) => item.passed)
      : items.every((item) => item.passed)

  return {
    mode,
    matched,
    items,
    hasEvaluableConditions: true,
  }
}
