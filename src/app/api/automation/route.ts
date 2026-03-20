import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

import { Automation } from "@/features/automation/types/automation";

/**
 * GET: Lấy danh sách automations
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const automations = await db.collection("automations")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: automations });
  } catch (error) {
    console.error("Lỗi lấy danh sách automation:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * POST: Tạo mới automation
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      trigger,
      conditions,
      condition_mode = "all",
      actions_when_matched,
      actions_when_unmatched,
      actions,
      enabled = true,
    } = body;

    if (!name || !trigger) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const matchedActions = Array.isArray(actions_when_matched)
      ? actions_when_matched
      : Array.isArray(actions)
        ? actions
        : [];
    const unmatchedActions = Array.isArray(actions_when_unmatched)
      ? actions_when_unmatched
      : [];

    const newAutomation: Omit<Automation, "_id" | "created_at" | "updated_at"> & { created_at: Date; updated_at: Date } = {
      name,
      trigger,
      conditions: conditions || [],
      condition_mode,
      actions: matchedActions,
      actions_when_matched: matchedActions,
      actions_when_unmatched: unmatchedActions,
      enabled,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection("automations").insertOne(newAutomation);

    return NextResponse.json({ 
      success: true, 
      message: "Tạo automation thành công", 
      id: result.insertedId 
    });

  } catch (error) {
    console.error("Lỗi tạo automation:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
