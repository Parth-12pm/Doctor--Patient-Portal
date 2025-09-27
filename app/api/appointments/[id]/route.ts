import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Appointment from "@/models/Appointment"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    
    const { id } = await params

    await dbConnect()
    const appointment = await Appointment.findById(id).populate("doctor").populate("patient")

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
