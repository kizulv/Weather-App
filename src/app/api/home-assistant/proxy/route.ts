import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";

/**
 * POST: Thực thi lệnh tới Home Assistant
 * Body: { service: "switch/turn_on", entity_id: "switch.nong_lanh" }
 */
export async function POST(req: Request) {
  try {
    // 1. Xác thực người dùng app
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { service, entity_id } = body;

    if (!service || !entity_id) {
      return NextResponse.json({ success: false, message: "Thiếu service hoặc entity_id" }, { status: 400 });
    }

    // 2. Lấy cấu hình HA từ database
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("setting").findOne({ type: "home_assistant" });

    if (!config || !config.url || !config.token) {
      return NextResponse.json({ success: false, message: "Chưa cấu hình Home Assistant" }, { status: 400 });
    }

    // 3. Giải mã token
    const haToken = decrypt(config.token);
    const haUrl = config.url.replace(/\/$/, "");

    // 4. Gọi HA API
    // Service trong HA thường có định dạng domain.service, ví dụ switch.turn_on
    const [domain, serviceName] = service.split(".");
    if (!domain || !serviceName) {
      return NextResponse.json({ success: false, message: "Định dạng service không hợp lệ (vd: switch.turn_on)" }, { status: 400 });
    }

    const response = await fetch(`${haUrl}/api/services/${domain}/${serviceName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${haToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entity_id }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("HA Proxy Error:", errorData);
      return NextResponse.json({ 
        success: false, 
        message: `Lỗi từ Home Assistant: ${response.statusText}` 
      }, { status: response.status });
    }

    const result = await response.json();

    return NextResponse.json({ 
      success: true, 
      message: "Thực thi lệnh thành công",
      data: result 
    });

  } catch (error) {
    console.error("Lỗi HA Proxy:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
