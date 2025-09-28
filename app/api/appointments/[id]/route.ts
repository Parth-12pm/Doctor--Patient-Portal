import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
import { sendEmail, emailTemplates } from "@/lib/email";
import { type Session } from "next-auth";
import { format } from "date-fns";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await requireRole("doctor")) as Session;
    await dbConnect();

    const id = (await params).id;
    const body = await request.json();
    const { status } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(id)
      .populate({
        path: "patientId",
        model: Patient,
        select: "name email",
      })
      .populate({
        path: "doctorId",
        model: Doctor,
        select: "name clinicAddress",
      });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    appointment.status = status;
    await appointment.save();

    // Send notification email
    const patient = appointment.patientId as any;
    const doctor = appointment.doctorId as any;
    const formattedDate = format(
      new Date(appointment.appointmentDate),
      "MMMM do, yyyy"
    );

    if (patient?.email && doctor?.name) {
      const emailContent =
        status === "approved"
          ? emailTemplates.appointmentApproved(
              patient.name,
              doctor.name,
              formattedDate,
              appointment.timeSlot,
              doctor.clinicAddress || "Not specified"
            )
          : emailTemplates.appointmentRejected(
              patient.name,
              doctor.name,
              formattedDate,
              appointment.timeSlot
            );
      await sendEmail({ to: patient.email, ...emailContent });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error("  Update appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
