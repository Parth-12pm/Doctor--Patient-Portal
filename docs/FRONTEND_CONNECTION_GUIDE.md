# Frontend Connection Guide

This guide explains how to connect any frontend application to the Doctor-Patient Portal backend APIs.

## Quick Start

### 1. Authentication Setup

The backend uses NextAuth with JWT tokens. Here's how to integrate:

\`\`\`javascript
// For React/Next.js applications
import { SessionProvider } from "next-auth/react"

function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
\`\`\`

### 2. API Base Configuration

\`\`\`javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Generic API client
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }
}

export const api = new ApiClient()
\`\`\`

## Authentication Flow

### Registration
\`\`\`javascript
// Register new user
async function registerUser(userData) {
  return api.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      role: userData.role // 'patient' or 'doctor'
    })
  })
}

// Usage
const newUser = await registerUser({
  email: 'patient@example.com',
  password: 'securepassword',
  role: 'patient'
})
\`\`\`

### Login
\`\`\`javascript
// For NextAuth integration
import { signIn } from "next-auth/react"

async function loginUser(credentials) {
  const result = await signIn('credentials', {
    email: credentials.email,
    password: credentials.password,
    redirect: false,
  })
  
  if (result?.error) {
    throw new Error('Invalid credentials')
  }
  
  return result
}
\`\`\`

## Profile Management

### Patient Profile
\`\`\`javascript
// Create patient profile
async function createPatientProfile(profileData) {
  return api.request('/patients/profile', {
    method: 'POST',
    body: JSON.stringify({
      name: profileData.name,
      age: profileData.age,
      gender: profileData.gender,
      height: profileData.height,
      weight: profileData.weight,
      bloodGroup: profileData.bloodGroup,
      allergies: profileData.allergies,
      medicalHistory: profileData.medicalHistory,
      emergencyContact: {
        name: profileData.emergencyContact.name,
        phone: profileData.emergencyContact.phone,
        relation: profileData.emergencyContact.relation
      }
    })
  })
}

// Get patient profile
async function getPatientProfile() {
  return api.request('/patients/profile')
}

// Update patient profile
async function updatePatientProfile(profileData) {
  return api.request('/patients/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
}
\`\`\`

### Doctor Profile
\`\`\`javascript
// Create doctor profile
async function createDoctorProfile(profileData) {
  return api.request('/doctors/profile', {
    method: 'POST',
    body: JSON.stringify({
      name: profileData.name,
      speciality: profileData.speciality,
      post: profileData.post,
      experience: profileData.experience,
      qualifications: profileData.qualifications,
      consultationFee: profileData.consultationFee,
      clinicAddress: profileData.clinicAddress
    })
  })
}
\`\`\`

## Appointment Management

### Book Appointment
\`\`\`javascript
async function bookAppointment(appointmentData) {
  return api.request('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.date, // YYYY-MM-DD format
      timeSlot: appointmentData.timeSlot, // "HH:MM" format
      mode: appointmentData.mode, // 'online' or 'offline'
      urgency: appointmentData.urgency, // 'low', 'medium', 'high', 'emergency'
      symptoms: appointmentData.symptoms,
      patientType: appointmentData.patientType, // 'self' or 'family'
      familyMemberDetails: appointmentData.familyMemberDetails // if patientType is 'family'
    })
  })
}

// Example usage
const appointment = await bookAppointment({
  doctorId: 'doctor_id_here',
  date: '2024-12-20',
  timeSlot: '10:00',
  mode: 'offline',
  urgency: 'medium',
  symptoms: 'Chest pain and shortness of breath for 2 days',
  patientType: 'self'
})
\`\`\`

### Get Available Slots
\`\`\`javascript
async function getAvailableSlots(doctorId, date) {
  return api.request(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`)
}

// Usage
const slots = await getAvailableSlots('doctor_id', '2024-12-20')
console.log(slots.availableSlots) // ['09:00', '10:00', '11:00']
\`\`\`

### Get Appointments
\`\`\`javascript
// For patients - get their appointments
async function getPatientAppointments(filters = {}) {
  const params = new URLSearchParams()
  
  if (filters.status) params.append('status', filters.status)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  
  const queryString = params.toString()
  const endpoint = queryString ? `/appointments?${queryString}` : '/appointments'
  
  return api.request(endpoint)
}

// For doctors - get their appointments
async function getDoctorAppointments(filters = {}) {
  const params = new URLSearchParams()
  
  if (filters.status) params.append('status', filters.status)
  if (filters.date) params.append('date', filters.date)
  if (filters.page) params.append('page', filters.page.toString())
  
  const queryString = params.toString()
  const endpoint = queryString ? `/doctors/appointments?${queryString}` : '/doctors/appointments'
  
  return api.request(endpoint)
}
\`\`\`

### Update Appointment
\`\`\`javascript
// Patient cancelling appointment
async function cancelAppointment(appointmentId) {
  return api.request(`/appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'cancelled'
    })
  })
}

