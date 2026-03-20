import clientPromise from "@/lib/mongodb";
import { Automation, Device } from "@/features/automation/types/automation";

/**
 * Đọc danh sách automations trực tiếp từ MongoDB.
 * Dùng trong Server Component — tránh gọi qua API route (tránh overhead HTTP).
 */
export async function getAutomationsFromDB(): Promise<Automation[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const automations = await db.collection("automations")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Chuyển _id sang string để serialize qua RSC payload
    return automations.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
    })) as unknown as Automation[];
  } catch (error) {
    console.error("Lỗi đọc automations từ DB:", error);
    return [];
  }
}

/**
 * Đọc danh sách devices trực tiếp từ MongoDB.
 * Dùng trong Server Component — tránh gọi qua API route.
 */
export async function getDevicesFromDB(): Promise<Device[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const deviceListDoc = await db.collection("home-assistant").findOne({ type: "device_list" });
    return deviceListDoc ? (deviceListDoc.devices as Device[]) : [];
  } catch (error) {
    console.error("Lỗi đọc devices từ DB:", error);
    return [];
  }
}
