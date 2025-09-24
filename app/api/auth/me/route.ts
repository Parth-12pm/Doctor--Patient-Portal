import { type NextRequest, NextResponse } from "next/server";
import { getServerSessionData } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSessionData();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    let profileData = null;

    if (session.user.role === "patient") {
      profileData = await Patient.findOne({ userId: session.user.id });
    } else if (session.user.role === "doctor") {
      profileData = await Doctor.findOne({ userId: session.user.id });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isProfileComplete: session.user.isProfileComplete,
      },
      profile: profileData,
    });
  } catch (error: any) {
    console.error("  Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
