import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Lấy bản ghi danh sách thiết bị duy nhất
    const deviceListDoc = await db.collection("home-assistant").findOne({ type: "device_list" });

    return NextResponse.json({ 
      success: true, 
      data: deviceListDoc ? deviceListDoc.devices : [] 
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách thiết bị:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
