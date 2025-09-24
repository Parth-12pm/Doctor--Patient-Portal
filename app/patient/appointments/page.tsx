"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowLeft, Plus, Search, Filter, Clock, MapPin, X } from "lucide-react"
import Link from "next/link"

interface Appointment {
  _id: string
  doctorId: {
    _id: string
    name: string
    speciality: string
    post: string
    consultationFee: number
    clinicAddress: string
  }
  appointmentDate: string
  timeSlot: string
  mode: "online" | "offline"
  urgency: "low" | "medium" | "high" | "emergency"
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled"
  symptoms: string
  patientType: "self" | "family"
  familyMemberDetails?: {
    name: string
    age: number
    gender: string
    relation: string
  }
  consultationNotes?: string
  createdAt: string
}

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    if (session.user.role !== "patient") {
      router.push("/dashboard")
      return
    }

    fetchAppointments()
  }, [session, status, router, statusFilter, pagination.page])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/appointments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.doctorId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.doctorId.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.symptoms.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredAppointments(filtered)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "rejected":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
              <p className="text-muted-foreground mt-1">View and manage your appointments</p>
            </div>
          </div>
          <Link href="/patient/appointments/book">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by doctor name, speciality, or symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't booked any appointments yet"}
              </p>
              <Link href="/patient/appointments/book">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment._id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">Dr. {appointment.doctorId.name}</h3>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        <Badge className={getUrgencyColor(appointment.urgency)}>{appointment.urgency}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {appointment.doctorId.speciality} • {appointment.doctorId.post}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.timeSlot}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {appointment.mode === "online" ? "Online" : "In-Person"}
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="mb-3">
                        <p className="text-sm">
                          <span className="font-medium">Patient:</span>{" "}
                          {appointment.patientType === "family" && appointment.familyMemberDetails
                            ? `${appointment.familyMemberDetails.name} (${appointment.familyMemberDetails.relation})`
                            : "Yourself"}
                        </p>
                      </div>

                      {/* Symptoms */}
                      <div className="mb-3">
                        <p className="text-sm">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      </div>

                      {/* Consultation Notes */}
                      {appointment.consultationNotes && (
                        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Doctor's Notes:</span> {appointment.consultationNotes}
                          </p>
                        </div>
                      )}

                      {/* Clinic Address for offline appointments */}
                      {appointment.mode === "offline" && appointment.status === "approved" && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Clinic Address:</span> {appointment.doctorId.clinicAddress}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {appointment.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {appointment.status === "approved" && new Date(appointment.appointmentDate) > new Date() && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Booked on {new Date(appointment.createdAt).toLocaleDateString()}</span>
                    <span>Consultation Fee: ${appointment.doctorId.consultationFee}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