// Doctor approving/rejecting appointment
async function updateAppointmentStatus(appointmentId, status, notes = '') {
  return api.request(`/appointments/${appointmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: status, // 'approved', 'rejected', 'completed'
      consultationNotes: notes
    })
  })
}
\`\`\`

## File Upload

### Profile Photo Upload
\`\`\`javascript
async function uploadProfilePhoto(file) {
  const formData = new FormData()
  formData.append('photo', file)
  
  const response = await fetch(`${API_BASE_URL}/uploads/profile-photo`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, let browser set it for FormData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }
  
  return response.json()
}

// Usage
const fileInput = document.getElementById('photo-input')
const file = fileInput.files[0]
const result = await uploadProfilePhoto(file)
console.log(result.photoUrl) // Cloudinary URL
\`\`\`

## React Hooks (for React applications)

### useAuth Hook
\`\`\`javascript
import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    role: session?.user?.role,
    isProfileComplete: session?.user?.isProfileComplete
  }
}
\`\`\`

### useApi Hook
\`\`\`javascript
import { useState, useCallback } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await api.request(endpoint, options)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { request, loading, error }
}
\`\`\`

### useAppointments Hook
\`\`\`javascript
import { useState, useEffect } from 'react'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const { request } = useApi()
  
  const fetchAppointments = useCallback(async () => {
    try {
      const data = await request('/appointments')
      setAppointments(data.appointments)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [request])
  
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])
  
  const bookAppointment = async (appointmentData) => {
    const result = await request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
    await fetchAppointments() // Refresh list
    return result
  }
  
  return {
    appointments,
    loading,
    bookAppointment,
    refetch: fetchAppointments
  }
}
\`\`\`

## Error Handling

### Global Error Handler
\`\`\`javascript
export function handleApiError(error) {
  // Log error for debugging
  console.error('API Error:', error)
  
  // Handle specific error types
  if (error.message.includes('401')) {
    // Redirect to login
    window.location.href = '/login'
    return 'Please log in to continue'
  }
  
  if (error.message.includes('403')) {
    return 'You do not have permission to perform this action'
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found'
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred'
}
\`\`\`

## Form Validation

### Client-side Validation
\`\`\`javascript
// Appointment booking validation
export function validateAppointmentData(data) {
  const errors = {}
  
  if (!data.doctorId) {
    errors.doctorId = 'Please select a doctor'
  }
  
  if (!data.appointmentDate) {
    errors.appointmentDate = 'Please select a date'
  }
  
  if (!data.timeSlot) {
    errors.timeSlot = 'Please select a time slot'
  }
  
  if (!data.symptoms || data.symptoms.length < 10) {
    errors.symptoms = 'Please describe symptoms (minimum 10 characters)'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
\`\`\`

## Real-time Features (Optional)

### WebSocket Connection for Real-time Updates
\`\`\`javascript
// If you want to add real-time features
class WebSocketClient {
  constructor(url) {
    this.url = url
    this.ws = null
    this.listeners = new Map()
  }
  
  connect() {
    this.ws = new WebSocket(this.url)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const listeners = this.listeners.get(data.type) || []
      listeners.forEach(callback => callback(data))
    }
  }
  
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType).push(callback)
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}

// Usage for appointment updates
const wsClient = new WebSocketClient('ws://localhost:3000/ws')
wsClient.connect()
wsClient.subscribe('appointment_update', (data) => {
  console.log('Appointment updated:', data)
  // Update UI accordingly
})
\`\`\`

## Testing Your Integration

### Basic API Test
\`\`\`javascript
// Test basic connectivity
async function testApiConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors/list`)
    const data = await response.json()
    console.log('API connection successful:', data)
    return true
  } catch (error) {
    console.error('API connection failed:', error)
    return false
  }
}

// Test authentication
async function testAuthentication() {
  try {
    const user = await registerUser({
      email: 'test@example.com',
      password: 'testpassword',
      role: 'patient'
    })
    console.log('Registration successful:', user)
    return true
  } catch (error) {
    console.error('Authentication test failed:', error)
    return false
  }
}
\`\`\`

## Environment Configuration

### Frontend Environment Variables
\`\`\`bash
# .env.local (for Next.js) or .env (for other frameworks)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
\`\`\`

## Deployment Considerations

### Production Setup
1. **Update API URLs**: Change localhost URLs to production URLs
2. **HTTPS**: Ensure all API calls use HTTPS in production
3. **CORS**: Configure CORS settings on the backend for your domain
4. **Error Logging**: Implement proper error logging and monitoring
5. **Rate Limiting**: Consider implementing rate limiting on the frontend

### Security Best Practices
1. **Never expose sensitive data** in frontend code
2. **Validate all user inputs** before sending to API
3. **Handle authentication tokens securely**
4. **Implement proper error boundaries**
5. **Use HTTPS** for all API communications

This guide provides everything you need to connect your frontend application to the Doctor-Patient Portal backend. The APIs are designed to be RESTful and developer-friendly, with comprehensive error handling and validation.
