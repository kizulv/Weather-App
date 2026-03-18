import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";

export async function GET() {
  try {
    // 1. Xác thực người dùng
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 });
    }

    // 2. Lấy cấu hình từ MongoDB
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("setting").findOne({ type: "home_assistant" });

    if (!config) {
      return NextResponse.json({ success: true, data: null });
    }

    // 3. Giải mã Token để hiển thị
    let decryptedToken = "";
    try {
      if (config.token) {
        decryptedToken = decrypt(config.token);
      }
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      // Nếu lỗi giải mã, trả về rỗng để người dùng nhập lại nếu cần
    }

    return NextResponse.json({
      success: true,
      data: {
        url: config.url || "",
        token: decryptedToken
      }
    });

  } catch (error) {
    console.error("Lỗi lấy cấu hình Home Assistant:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
