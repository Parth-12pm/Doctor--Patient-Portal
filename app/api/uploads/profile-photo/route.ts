import { type NextRequest, NextResponse } from "next/server";
import { getServerSessionData } from "@/lib/auth-utils";
import {
  uploadToCloudinary,
  profilePhotoTransformation,
  deleteFromCloudinary,
} from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSessionData();
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

    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get doctor profile to check for existing photo
    const doctor = await Doctor.findOne({ userId: session.user.id });
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Delete existing photo if it exists
    if (doctor.profilePhoto) {
      if (
        typeof doctor.profilePhoto === "string" &&
        doctor.profilePhoto.trim()
      ) {
        const urlParts = doctor.profilePhoto.split("/");
        const filename = urlParts.pop();
        if (filename) {
          const publicId = filename.split(".")[0];
          if (publicId) {
            await deleteFromCloudinary(`doctor-patient-portal/${publicId}`);
          }
        }
      }
    }

    // Upload new photo
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: "doctor-patient-portal/profile-photos",
      public_id: `doctor_${session.user.id}_${Date.now()}`,
      transformation: profilePhotoTransformation,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Update doctor profile with new photo URL
    doctor.profilePhoto = uploadResult.url;
    await doctor.save();

    return NextResponse.json({
      success: true,
      message: "Profile photo uploaded successfully",
      photoUrl: uploadResult.url,
    });
  } catch (error: any) {
    console.error("  Profile photo upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSessionData();
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

    if (typeof doctor.profilePhoto === "string" && doctor.profilePhoto.trim()) {
      const urlParts = doctor.profilePhoto.split("/");
      const filename = urlParts.pop();
      if (filename) {
        const publicId = filename.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(
            `doctor-patient-portal/profile-photos/${publicId}`
          );
        }
      }
    }

    // Remove photo URL from database
    doctor.profilePhoto = "";
    await doctor.save();

    return NextResponse.json({
      success: true,
      message: "Profile photo deleted successfully",
    });
  } catch (error: any) {
    console.error("  Profile photo deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
