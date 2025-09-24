import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { NotificationService } from "@/lib/notification-service";
import { z } from "zod";

const notificationSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  type: z.enum(["booked", "approved", "rejected", "rescheduled", "reminder"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("doctor");

    const body = await request.json();
    const validatedData = notificationSchema.parse(body);

    const result = await NotificationService.sendAppointmentNotification(
      validatedData.appointmentId,
      validatedData.type
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("  Send notification error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
