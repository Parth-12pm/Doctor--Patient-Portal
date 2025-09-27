import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["doctor", "patient"], {
    required_error: "Role is required",
  }),
})

export const patientProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0).max(150, "Invalid age"),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(30).max(300, "Height must be between 30-300 cm"),
  weight: z.number().min(1).max(500, "Weight must be between 1-500 kg"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    relation: z.string().min(2, "Relation is required"),
  }),
})

export const doctorProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  speciality: z.string().min(2, "Speciality is required"),
  post: z.string().min(2, "Post is required"),
  experience: z.number().min(0).max(60, "Experience must be between 0-60 years"),
  qualifications: z.string().min(5, "Qualifications are required"),
  consultationFee: z.number().min(0, "Consultation fee must be positive"),
  clinicAddress: z.string().min(10, "Clinic address is required"),
  profilePhoto: z.string().optional(),
  availableSlots: z
    .array(
      z.object({
        day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday"]),
        timeSlots: z.array(z.string()),
      }),
    )
    .optional(),
})

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor selection is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  mode: z.enum(["online", "offline"]),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  symptoms: z.string().min(10, "Please describe symptoms (minimum 10 characters)"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})
