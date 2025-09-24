import { type NextRequest, NextResponse } from "next/server";
import { getServerSessionData } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSessionData();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const appointment = await Appointment.findById(params.id)
      .populate(
        "patientId",
        "name age gender bloodGroup allergies medicalHistory emergencyContact"
      )
      .populate(
        "doctorId",
        "name speciality post consultationFee clinicAddress"
      );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this appointment
    let hasAccess = false;

    if (session.user.role === "patient") {
      const patient = await Patient.findOne({ userId: session.user.id });
      hasAccess =
        patient &&
        appointment.patientId._id.toString() === patient._id.toString();
    } else if (session.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.user.id });
      hasAccess =
        doctor && appointment.doctorId._id.toString() === doctor._id.toString();
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    console.error("  Get appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSessionData();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { status, consultationNotes } = body;

    const appointment = await Appointment.findById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check permissions based on user role
    if (session.user.role === "patient") {
      const patient = await Patient.findOne({ userId: session.user.id });
      if (
        !patient ||
        appointment.patientId.toString() !== patient._id.toString()
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Patients can only cancel appointments
      if (status && status !== "cancelled") {
        return NextResponse.json(
          { error: "Patients can only cancel appointments" },
          { status: 400 }
        );
      }

      if (
        status === "cancelled" &&
        !["pending", "approved"].includes(appointment.status)
      ) {
        return NextResponse.json(
          { error: "Cannot cancel this appointment" },
          { status: 400 }
        );
      }
    } else if (session.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.user.id });
      if (
        !doctor ||
        appointment.doctorId.toString() !== doctor._id.toString()
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Doctors can approve, reject, complete appointments and add notes
      if (status && !["approved", "rejected", "completed"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status for doctor" },
          { status: 400 }
        );
      }
    }

    // Update appointment
    const updateData: any = {};
    if (status) updateData.status = status;
    if (consultationNotes !== undefined)
      updateData.consultationNotes = consultationNotes;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patientId", "name age gender")
      .populate("doctorId", "name speciality post");

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error("  Update appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
