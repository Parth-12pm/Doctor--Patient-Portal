import mongoose, { Schema } from "mongoose";
import type { IDoctor } from "@/lib/types";

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
    // Add this field to store Cloudinary public_id for deletions
    profilePhotoPublicId: {
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
  }
);

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);
