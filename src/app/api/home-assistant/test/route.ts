import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  // 1. Xác thực người dùng (giống như các API khác trong app)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Invalid or Expired Token" }, { status: 401 });
  }

  try {
    const { url, haToken } = await req.json();

    if (!url || !haToken) {
      return NextResponse.json({ success: false, message: "Thiếu URL hoặc Token của Home Assistant" }, { status: 400 });
    }

    // Đảm bảo URL không có dấu gạch chéo ở cuối để tránh lỗi fetch
    const cleanUrl = url.replace(/\/$/, "");

    // 2. Kiểm tra kết nối tới Home Assistant API
    // Home Assistant cung cấp endpoint /api/states để lấy danh sách tất cả các thực thể
    const haResponse = await fetch(`${cleanUrl}/api/states`, {
      headers: {
        Authorization: `Bearer ${haToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!haResponse.ok) {
      const errorText = await haResponse.text();
      console.error("Home Assistant API Error:", errorText);
      return NextResponse.json({ 
        success: false, 
        message: `Kết nối thất bại: ${haResponse.status} ${haResponse.statusText}` 
      }, { status: haResponse.status });
    }

    const states = await haResponse.json();

    if (!Array.isArray(states)) {
      return NextResponse.json({ success: false, message: "Dữ liệu trả về từ Home Assistant không hợp lệ" }, { status: 500 });
    }

    const allowedPrefixes = ["switch.", "person.", "device_tracker.", "light."];
    const filteredStates = states
      .filter((entity: { entity_id: string }) => 
        allowedPrefixes.some(prefix => entity.entity_id.startsWith(prefix))
      )
      .map((entity: { entity_id: string; attributes: { friendly_name?: string } }) => ({
        entity_id: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id
      }));

    const client = await clientPromise;
    const db = client.db(); 

    // 3. Lưu cấu hình vào table setting
    const encryptedToken = encrypt(haToken);
    await db.collection("setting").updateOne(
      { type: "home_assistant" },
      { 
        $set: { 
          url: cleanUrl, 
          token: encryptedToken,
          updated_at: new Date() 
        } 
      },
      { upsert: true }
    );

    // 4. Lưu toàn bộ thiết bị vào 1 bản ghi duy nhất trong table home-assistant
    await db.collection("home-assistant").deleteMany({}); // Xóa dữ liệu cũ
    
    if (filteredStates.length > 0) {
      await db.collection("home-assistant").insertOne({
        type: "device_list",
        devices: filteredStates,
        synced_at: new Date()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Kết nối thành công! Đã lưu cấu hình vào 'setting' và đồng bộ ${filteredStates.length} thiết bị vào 1 bản ghi duy nhất.`,
      deviceCount: filteredStates.length 
    });

  } catch (error) {
    console.error("Lỗi khi kết nối tới Home Assistant:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Lỗi hệ thống khi xử lý kết nối",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
