import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import {
  MAX_CONDITION_HOURS,
  evaluateConditionsWithDetails,
  fetchMinuteWeatherHistoryByWindow,
  getMaxRequiredHoursFromConditions,
} from "@/features/automation/server/condition-evaluator";
import { Automation } from "@/features/automation/types/automation";

export const dynamic = "force-dynamic";

const HOUR_MS = 60 * 60 * 1000;

/**
 * GET /api/automation/check
 * Định kỳ kiểm tra các quy tắc tự động hóa và thực thi nếu thỏa mãn điều kiện.
 * Dữ liệu được lấy từ API ngoại thay vì MongoDB local.
 */
export async function GET() {
  try {
    // 1. Xác thực
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Lấy danh sách automations từ API
    const automationsRes = await apiClient<{ success: boolean; data?: Automation[] }>("/automations", { method: "GET" }, token);
    const automations = (automationsRes.data || []).filter((a) => a.enabled);

    if (automations.length === 0) {
      return NextResponse.json({ success: true, message: "No active automations" });
    }

    // 3. Lấy cấu hình HA từ API (Server ngoại xử lý giải mã)
    const configRes = await apiClient<{ success: boolean; data?: { url: string; token: string } }>("/settings/home-assistant", { method: "GET" }, token);
    const config = configRes.data;

    if (!config || !config.url || !config.token) {
      return NextResponse.json({ success: false, message: "HA not configured at API server" });
    }

    // Lấy thời gian hiện tại theo múi giờ Việt Nam (GMT+7)
    const now = new Date();
    const vnTime = new Date(
      now.getTime() + 7 * 60 * 60 * 1000 + now.getTimezoneOffset() * 60000
    );
    const conditionWindowEnd = new Date(now);
    conditionWindowEnd.setSeconds(0, 0);
    const currentHourMin = `${String(vnTime.getHours()).padStart(2,"0")}:${String(vnTime.getMinutes()).padStart(2, "0")}`;

    // 4. Gom nhóm fetch data thời tiết
    let weatherHistory = null;
    const maxRequiredHours = Math.min(
      MAX_CONDITION_HOURS,
      automations.reduce((max: number, auto) => 
        Math.max(max, getMaxRequiredHoursFromConditions(auto.conditions)), 0)
    );

    if (maxRequiredHours > 0) {
      try {
        const windowStartMs = conditionWindowEnd.getTime() - maxRequiredHours * HOUR_MS;
        weatherHistory = await fetchMinuteWeatherHistoryByWindow(
          token,
          windowStartMs,
          conditionWindowEnd.getTime()
        );
      } catch (error) {
        console.error("Lỗi đọc dữ liệu thời tiết cho automation:", error);
      }
    }

    const executionResults = [];

    for (const auto of automations) {
      let shouldExecute = false;

      // Kiểm tra trigger theo giờ
      if (auto.trigger?.type === "time") {
        if (auto.trigger.value === currentHourMin) {
          const lastRan = auto.last_ran_at ? new Date(auto.last_ran_at) : null;
          if (!lastRan || now.getTime() - lastRan.getTime() > 65000) {
            shouldExecute = true;
          }
        }
      }

      if (shouldExecute) {
        const conditionResult = evaluateConditionsWithDetails(
          auto.conditions,
          auto.condition_mode,
          weatherHistory,
          conditionWindowEnd.getTime()
        );

        if (conditionResult.matched) {
          console.log(`Đang thực thi automation: ${auto.name}`);
          try {
            // Gọi API execute thay vì tự thực thi fetch HA tại đây
            const execRes = await apiClient(`/automations/${auto._id}/execute`, {
              method: "POST"
            }, token);
            
            executionResults.push({
              name: auto.name,
              conditionMatched: true,
              api_response: execRes
            });
          } catch (err) {
            executionResults.push({
              name: auto.name,
              conditionMatched: true,
              error: String(err)
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      time: currentHourMin,
      executedCount: executionResults.length,
      results: executionResults,
    });
  } catch (error) {
    console.error("Lỗi thực thi automation engine:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
