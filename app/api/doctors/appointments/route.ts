import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { type Session } from "next-auth";
import Doctor from "@/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    const session = (await requireRole("doctor")) as Session;
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: session.user.id });
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Build query
    const query: any = { doctorId: doctor._id };
    if (status) {
      query.status = status;
    }
    if (date) {
      const targetDate = new Date(date);
      query.appointmentDate = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate(
        "patientId",
        "name age gender bloodGroup allergies medicalHistory emergencyContact"
      )
      .skip(skip)
      .limit(limit)
      .sort({ appointmentDate: 1, timeSlot: 1 });

    const total = await Appointment.countDocuments(query);

    return NextResponse.json({
      success: true,
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("  Get doctor appointments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
