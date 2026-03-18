import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { decrypt } from "@/lib/crypto";

/**
 * GET /api/automation/check
 * Định kỳ kiểm tra các quy tắc tự động hóa và thực thi nếu thỏa mãn điều kiện.
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // 1. Lấy tất cả automation đang bật
    const automations = await db.collection("automations").find({ enabled: true }).toArray();
    
    // 2. Lấy cấu hình HA
    const config = await db.collection("setting").findOne({ type: "home_assistant" });
    if (!config || !config.url || !config.token) {
      return NextResponse.json({ success: false, message: "HA not configured" });
    }

    const haToken = decrypt(config.token);
    const haUrl = config.url.replace(/\/$/, "");

    // Lấy thời gian hiện tại theo múi giờ Việt Nam (GMT+7)
    const now = new Date();
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60000));
    const currentHourMin = `${String(vnTime.getHours()).padStart(2, "0")}:${String(vnTime.getMinutes()).padStart(2, "0")}`;
    
    const executionResults = [];

    for (const auto of automations) {
      let shouldExecute = false;

      // Kiểm tra trigger theo giờ
      if (auto.trigger.type === "time") {
        if (auto.trigger.value === currentHourMin) {
          // Tránh thực thi nhiều lần trong cùng 1 phút
          const lastRan = auto.last_ran_at ? new Date(auto.last_ran_at) : null;
          if (!lastRan || (now.getTime() - lastRan.getTime() > 65000)) {
            shouldExecute = true;
          }
        }
      }

      // Thực thi các hành động
      if (shouldExecute) {
        console.log(`Đang thực thi automation: ${auto.name}`);
        const actionResults = [];
        
        for (const action of auto.actions) {
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
            actionResults.push({ entity_id: action.entity_id, success: res.ok });
          } catch (err) {
            actionResults.push({ entity_id: action.entity_id, success: false, error: String(err) });
          }
        }

        // Cập nhật thời gian chạy cuối
        await db.collection("automations").updateOne(
          { _id: auto._id },
          { $set: { last_ran_at: now } }
        );

        executionResults.push({ name: auto.name, actions: actionResults });
      }
    }

    return NextResponse.json({ 
      success: true, 
      time: currentHourMin,
      executedCount: executionResults.length,
      results: executionResults 
    });

  } catch (error) {
    console.error("Lỗi thực thi automation engine:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
