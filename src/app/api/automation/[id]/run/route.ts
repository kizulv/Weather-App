import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { decrypt } from "@/lib/crypto";

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

    // 4. Thực thi các hành động
    const results = [];
    for (const action of automation.actions) {
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

    // 5. Cập nhật thời gian chạy cuối
    const now = new Date();
    await db.collection("automations").updateOne(
      { _id: new ObjectId(id) },
      { $set: { last_ran_at: now } }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Đã thực thi kịch bản", 
      results,
      last_ran_at: now 
    });

  } catch (error) {
    console.error("Lỗi thực thi automation:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
