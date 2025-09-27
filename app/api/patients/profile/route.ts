import { type NextRequest, NextResponse } from "next/server";
import { patientProfileSchema } from "@/lib/validations";
import { type Session } from "next-auth";
import { requireRole } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Patient from "@/models/Patient";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = (await requireRole("patient")) as Session;
    await dbConnect();

    const body = await request.json();

    // Validate input
    const validatedData = patientProfileSchema.passthrough().parse(body);

    // Check if profile already exists
    const existingProfile = await Patient.findOne({ userId: session.user.id });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    // Create patient profile
    const patient = new Patient({
      userId: session.user.id,
      ...validatedData,
    });

    await patient.save();

    // Update user profile completion status
    await User.findByIdAndUpdate(session.user.id, {
      isProfileComplete: true,
    });

    return NextResponse.json({
      success: true,
      message: "Patient profile created successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
      },
    });
  } catch (error: any) {
    console.error("Patient profile creation error:", error);

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

    const patient = await Patient.findOne({ userId: session.user.id });

    // Return success even if no profile exists - let the frontend handle it
    return NextResponse.json({
      success: true,
      patient: patient || null,
      hasProfile: !!patient,
    });
  } catch (error: any) {
    console.error("Get patient profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = (await requireRole("patient")) as Session;
    await dbConnect();

    const body = await request.json();

    // Validate input
    const validatedData = patientProfileSchema.parse(body);

    const patient = await Patient.findOneAndUpdate(
      { userId: session.user.id },
      validatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Patient profile updated successfully",
      patient,
    });
  } catch (error: any) {
    console.error("Update patient profile error:", error);

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
