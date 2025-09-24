# API Integration Guide - Doctor-Patient Portal

This comprehensive guide explains how to integrate with the Doctor-Patient Portal backend APIs, including authentication, data models, and frontend connection patterns.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [API Endpoints Reference](#api-endpoints-reference)
3. [Frontend Integration](#frontend-integration)
4. [Data Models & Validation](#data-models--validation)
5. [Error Handling](#error-handling)
6. [Security Considerations](#security-considerations)
7. [Environment Setup](#environment-setup)

## Authentication System

### NextAuth Configuration

The system uses NextAuth with credentials provider for authentication:

\`\`\`typescript
// lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Authentication logic
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.isProfileComplete = user.isProfileComplete
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role as string
      session.user.isProfileComplete = token.isProfileComplete as boolean
      return session
    },
  },
}
\`\`\`

### Frontend Authentication Usage

\`\`\`typescript
// Client-side authentication
import { useSession, signIn, signOut } from "next-auth/react"

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (!session) return <button onClick={() => signIn()}>Sign in</button>
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
\`\`\`

### Server-side Authentication

\`\`\`typescript
// Server-side authentication utilities
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"

export async function requireRole(role: "doctor" | "patient") {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new Error("Not authenticated")
  }
  
  if (session.user.role !== role) {
    throw new Error("Insufficient permissions")
  }
  
  return session
}
\`\`\`

## API Endpoints Reference

### Authentication Endpoints

#### Register User
\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "patient" | "doctor"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "patient"
  }
}
\`\`\`

#### Login User
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### Profile Management

#### Patient Profile
\`\`\`http
POST /api/patients/profile
Authorization: Required (Patient role)
Content-Type: application/json

{
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "bloodGroup": "O+",
  "allergies": "None",
  "medicalHistory": "No significant history",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "relation": "Spouse"
  }
}
\`\`\`

#### Doctor Profile
\`\`\`http
POST /api/doctors/profile
Authorization: Required (Doctor role)
Content-Type: application/json

{
  "name": "Dr. Sarah Smith",
  "speciality": "Cardiology",
  "post": "Senior Consultant",
  "experience": 15,
  "qualifications": "MBBS, MD Cardiology",
  "consultationFee": 150,
  "clinicAddress": "123 Medical Center, Downtown"
}
\`\`\`

### Appointment Management

#### Book Appointment
\`\`\`http
POST /api/appointments
Authorization: Required (Patient role)
Content-Type: application/json

{
  "doctorId": "doctor_id",
  "appointmentDate": "2024-12-20",
  "timeSlot": "10:00",
  "mode": "offline",
  "urgency": "medium",
  "symptoms": "Chest pain and shortness of breath",
  "patientType": "self",
  "familyMemberDetails": {
    "name": "Family Member Name",
    "age": 25,
    "gender": "female",
    "relation": "Sister"
  }
}
\`\`\`

#### Get Available Slots
\`\`\`http
GET /api/appointments/available-slots?doctorId={doctorId}&date={date}
Authorization: Required (Patient role)
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "availableSlots": ["09:00", "10:00", "11:00"],
  "totalSlots": 8,
  "bookedSlots": 5,
  "remainingSlots": 3
}
\`\`\`

#### Update Appointment Status
\`\`\`http
PATCH /api/appointments/{appointmentId}
Authorization: Required
Content-Type: application/json

{
  "status": "approved" | "rejected" | "completed" | "cancelled",
  "consultationNotes": "Optional notes from doctor"
}
\`\`\`

## Frontend Integration

### Setting Up NextAuth Provider

\`\`\`tsx
// app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
\`\`\`

### API Client Utility

\`\`\`typescript
// lib/api-client.ts
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API request failed')
    }

    return response.json()
  }

  // Authentication
  async register(userData: RegisterData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Appointments
  async bookAppointment(appointmentData: AppointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    })
  }

  async getAvailableSlots(doctorId: string, date: string) {
    return this.request(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`)
  }

  // Profiles
  async createPatientProfile(profileData: PatientProfileData) {
    return this.request('/patients/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }
}

export const apiClient = new ApiClient()
\`\`\`

### React Hooks for API Integration

\`\`\`typescript
// hooks/use-appointments.ts
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.request('/appointments')
      setAppointments(data.appointments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const bookAppointment = async (appointmentData: any) => {
    try {
      const result = await apiClient.bookAppointment(appointmentData)
      await fetchAppointments() // Refresh list
      return result
    } catch (err) {
      throw err
    }
  }

  return {
    appointments,
    isLoading,
    error,
    bookAppointment,
    refetch: fetchAppointments,
  }
}
\`\`\`

### Form Handling with Validation

\`\`\`typescript
// components/appointment-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { appointmentSchema } from '@/lib/validations'

export function AppointmentForm() {
  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: '',
      appointmentDate: '',
      timeSlot: '',
      mode: 'offline',
      urgency: 'medium',
      symptoms: '',
    },
  })

  const onSubmit = async (data: any) => {
    try {
      await apiClient.bookAppointment(data)
      // Handle success
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
\`\`\`

## Data Models & Validation

### User Model
\`\`\`typescript
interface User {
  _id: string
  email: string
  role: 'doctor' | 'patient'
  isProfileComplete: boolean
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Patient Model
\`\`\`typescript
interface Patient {
  _id: string
  userId: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  allergies?: string
  medicalHistory?: string
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Doctor Model
\`\`\`typescript
interface Doctor {
  _id: string
  userId: string
  name: string
  speciality: string
  post: string
  experience: number
  qualifications: string
  consultationFee: number
  clinicAddress: string
  profilePhoto?: string
  availableSlots: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
    timeSlots: string[]
  }>
  blockedDates: Date[]
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Appointment Model
\`\`\`typescript
interface Appointment {
  _id: string
  patientId: string
  doctorId: string
  appointmentDate: Date
  timeSlot: string
  mode: 'online' | 'offline'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  symptoms: string
  patientType: 'self' | 'family'
  familyMemberDetails?: {
    name: string
    age: number
    gender: 'male' | 'female' | 'other'
    relation: string
  }
  consultationNotes?: string
  createdAt: Date
  updatedAt: Date
}
\`\`\`

## Error Handling

### API Error Response Format
\`\`\`json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
\`\`\`

### Frontend Error Handling
\`\`\`typescript
// utils/error-handler.ts
export function handleApiError(error: any) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 401:
        // Redirect to login
        window.location.href = '/login'
        break
      case 403:
        return 'You do not have permission to perform this action'
      case 404:
        return 'Resource not found'
      case 422:
        return data.details || 'Validation error'
      default:
        return data.error || 'An unexpected error occurred'
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.'
  } else {
    // Other error
    return error.message || 'An unexpected error occurred'
  }
}
\`\`\`

## Security Considerations

### Authentication Security
- JWT tokens are stored in HTTP-only cookies
- Session expiration is set to 7 days
- Role-based access control on all endpoints
- Password hashing using bcryptjs

### API Security
- Input validation using Zod schemas
- MongoDB injection prevention
- Rate limiting (implement as needed)
- CORS configuration for production

### Data Protection
- Sensitive data is not exposed in API responses
- Profile photos are stored securely in Cloudinary
- Email notifications use secure SMTP

## Environment Setup

### Required Environment Variables

\`\`\`bash
# Database
MONGODB_URI=mongodb://localhost:27017/doctor-patient-portal

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourapp.com

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Cron Jobs
CRON_SECRET=your-cron-secret
\`\`\`

### Development Setup

1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Set Environment Variables**
Create `.env.local` file with required variables

3. **Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

4. **Database Setup**
MongoDB will automatically create collections on first use

### Production Deployment

1. **Build Application**
\`\`\`bash
npm run build
\`\`\`

2. **Set Production Environment Variables**
Configure all environment variables in your hosting platform

3. **Database Migration**
Ensure MongoDB is accessible and properly configured

4. **File Upload Configuration**
Configure Cloudinary for production use

## Testing

### API Testing with Postman
Import the provided Postman collection for comprehensive API testing:
- Authentication flows
- Profile management
- Appointment booking and management
- File uploads
- Error scenarios

### Frontend Testing
\`\`\`typescript
// Example test for appointment booking
import { render, screen, fireEvent } from '@testing-library/react'
import { AppointmentForm } from '@/components/appointment-form'

test('books appointment successfully', async () => {
  render(<AppointmentForm />)
  
  // Fill form
  fireEvent.change(screen.getByLabelText('Symptoms'), {
    target: { value: 'Test symptoms' }
  })
  
  // Submit form
  fireEvent.click(screen.getByText('Book Appointment'))
  
  // Assert success
  expect(await screen.findByText('Appointment booked successfully')).toBeInTheDocument()
})
\`\`\`

## Support

For additional support or questions about API integration:
1. Check the Postman collection for working examples
2. Review the source code in the repository
3. Test endpoints using the provided sample data
4. Ensure all environment variables are properly configured

This guide provides a comprehensive foundation for integrating with the Doctor-Patient Portal APIs. The system is designed to be secure, scalable, and developer-friendly.
