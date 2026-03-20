import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/crypto";
import {
  MAX_CONDITION_HOURS,
  evaluateConditionsWithDetails,
  fetchMinuteWeatherHistoryByWindow,
  getMaxRequiredHoursFromConditions,
} from "@/features/automation/server/condition-evaluator";
import { pickActionsByConditionMatch } from "@/features/automation/server/action-branches";

/**
 * POST /api/automation/[id]/run
 * Chạy thử một automation cụ thể và cập nhật last_ran_at
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Xác thực
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 2. Tìm kịch bản
    const automation = await db.collection("automations").findOne({ _id: new ObjectId(id) });
    if (!automation) {
      return NextResponse.json({ success: false, message: "Không tìm thấy kịch bản" }, { status: 404 });
    }

    // 3. Lấy cấu hình HA
    const config = await db.collection("setting").findOne({ type: "home_assistant" });
    if (!config || !config.url || !config.token) {
      return NextResponse.json({ success: false, message: "Chưa cấu hình Home Assistant" }, { status: 400 });
    }

    const haToken = decrypt(config.token);
    const haUrl = config.url.replace(/\/$/, "");

    // 4. Đánh giá điều kiện (bỏ qua trigger khi chạy tay)
    const now = new Date();
    now.setSeconds(0, 0);
    let weatherHistory = null;
    const maxRequiredHours = getMaxRequiredHoursFromConditions(automation.conditions);
    if (maxRequiredHours > 0) {
      const lookbackHours = Math.min(MAX_CONDITION_HOURS, maxRequiredHours);
      const windowStartMs = now.getTime() - lookbackHours * 60 * 60 * 1000;
      weatherHistory = await fetchMinuteWeatherHistoryByWindow(
        token,
        windowStartMs,
        now.getTime()
      );
    }

    const conditionResult = evaluateConditionsWithDetails(
      automation.conditions,
      automation.condition_mode,
      weatherHistory,
      now.getTime()
    );

    const actionsToExecute = pickActionsByConditionMatch(
      automation,
      conditionResult.matched
    );

    // 5. Thực thi các hành động theo nhánh điều kiện
    const results = [];
    for (const action of actionsToExecute) {
      try {
        const [domain, serviceName] = action.service.split(".");
        const res = await fetch(`${haUrl}/api/services/${domain}/${serviceName}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${haToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entity_id: action.entity_id }),
        });
        results.push({ entity_id: action.entity_id, success: res.ok });
      } catch (err) {
        results.push({ entity_id: action.entity_id, success: false, error: String(err) });
      }
    }

    // 6. Cập nhật thời gian chạy cuối
    await db.collection("automations").updateOne(
      { _id: new ObjectId(id) },
      { $set: { last_ran_at: now } }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Đã thực thi kịch bản", 
      condition_matched: conditionResult.matched,
      results,
      last_ran_at: now 
    });

  } catch (error) {
    console.error("Lỗi thực thi automation:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
