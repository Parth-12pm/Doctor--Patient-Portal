import mongoose, { Schema } from "mongoose"
import type { IAppointment } from "@/lib/types"

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: String,
      required: true,
      ref: "Patient",
    },
    doctorId: {
      type: String,
      required: true,
      ref: "Doctor",
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    consultationNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure no double booking
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true })

// Index for efficient queries
AppointmentSchema.index({ patientId: 1, createdAt: -1 })
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 })

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)
