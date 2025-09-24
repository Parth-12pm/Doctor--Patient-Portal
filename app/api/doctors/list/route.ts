import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Doctor from "@/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const speciality = searchParams.get("speciality");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (speciality) {
      query.speciality = { $regex: speciality, $options: "i" };
    }

    // Get doctors with pagination
    const doctors = await Doctor.find(query)
      .select(
        "name speciality post experience consultationFee clinicAddress profilePhoto availableSlots"
      )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(query);

    return NextResponse.json({
      success: true,
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("  Get doctors list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
