import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSessionData } from "@/lib/auth-utils";
import { type Session } from "next-auth";

export async function POST(request: Request) {
  const session = (await getServerSessionData()) as Session;
  if (!session || session.user.role !== "doctor") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Define a unique public_id for the upload
    const public_id = `doctor_${session.user.id}_${timestamp}`;
    const folder = "doctor-patient-portal/profile-photos";
    const transformation = "w_400,h_400,c_fill,g_face/q_auto,f_auto";

    // Prepare parameters for signing
    const paramsToSign = {
      timestamp: timestamp,
      public_id: public_id,
      folder: folder,
      transformation: transformation,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      public_id,
      folder,
      transformation,
    });
  } catch (error) {
    console.error("Error signing upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
