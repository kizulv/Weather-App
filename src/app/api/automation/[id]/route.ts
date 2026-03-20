import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { Trigger, Action, Condition } from "@/features/automation/types/automation";

/**
 * PUT: Cập nhật automation
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      condition_mode,
      actions,
      actions_when_matched,
      actions_when_unmatched,
      enabled,
    } = body;

    const client = await clientPromise;
    const db = client.db();

    const updateData: {
      updated_at: Date;
      name?: string;
      trigger?: Trigger;
      conditions?: Condition[];
      condition_mode?: "all" | "any";
      actions?: Action[];
      actions_when_matched?: Action[];
      actions_when_unmatched?: Action[];
      enabled?: boolean;
    } = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (trigger !== undefined) updateData.trigger = trigger;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (condition_mode !== undefined) updateData.condition_mode = condition_mode;
    if (actions_when_matched !== undefined) {
      updateData.actions_when_matched = actions_when_matched;
      updateData.actions = actions_when_matched;
    }
    if (actions_when_unmatched !== undefined) {
      updateData.actions_when_unmatched = actions_when_unmatched;
    }
    if (actions !== undefined && actions_when_matched === undefined) {
      updateData.actions = actions;
      updateData.actions_when_matched = actions;
    }
    if (enabled !== undefined) updateData.enabled = enabled;

    const result = await db.collection("automations").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Không tìm thấy automation" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });

  } catch (error) {
    console.error("Lỗi cập nhật automation:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * DELETE: Xóa automation
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("automations").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Không tìm thấy automation" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Xóa automation thành công" });

  } catch (error) {
    console.error("Lỗi xóa automation:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
