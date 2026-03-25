import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy API for executing individual automation actions
 * Endpoint: POST /api/automations/actions/execute
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const API_BASE_URL = process.env.WEATHER_API_BASE_URL || ""
    const token = req.cookies.get("auth_token")?.value

    if (!token && !API_BASE_URL.includes("localhost")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/automations/actions/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: unknown) {
    console.error("Error proxying action execution:", error)
    return NextResponse.json(
      { success: false, message: "Lỗi kết nối tới API Server" },
      { status: 500 }
    )
  }
}
