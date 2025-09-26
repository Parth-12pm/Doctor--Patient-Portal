export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                API System
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent mb-6">
              Doctor Patient Portal
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              A comprehensive backend system for managing doctor-patient
              appointments with modern architecture and seamless integration
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h2 className="text-2xl font-bold text-slate-800">
                    For Patients
                  </h2>
                </div>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Register and create detailed health profiles</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Browse and search available doctors</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Book appointments with preferred doctors</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Track appointment status and history</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Receive email notifications for updates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h2 className="text-2xl font-bold text-slate-800">
                    For Doctors
                  </h2>
                </div>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Create professional profiles with specializations</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Manage availability and time slots</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>View calendar with appointment overview</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Approve, reject, or reschedule appointments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Add consultation notes and manage patient records</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Endpoints Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-blue-100 rounded-3xl opacity-80 blur-lg"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/60 shadow-2xl mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                API Endpoints
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Authentication
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        POST
                      </span>
                      <code className="text-slate-700">/api/auth/register</code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                        POST
                      </span>
                      <code className="text-slate-700">/api/auth/login</code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                        GET
                      </span>
                      <code className="text-slate-700">/api/auth/me</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    Profiles
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        POST
                      </span>
                      <code className="text-slate-700">
                        /api/patients/profile
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        POST
                      </span>
                      <code className="text-slate-700">
                        /api/doctors/profile
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                        GET
                      </span>
                      <code className="text-slate-700">/api/doctors/list</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Appointments
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        POST
                      </span>
                      <code className="text-slate-700">/api/appointments</code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                        GET
                      </span>
                      <code className="text-slate-700">/api/appointments</code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50">
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
                        PATCH
                      </span>
                      <code className="text-slate-700">
                        /api/appointments/[id]
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Doctor Features
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                        GET
                      </span>
                      <code className="text-slate-700">
                        /api/doctors/calendar
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50">
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded">
                        PUT
                      </span>
                      <code className="text-slate-700">
                        /api/doctors/availability
                      </code>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        POST
                      </span>
                      <code className="text-slate-700">
                        /api/appointments/reschedule
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl opacity-80 blur-lg"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/60 shadow-2xl">
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                Key Features
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
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
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">
                    Secure Authentication
                  </h3>
                  <p className="text-slate-600">
                    Role-based access with Better Auth
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
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
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">
                    Smart Scheduling
                  </h3>
                  <p className="text-slate-600">
                    Conflict-free appointment booking
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
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
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">
                    Email Notifications
                  </h3>
                  <p className="text-slate-600">
                    Automated appointment updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              This is a backend API system. Use tools like Postman or integrate
              with a frontend application to interact with the endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
