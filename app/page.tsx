export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-secondary rounded-full mb-6">
              <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                API System
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-serif">
              Doctor Patient Portal
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A comprehensive backend system for managing doctor-patient
              appointments
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl opacity-50 blur-lg group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-card backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary rounded-xl">
                    <svg
                      className="w-6 h-6 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground font-serif">
                    For Patients
                  </h2>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Register and create detailed health profiles</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Browse and search available doctors</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Book appointments with preferred doctors</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Track appointment status and history</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Receive email notifications for updates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-accent/15 rounded-2xl opacity-50 blur-lg group-hover:opacity-70 transition-opacity"></div>
              <div className="relative bg-card backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent rounded-xl">
                    <svg
                      className="w-6 h-6 text-accent-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground font-serif">
                    For Doctors
                  </h2>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p>Create professional profiles with specializations</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p>Manage availability and time slots</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p>View calendar with appointment overview</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p>Approve, reject, or reschedule appointments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p>Add consultation notes and manage patient records</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Endpoints Section */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-muted rounded-3xl opacity-80 blur-lg"></div>
            <div className="relative bg-card backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-border shadow-xl">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-serif">
                API Endpoints
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    Authentication
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded font-mono">
                        POST
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/auth/register
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded font-mono">
                        POST
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/auth/login
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded font-mono">
                        GET
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/auth/me
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                    Profiles
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded font-mono">
                        POST
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/patients/profile
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded font-mono">
                        POST
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/doctors/profile
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded font-mono">
                        GET
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/doctors/list
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                    Appointments
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded font-mono">
                        POST
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/appointments
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded font-mono">
                        GET
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/appointments
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded font-mono">
                        PATCH
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/appointments/[id]
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                    Doctor Features
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded font-mono">
                        GET
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/doctors/calendar
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-muted-foreground text-background text-xs font-medium rounded font-mono">
                        PUT
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/doctors/availability
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded font-mono">
                        POST
                      </span>
                      <code className="text-foreground font-mono text-xs">
                        /api/appointments/reschedule
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/10 rounded-3xl opacity-60 blur-lg"></div>
            <div className="relative bg-card backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-border shadow-xl">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center font-serif">
                Key Features
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <svg
                      className="w-8 h-8 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">
                    Secure Authentication
                  </h3>
                  <p className="text-muted-foreground">
                    Role-based access with Better Auth
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <svg
                      className="w-8 h-8 text-accent-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a4 4 0 118 0v4m-4 2v6M4 7h16l-1 10H5L4 7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">
                    Smart Scheduling
                  </h3>
                  <p className="text-muted-foreground">
                    Conflict-free appointment booking
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-chart-3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <svg
                      className="w-8 h-8 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">
                    Email Notifications
                  </h3>
                  <p className="text-muted-foreground">
                    Automated appointment updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              This is a backend API system. Use tools like Postman or integrate
              with a frontend application to interact with the endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
