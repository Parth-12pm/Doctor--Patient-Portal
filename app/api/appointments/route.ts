import { type NextRequest, NextResponse } from "next/server";
import { appointmentSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { type Session } from "next-auth";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
import { MAX_APPOINTMENTS_PER_DAY } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const session = (await requireRole("patient")) as Session;
    await dbConnect();

    const body = await request.json();

    // Validate input
    const validatedData = appointmentSchema.parse(body);

    // Get patient profile
    const patient = await Patient.findOne({ userId: session.user.id });
    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Verify doctor exists and get their availability
    const doctor = await Doctor.findById(validatedData.doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const appointmentDate = new Date(validatedData.appointmentDate);
    const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
      weekday: "lowercase",
    });

    // Check if doctor is available on this day
    const dayAvailability = doctor.availableSlots.find(
      (slot) => slot.day === dayOfWeek
    );
    if (
      !dayAvailability ||
      !dayAvailability.timeSlots.includes(validatedData.timeSlot)
    ) {
      return NextResponse.json(
        { error: "Doctor is not available at this time" },
        { status: 400 }
      );
    }

    // Check if date is blocked
    const isBlocked = doctor.blockedDates.some(
      (blockedDate) =>
        blockedDate.toDateString() === appointmentDate.toDateString()
    );
    if (isBlocked) {
      return NextResponse.json(
        { error: "Doctor is not available on this date" },
        { status: 400 }
      );
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId: validatedData.doctorId,
      appointmentDate,
      timeSlot: validatedData.timeSlot,
      status: { $in: ["pending", "approved"] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // Check daily appointment limit for doctor
    const dailyAppointments = await Appointment.countDocuments({
      doctorId: validatedData.doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ["pending", "approved"] },
    });

    if (dailyAppointments >= MAX_APPOINTMENTS_PER_DAY) {
      return NextResponse.json(
        { error: "Doctor has reached maximum appointments for this day" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId: validatedData.doctorId,
      appointmentDate,
      timeSlot: validatedData.timeSlot,
      mode: validatedData.mode,
      urgency: validatedData.urgency,
      symptoms: validatedData.symptoms,
      status: "pending",
    });

    await appointment.save();

    // Populate appointment with patient and doctor details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "name age gender")
      .populate("doctorId", "name speciality post consultationFee");

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error: any) {
    console.error("  Create appointment error:", error);

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

export async function GET(request: NextRequest) {
  try {
    const session = (await requireRole("patient")) as Session;
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get patient profile
    const patient = await Patient.findOne({ userId: session.user.id });
    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Build query
    const query: any = { patientId: patient._id };
    if (status) {
      query.status = status;
    }

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate(
        "doctorId",
        "name speciality post consultationFee clinicAddress"
      )
      .skip(skip)
      .limit(limit)
      .sort({ appointmentDate: -1, timeSlot: 1 });

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
    console.error("  Get patient appointments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
