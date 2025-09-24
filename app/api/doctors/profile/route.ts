import { type NextRequest, NextResponse } from "next/server";
import { doctorProfileSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("doctor");
    await dbConnect();

    const body = await request.json();

    // Validate input
    const validatedData = doctorProfileSchema.parse(body);

    // Check if profile already exists
    const existingProfile = await Doctor.findOne({ userId: session.user.id });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    // Create doctor profile
    const doctor = new Doctor({
      userId: session.user.id,
      ...validatedData,
      // Initialize with default blocked dates (weekends)
      blockedDates: [],
    });

    await doctor.save();

    // Update user profile completion status
    await User.findByIdAndUpdate(session.user.id, {
      isProfileComplete: true,
    });

    return NextResponse.json({
      success: true,
      message: "Doctor profile created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        post: doctor.post,
      },
    });
  } catch (error: any) {
    console.error("  Doctor profile creation error:", error);

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
    const session = await requireRole("doctor");
    await dbConnect();

    const doctor = await Doctor.findOne({ userId: session.user.id });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      doctor,
    });
  } catch (error: any) {
    console.error("  Get doctor profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole("doctor");
    await dbConnect();

    const body = await request.json();

    // Validate input
    const validatedData = doctorProfileSchema.parse(body);

    const doctor = await Doctor.findOneAndUpdate(
      { userId: session.user.id },
      validatedData,
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
      message: "Doctor profile updated successfully",
      doctor,
    });
  } catch (error: any) {
    console.error("  Update doctor profile error:", error);

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
