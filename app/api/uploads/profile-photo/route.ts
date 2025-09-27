import { type NextRequest, NextResponse } from "next/server";
import { getServerSessionData } from "@/lib/auth-utils";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";
import { type Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSessionData()) as Session;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can upload profile photos" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { photoUrl, publicId } = await request.json();

    let doctor = await Doctor.findOne({ userId: session.user.id });
    if (!doctor) {
      return NextResponse.json(
        {
          error:
            "Doctor profile not found. Please complete your profile first.",
        },
        { status: 404 }
      );
    }

    // Delete existing photo if it exists
    // The `profilePhotoPublicId` field should be added to the Doctor model
    if (doctor.profilePhotoPublicId) {
      await deleteFromCloudinary(doctor.profilePhotoPublicId);
    }

    // Update doctor profile with new photo URL
    doctor.profilePhoto = photoUrl;
    doctor.profilePhotoPublicId = publicId;
    await doctor.save();

    return NextResponse.json({
      success: true,
      message: "Profile photo uploaded successfully",
      photoUrl: photoUrl,
    });
  } catch (error: any) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json(
      { error: error.error || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = (await getServerSessionData()) as Session;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can delete profile photos" },
        { status: 403 }
      );
    }

    await dbConnect();

    const doctor = await Doctor.findOne({ userId: session.user.id });
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    if (!doctor.profilePhoto) {
      return NextResponse.json(
        { error: "No profile photo to delete" },
        { status: 400 }
      );
    }

    // Use the stored public_id for deletion
    if (doctor.profilePhotoPublicId) {
      await deleteFromCloudinary(doctor.profilePhotoPublicId);
    } else {
      // Fallback for old records, can be removed later
      console.warn(
        "Public ID not found for doctor, cannot delete from Cloudinary."
      );
    }

    // Remove photo URL from database
    doctor.profilePhoto = undefined;
    doctor.profilePhotoPublicId = undefined;
    await doctor.save();

    return NextResponse.json({
      success: true,
      message: "Profile photo deleted successfully",
    });
  } catch (error: any) {
    console.error("Profile photo deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
