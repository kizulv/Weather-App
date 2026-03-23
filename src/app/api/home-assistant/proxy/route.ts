import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";

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
    const { service, entity_id, title, message } = body;

    if (!service) {
      return NextResponse.json({ success: false, message: "Thiếu service (vd: notify.mobile_app_...)" }, { status: 400 });
    }

    // 2. Lấy cấu hình HA từ server ngoại
    const configResponse = await apiClient<{ 
      success: boolean; 
      data?: { url: string; token: string } 
    }>("/settings/home-assistant", { method: "GET" }, token);
    const config = configResponse.data;

    if (!config || !config.url || !config.token) {
      return NextResponse.json({ success: false, message: "Chưa cấu hình Home Assistant" }, { status: 400 });
    }

    // 3. Sử dụng token và url từ API ngoại
    const haToken = config.token;
    const haUrl = config.url.replace(/\/$/, "");

    // 4. Gọi HA API
    const [domain, ...serviceParts] = service.split(".");
    let serviceName = serviceParts.join(".");
    
    // Nếu chỉ gửi "notify", tự động chuyển thành "notify.notify"
    if (domain === "notify" && !serviceName) {
      serviceName = "notify";
    }

    if (!domain || !serviceName) {
      return NextResponse.json({ 
        success: false, 
        message: "Định dạng service không hợp lệ. Phải là domain.service (vd: notify.notify hoặc switch.turn_on)" 
      }, { status: 400 });
    }

    const haProxyResponse = await fetch(`${haUrl}/api/services/${domain}/${serviceName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${haToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        // Domain notify KHÔNG dùng entity_id trong body, 
        // các domain khác (switch, light, v.v.) thì CẦN.
        ...(domain !== "notify" && entity_id ? { entity_id } : {}),
        ...(title ? { title } : {}),
        ...(message ? { message } : {}),
      }),
    });

    if (!haProxyResponse.ok) {
      const errorData = await haProxyResponse.text();
      console.error("HA Proxy Error:", errorData);
      return NextResponse.json({ 
        success: false, 
        message: `Lỗi từ Home Assistant: ${haProxyResponse.statusText}` 
      }, { status: haProxyResponse.status });
    }

    const result = await haProxyResponse.json() as Record<string, unknown>[];

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
