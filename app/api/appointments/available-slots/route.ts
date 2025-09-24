import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import { MAX_APPOINTMENTS_PER_DAY } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole("patient");
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: "Doctor ID and date are required" },
        { status: 400 }
      );
    }

    // Get doctor and their availability
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
      weekday: "lowercase",
    });

    // Check if doctor works on this day
    const dayAvailability = doctor.availableSlots.find(
      (slot) => slot.day === dayOfWeek
    );
    if (!dayAvailability) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        message: "Doctor is not available on this day",
      });
    }

    // Check if date is blocked
    const isBlocked = doctor.blockedDates.some(
      (blockedDate) =>
        blockedDate.toDateString() === appointmentDate.toDateString()
    );
    if (isBlocked) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        message: "Doctor is not available on this date",
      });
    }

    // Check daily appointment limit
    const dailyAppointments = await Appointment.countDocuments({
      doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ["pending", "approved"] },
    });

    if (dailyAppointments >= MAX_APPOINTMENTS_PER_DAY) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        message: "Doctor has reached maximum appointments for this day",
      });
    }

    // Get booked slots for this date
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ["pending", "approved"] },
    }).select("timeSlot");

    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);

    // Filter available slots
    const availableSlots = dayAvailability.timeSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return NextResponse.json({
      success: true,
      availableSlots,
      totalSlots: dayAvailability.timeSlots.length,
      bookedSlots: bookedSlots.length,
      remainingSlots: availableSlots.length,
    });
  } catch (error: any) {
    console.error("  Get available slots error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
