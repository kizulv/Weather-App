import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth/jwt"
import {
  MAX_CONDITION_HOURS,
  evaluateConditionsWithDetails,
  fetchHAHistory,
  fetchMinuteWeatherHistoryByWindow,
  getMaxRequiredHoursFromConditions,
} from "@/features/automation/server/condition-evaluator"
import { apiClient } from "@/lib/api-client"
import { Condition, LastStateDeviceConditionValue } from "@/features/automation/types/automation"

const VN_OFFSET_MS = 7 * 60 * 60 * 1000

function parseHourMinute(timeValue: unknown) {
  if (typeof timeValue !== "string") return null
  const matched = /^(\d{2}):(\d{2})$/.exec(timeValue)
  if (!matched) return null
  const hour = Number(matched[1])
  const minute = Number(matched[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

function resolveWindowEndByTrigger(now: Date, trigger: unknown) {
  if (!trigger || typeof trigger !== "object") {
    const fallback = new Date(now)
    fallback.setSeconds(0, 0)
    return fallback.getTime()
  }

  const candidate = trigger as { type?: unknown; value?: unknown }
  if (candidate.type !== "time") {
    const fallback = new Date(now)
    fallback.setSeconds(0, 0)
    return fallback.getTime()
  }

  const parsedTime = parseHourMinute(candidate.value)
  if (!parsedTime) {
    const fallback = new Date(now)
    fallback.setSeconds(0, 0)
    return fallback.getTime()
  }

  const vnNowMs = now.getTime() + VN_OFFSET_MS
  const vnNow = new Date(vnNowMs)
  const triggerMsToday = Date.UTC(
    vnNow.getUTCFullYear(),
    vnNow.getUTCMonth(),
    vnNow.getUTCDate(),
    parsedTime.hour,
    parsedTime.minute,
    0,
    0
  )

  const triggerMs = triggerMsToday > vnNowMs
    ? triggerMsToday - 24 * 60 * 60 * 1000
    : triggerMsToday

  return triggerMs - VN_OFFSET_MS
}

/**
 * POST /api/automation/conditions/test
 * Kiểm thử điều kiện automation và trả về số liệu từng điều kiện (không chạy action).
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const rawConditions = body?.conditions
    const rawConditionMode = body?.condition_mode
    const rawTrigger = body?.trigger

    const maxRequiredHours = getMaxRequiredHoursFromConditions(rawConditions)
    if (maxRequiredHours === 0) {
      return NextResponse.json({
        success: true,
        data: {
          mode: rawConditionMode === "any" ? "any" : "all",
          matched: true,
          items: [],
          hasEvaluableConditions: false,
          tested_at: new Date().toISOString(),
          window_end: null,
        },
      })
    }

    const now = new Date()
    const windowEndMs = resolveWindowEndByTrigger(now, rawTrigger)
    const lookbackHours = Math.min(MAX_CONDITION_HOURS, maxRequiredHours)
    const windowStartMs = windowEndMs - lookbackHours * 60 * 60 * 1000

    // Fetch Weather History
    const weatherHistory = await fetchMinuteWeatherHistoryByWindow(
      token,
      windowStartMs,
      windowEndMs
    )

    // Fetch Device Histories if needed
    const deviceHistories: Record<string, import("@/features/automation/server/condition-evaluator").DeviceStateSample[]> = {}
    const lastStateConditions = (rawConditions as Condition[] || []).filter(c => c.type === "last_state_device")

    if (lastStateConditions.length > 0) {
      const configRes = await apiClient<{ success: boolean; data?: { url: string; token: string } }>("/settings/home-assistant", { method: "GET" }, token)
      const config = configRes.data
      
      if (config?.url && config?.token) {
        await Promise.all(lastStateConditions.map(async (c) => {
          const val = c.value as LastStateDeviceConditionValue
          if (val.entity_id && !deviceHistories[val.entity_id]) {
            // Lấy thêm 1 chút thời gian trước windowStart của condition để có initialState
            const conditionStartMs = windowEndMs - val.minutes * 60 * 1000
            const history = await fetchHAHistory(
              config.url,
              config.token,
              val.entity_id,
              conditionStartMs - 5 * 60 * 1000, // Thêm 5p dự phòng để lấy state trước đó
              windowEndMs
            )
            deviceHistories[val.entity_id] = history
          }
        }))
      }
    }

    const conditionResult = evaluateConditionsWithDetails(
      rawConditions,
      rawConditionMode,
      weatherHistory,
      deviceHistories,
      windowEndMs
    )

    return NextResponse.json({
      success: true,
      data: {
        ...conditionResult,
        tested_at: now.toISOString(),
        window_end: new Date(windowEndMs).toISOString(),
      },
    })
  } catch (error) {
    console.error("Lỗi kiểm thử điều kiện automation:", error)
    return NextResponse.json(
      { success: false, message: "Lỗi kiểm thử điều kiện" },
      { status: 500 }
    )
  }
}
