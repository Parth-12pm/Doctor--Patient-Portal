import mongoose, { Schema } from "mongoose";
import type { IPatient } from "@/lib/types";

const PatientSchema = new Schema<IPatient>(
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
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    height: {
      type: Number,
      required: true,
      min: 30, // cm
      max: 300, // cm
    },
    weight: {
      type: Number,
      required: true,
      min: 1, // kg
      max: 500, // kg
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    allergies: {
      type: String,
      default: "",
    },
    medicalHistory: {
      type: String,
      default: "",
    },
    // Add profilePhoto field for patients too if needed
    profilePhoto: {
      type: String,
      default: "",
    },
    profilePhotoPublicId: {
      type: String,
      default: "",
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      relation: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Patient ||
  mongoose.model<IPatient>("Patient", PatientSchema);
