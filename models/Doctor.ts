import mongoose, { Schema } from "mongoose"
import type { IDoctor } from "@/lib/types"

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    speciality: {
      type: String,
      required: true,
      trim: true,
    },
    post: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },
    qualifications: {
      type: String,
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    clinicAddress: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    availableSlots: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          required: true,
        },
        timeSlots: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    blockedDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Default blocked dates for weekends
DoctorSchema.pre("save", function (next) {
  if (this.isNew && this.blockedDates.length === 0) {
    // Add default weekend blocking logic can be handled in application logic
  }
  next()
})

export default mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema)
