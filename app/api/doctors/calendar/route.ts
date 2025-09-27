import { type NextRequest, NextResponse } from "next/server";
import { type Session } from "next-auth";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    const session = (await requireRole("doctor")) as Session;
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM format
    const year = searchParams.get("year");

    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: session.user.id });
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [yearStr, monthStr] = month.split("-");
      startDate = new Date(
        Number.parseInt(yearStr),
        Number.parseInt(monthStr) - 1,
        1
      );
      endDate = new Date(
        Number.parseInt(yearStr),
        Number.parseInt(monthStr),
        0,
        23,
        59,
        59,
        999
      );
    } else if (year) {
      startDate = new Date(Number.parseInt(year), 0, 1);
      endDate = new Date(Number.parseInt(year), 11, 31, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }

    // Get appointments for the date range
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("patientId", "name age gender")
      .sort({ appointmentDate: 1, timeSlot: 1 });

    // Group appointments by date
    const calendar: { [key: string]: any[] } = {};

    appointments.forEach((appointment) => {
      const dateKey = appointment.appointmentDate.toISOString().split("T")[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push({
        id: appointment._id,
        timeSlot: appointment.timeSlot,
        patientName: appointment.patientId.name,
        patientAge: appointment.patientId.age,
        mode: appointment.mode,
        urgency: appointment.urgency,
        status: appointment.status,
        symptoms:
          appointment.symptoms.substring(0, 100) +
          (appointment.symptoms.length > 100 ? "..." : ""),
      });
    });

    // Get appointment counts by status for summary
    const statusCounts = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctor._id,
          appointmentDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = statusCounts.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      calendar,
      summary,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    console.error("  Get doctor calendar error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
