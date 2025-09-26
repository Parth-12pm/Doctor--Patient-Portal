"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft, Clock, CheckCircle, X } from "lucide-react"
import Link from "next/link"

interface Appointment {
  _id: string
  patientId: {
    name: string
    age: number
    gender: string
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
}

export default function DoctorCalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    if (session.user.role !== "doctor") {
      router.push("/dashboard")
      return
    }

    fetchAppointments()
  }, [session, status, router])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/doctors/appointments")
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppointmentAction = async (appointmentId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
        }),
      })

      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate)
      return appointmentDate.toDateString() === date.toDateString()
    })
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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : []

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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/doctor/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar View</h1>
            <p className="text-muted-foreground mt-1">Manage your appointments and schedule</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Click on a date to view appointments for that day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-20"></div>
                    }

                    const dayAppointments = getAppointmentsForDate(day)
                    const isToday = day.toDateString() === new Date().toDateString()
                    const isSelected = selectedDate?.toDateString() === day.toDateString()
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

                    return (
                      <div
                        key={index}
                        className={`p-2 h-20 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          isSelected
                            ? "bg-accent border-accent-foreground"
                            : isToday
                              ? "bg-primary/10 border-primary"
                              : isPast
                                ? "bg-muted/30 text-muted-foreground"
                                : "bg-background"
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((appointment, idx) => (
                            <div
                              key={idx}
                              className={`text-xs px-1 py-0.5 rounded text-white truncate ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.timeSlot}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{dayAppointments.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Status Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-sm">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Appointments */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedDate.toLocaleDateString()}</CardTitle>
                  <CardDescription>
                    {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDateAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No appointments scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateAppointments.map((appointment) => (
                        <div key={appointment._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">
                                  {appointment.patientType === "family" && appointment.familyMemberDetails
                                    ? appointment.familyMemberDetails.name
                                    : appointment.patientId.name}
                                </h4>
                                <Badge className={getUrgencyColor(appointment.urgency)}>{appointment.urgency}</Badge>
                                <Badge variant="outline">{appointment.mode}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {appointment.patientType === "family" && appointment.familyMemberDetails ? (
                                  <>
                                    {appointment.familyMemberDetails.age} years,{" "}
                                    {appointment.familyMemberDetails.gender}• Booked by: {appointment.patientId.name} (
                                    {appointment.familyMemberDetails.relation})
                                  </>
                                ) : (
                                  <>
                                    {appointment.patientId.age} years, {appointment.patientId.gender}
                                  </>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {appointment.timeSlot}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                              </p>
                              <div className="mt-2">
                                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              </div>
                            </div>
                          </div>

                          {appointment.status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleAppointmentAction(appointment._id, "approve")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAppointmentAction(appointment._id, "reject")}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  <span className="font-medium">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {appointments.filter((a) => a.status === "pending").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="font-medium text-green-600">
                    {appointments.filter((a) => a.status === "approved").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-blue-600">
                    {appointments.filter((a) => a.status === "completed").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
