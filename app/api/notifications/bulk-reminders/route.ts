import { type NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
  try {
    // This endpoint could be called by a cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await NotificationService.sendBulkReminders();

    return NextResponse.json({
      ...(result && !("success" in result) ? { success: true } : {}),
      ...(result && !("message" in result)
        ? { message: "Bulk reminders processed" }
        : {}),
      ...result,
    });
  } catch (error: any) {
    console.error("  Bulk reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
