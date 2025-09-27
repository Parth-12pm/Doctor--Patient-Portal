import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { WORKING_DAYS, TIME_SLOTS } from "@/lib/constants";
import { type Session } from "next-auth";

export async function PUT(request: NextRequest) {
  try {
    const session = (await requireRole("doctor")) as Session;
    await dbConnect();

    const body = await request.json();
    const { availableSlots, blockedDates } = body;

    // Validate available slots
    if (availableSlots) {
      for (const slot of availableSlots) {
        if (!WORKING_DAYS.includes(slot.day)) {
          return NextResponse.json(
            { error: `Invalid day: ${slot.day}` },
            { status: 400 }
          );
        }

        for (const timeSlot of slot.timeSlots) {
          if (!TIME_SLOTS.includes(timeSlot)) {
            return NextResponse.json(
              { error: `Invalid time slot: ${timeSlot}` },
              { status: 400 }
            );
          }
        }
      }
    }

    const updateData: any = {};
    if (availableSlots) updateData.availableSlots = availableSlots;
    if (blockedDates)
      updateData.blockedDates = blockedDates.map(
        (date: string) => new Date(date)
      );

    const doctor = await Doctor.findOneAndUpdate(
      { userId: session.user.id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully",
      availableSlots: doctor.availableSlots,
      blockedDates: doctor.blockedDates,
    });
  } catch (error: any) {
    console.error("  Update doctor availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = (await requireRole("doctor")) as Session;
    await dbConnect();

    const doctor = await Doctor.findOne({ userId: session.user.id }).select(
      "availableSlots blockedDates"
    );

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      availableSlots: doctor.availableSlots,
      blockedDates: doctor.blockedDates,
    });
  } catch (error: any) {
    console.error("  Get doctor availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
