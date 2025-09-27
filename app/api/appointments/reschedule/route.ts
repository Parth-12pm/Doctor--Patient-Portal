import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { Session } from "next-auth";
import Doctor from "@/models/Doctor";
import { z } from "zod";

const rescheduleSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  newDate: z.string().min(1, "New date is required"),
  newTimeSlot: z.string().min(1, "New time slot is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = (await requireRole("doctor")) as Session;
    await dbConnect();

    const body = await request.json();
    const validatedData = rescheduleSchema.parse(body);

    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: session.user.id });
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Get the appointment
    const appointment = await Appointment.findById(validatedData.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this appointment
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if appointment can be rescheduled
    if (!["pending", "approved"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Cannot reschedule this appointment" },
        { status: 400 }
      );
    }

    const newDate = new Date(validatedData.newDate);
    const dayOfWeek = newDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Check if doctor is available on new date/time
    const dayAvailability = doctor.availableSlots.find(
      (slot: { day: string; }) => slot.day === dayOfWeek
    );
    if (
      !dayAvailability ||
      !dayAvailability.timeSlots.includes(validatedData.newTimeSlot)
    ) {
      return NextResponse.json(
        { error: "Doctor is not available at the new time" },
        { status: 400 }
      );
    }

    // Check if new slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate: newDate,
      timeSlot: validatedData.newTimeSlot,
      status: { $in: ["pending", "approved"] },
      _id: { $ne: appointment._id }, // Exclude current appointment
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "The new time slot is already booked" },
        { status: 400 }
      );
    }

    // Update appointment
    appointment.appointmentDate = newDate;
    appointment.timeSlot = validatedData.newTimeSlot;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "name age gender")
      .populate("doctorId", "name speciality post");

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error("  Reschedule appointment error:", error);

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
