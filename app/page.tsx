export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Doctor Patient Portal API
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive backend system for managing doctor-patient
              appointments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                For Patients
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Register and create detailed health profiles</li>
                <li>• Browse and search available doctors</li>
                <li>• Book appointments with preferred doctors</li>
                <li>• Track appointment status and history</li>
                <li>• Receive email notifications for updates</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
                For Doctors
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Create professional profiles with specializations</li>
                <li>• Manage availability and time slots</li>
                <li>• View calendar with appointment overview</li>
                <li>• Approve, reject, or reschedule appointments</li>
                <li>• Add consultation notes and manage patient records</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              API Endpoints
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">
                  Authentication
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/auth/register
                  </div>
                  <div>
                    <span className="text-blue-600">POST</span> /api/auth/login
                  </div>
                  <div>
                    <span className="text-purple-600">GET</span> /api/auth/me
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">
                  Profiles
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/patients/profile
                  </div>
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/doctors/profile
                  </div>
                  <div>
                    <span className="text-purple-600">GET</span>{" "}
                    /api/doctors/list
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">
                  Appointments
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/appointments
                  </div>
                  <div>
                    <span className="text-purple-600">GET</span>{" "}
                    /api/appointments
                  </div>
                  <div>
                    <span className="text-orange-600">PATCH</span>{" "}
                    /api/appointments/[id]
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">
                  Doctor Features
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-purple-600">GET</span>{" "}
                    /api/doctors/calendar
                  </div>
                  <div>
                    <span className="text-orange-600">PUT</span>{" "}
                    /api/doctors/availability
                  </div>
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/appointments/reschedule
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4 text-card-foreground">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold">🔐</span>
                </div>
                <h3 className="font-medium text-foreground">
                  Secure Authentication
                </h3>
                <p className="text-sm text-muted-foreground">
                  Role-based access with Better Auth
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold">📅</span>
                </div>
                <h3 className="font-medium text-foreground">
                  Smart Scheduling
                </h3>
                <p className="text-sm text-muted-foreground">
                  Conflict-free appointment booking
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold">📧</span>
                </div>
                <h3 className="font-medium text-foreground">
                  Email Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automated appointment updates
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              This is a backend API system. Use tools like Postman or integrate
              with a frontend application to interact with the endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
