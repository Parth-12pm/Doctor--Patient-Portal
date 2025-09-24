# Doctor-Patient Portal API - Postman Collection

This collection contains all the API endpoints for testing the Doctor-Patient Portal backend system.

## Setup Instructions

1. **Import Collection**: Import the `Doctor-Patient-Portal-API.postman_collection.json` file into Postman
2. **Set Base URL**: Update the `baseUrl` variable to match your server (default: `http://localhost:3000`)
3. **Environment Variables**: Set up the following environment variables in Postman:
   - `baseUrl`: Your server URL
   - `doctorId`: Doctor ID after creating a doctor profile
   - `appointmentId`: Appointment ID after booking an appointment

## Testing Workflow

### 1. Authentication Flow
1. **Register Patient**: Create a patient account
2. **Register Doctor**: Create a doctor account  
3. **Login Patient**: Get patient session
4. **Login Doctor**: Get doctor session
5. **Get Current User**: Verify authentication

### 2. Profile Setup
1. **Create Patient Profile**: Complete patient profile with medical details
2. **Create Doctor Profile**: Complete doctor profile with speciality and availability
3. **Get Profiles**: Verify profile creation
4. **Update Profiles**: Test profile updates

### 3. Appointment Management
1. **Get Available Slots**: Check doctor availability for a specific date
2. **Book Appointment**: Patient books an appointment
3. **Get Appointments**: View patient's appointments
4. **Doctor View**: Doctor views their appointments and calendar
5. **Update Appointment**: Doctor approves/rejects, Patient cancels
6. **Reschedule**: Doctor reschedules appointment

### 4. Additional Features
1. **File Upload**: Upload doctor profile photos
2. **Notifications**: Send appointment notifications
3. **Doctor Listing**: Public endpoint to view all doctors

## Sample Data

### Patient Registration
\`\`\`json
{
  "email": "patient@example.com",
  "password": "password123",
  "role": "patient"
}
\`\`\`

### Doctor Registration
\`\`\`json
{
  "email": "doctor@example.com", 
  "password": "password123",
  "role": "doctor"
}
\`\`\`

### Patient Profile
\`\`\`json
{
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": "5'10\"",
  "weight": "75kg", 
  "bloodGroup": "O+",
  "allergies": ["Peanuts", "Shellfish"],
  "medicalHistory": "No major medical history",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Wife", 
    "phone": "+1234567890"
  }
}
\`\`\`

### Doctor Profile
\`\`\`json
{
  "name": "Dr. Sarah Smith",
  "speciality": "Cardiology",
  "post": "Senior Cardiologist",
  "experienceYears": 15,
  "qualifications": ["MBBS", "MD Cardiology", "FACC"],
  "consultationFee": 150,
  "clinicAddress": "123 Medical Center, Downtown",
  "availableSlots": [
    {
      "day": "monday",
      "timeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
    }
  ]
}
\`\`\`

### Appointment Booking
\`\`\`json
{
  "doctorId": "DOCTOR_ID_HERE",
  "appointmentDate": "2024-12-20", 
  "timeSlot": "10:00",
  "mode": "offline",
  "urgency": "medium",
  "symptoms": "Chest pain and shortness of breath for the past 2 days."
}
\`\`\`

## Environment Variables Required

Before testing, make sure to set these environment variables in your system:

- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_APP_URL`: Application URL
- `SMTP_HOST`: Email server host
- `SMTP_PORT`: Email server port  
- `SMTP_USER`: Email username
- `SMTP_PASS`: Email password
- `SMTP_FROM`: From email address
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `CRON_SECRET`: Secret for cron job authentication

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Patient Profile  
- `POST /api/patients/profile` - Create patient profile
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile

### Doctor Profile
- `POST /api/doctors/profile` - Create doctor profile  
- `GET /api/doctors/profile` - Get doctor profile
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/list` - Get all doctors (public)

### Doctor Availability
- `PUT /api/doctors/availability` - Update availability
- `GET /api/doctors/availability` - Get availability

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get patient appointments
- `GET /api/appointments/:id` - Get appointment details
- `PATCH /api/appointments/:id` - Update appointment
- `GET /api/appointments/available-slots` - Get available slots
- `POST /api/appointments/reschedule` - Reschedule appointment

### Doctor Appointments
- `GET /api/doctors/appointments` - Get doctor appointments
- `GET /api/doctors/calendar` - Get doctor calendar

### File Upload
- `POST /api/uploads/profile-photo` - Upload profile photo
- `DELETE /api/uploads/profile-photo` - Delete profile photo

### Notifications
- `POST /api/notifications/send` - Send notification
- `POST /api/notifications/bulk-reminders` - Send bulk reminders

## Notes

- All protected endpoints require authentication
- Replace placeholder IDs (DOCTOR_ID_HERE, APPOINTMENT_ID_HERE) with actual IDs from responses
- File upload endpoints require multipart/form-data
- Notification endpoints require doctor role
- Some endpoints have pagination support (page, limit parameters)