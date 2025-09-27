export type UserRole = "doctor" | "patient";

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type UrgencyLevel = "low" | "medium" | "high" | "emergency";

export type AppointmentMode = "online" | "offline";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatient {
  _id: string;
  userId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  height: number; // in cm
  weight: number; // in kg
  bloodGroup: string;
  allergies?: string;
  medicalHistory?: string;
  profilePhoto?: string;
  profilePhotoPublicId?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctor {
  _id: string;
  userId: string;
  name: string;
  speciality: string;
  post: string; // pediatrician, physician, dentist, etc.
  experience: number; // years
  qualifications: string;
  consultationFee: number;
  clinicAddress: string;
  profilePhoto?: string;
  profilePhotoPublicId?: string; // For Cloudinary deletion
  availableSlots: {
    day: string; // 'monday', 'tuesday', etc.
    timeSlots: string[]; // ['09:00', '09:30', '10:00', etc.]
  }[];
  blockedDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointment {
  _id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  timeSlot: string; // '09:00', '09:30', etc.
  mode: AppointmentMode;
  urgency: UrgencyLevel;
  symptoms: string;
  status: AppointmentStatus;
  consultationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
