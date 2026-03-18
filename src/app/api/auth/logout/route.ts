import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Xoá cookie auth_token
  cookieStore.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  // Xoá cookie user_info
  cookieStore.set({
    name: "user_info",
    value: "",
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ success: true, message: "Đã đăng xuất" });
}
