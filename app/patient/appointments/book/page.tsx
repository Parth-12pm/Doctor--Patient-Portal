"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowLeft, User, Stethoscope, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

interface Doctor {
  _id: string
  name: string
  speciality: string
  post: string
  experience: number
  consultationFee: number
  clinicAddress: string
  profilePhoto?: string
}

interface AvailableSlots {
  availableSlots: string[]
  totalSlots: number
  bookedSlots: number
  remainingSlots: number
}

export default function BookAppointmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots | null>(null)
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    timeSlot: "",
    mode: "offline" as "online" | "offline",
    urgency: "medium" as "low" | "medium" | "high" | "emergency",
    symptoms: "",
    patientType: "self" as "self" | "family",
    familyMemberDetails: {
      name: "",
      age: "",
      gender: "" as "male" | "female" | "other" | "",
      relation: "",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

    fetchDoctors()
  }, [session, status, router])

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors/list")
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return

    setIsLoadingSlots(true)
    try {
      const response = await fetch(`/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data)
      } else {
        setAvailableSlots(null)
      }
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setAvailableSlots(null)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d._id === doctorId)
    setSelectedDoctor(doctor || null)
    setFormData((prev) => ({ ...prev, doctorId, timeSlot: "" }))
    setAvailableSlots(null)

    if (doctorId && formData.appointmentDate) {
      fetchAvailableSlots(doctorId, formData.appointmentDate)
    }
  }

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, appointmentDate: date, timeSlot: "" }))
    setAvailableSlots(null)

    if (formData.doctorId && date) {
      fetchAvailableSlots(formData.doctorId, date)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)
    setError("")
    setSuccess("")

    try {
      const payload = {
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        mode: formData.mode,
        urgency: formData.urgency,
        symptoms: formData.symptoms,
        patientType: formData.patientType,
        ...(formData.patientType === "family" && {
          familyMemberDetails: {
            name: formData.familyMemberDetails.name,
            age: Number.parseInt(formData.familyMemberDetails.age),
            gender: formData.familyMemberDetails.gender,
            relation: formData.familyMemberDetails.relation,
          },
        }),
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Appointment booked successfully! You will be notified once the doctor approves it.")
        setTimeout(() => {
          router.push("/patient/appointments")
        }, 2000)
      } else {
        setError(data.error || "Failed to book appointment")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsBooking(false)
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

  const minDate = new Date().toISOString().split("T")[0]

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/patient/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Book Appointment</h1>
            <p className="text-muted-foreground mt-1">Schedule a consultation with a doctor</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Fill in the details to book your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Patient Type */}
                  <div className="space-y-2">
                    <Label>Booking for</Label>
                    <Select
                      value={formData.patientType}
                      onValueChange={(value: "self" | "family") =>
                        setFormData((prev) => ({ ...prev, patientType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Myself</SelectItem>
                        <SelectItem value="family">Family Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Family Member Details */}
                  {formData.patientType === "family" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <h3 className="font-medium">Family Member Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="familyName">Name *</Label>
                          <Input
                            id="familyName"
                            value={formData.familyMemberDetails.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                familyMemberDetails: { ...prev.familyMemberDetails, name: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="familyAge">Age *</Label>
                          <Input
                            id="familyAge"
                            type="number"
                            min="0"
                            max="150"
                            value={formData.familyMemberDetails.age}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                familyMemberDetails: { ...prev.familyMemberDetails, age: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="familyGender">Gender *</Label>
                          <Select
                            value={formData.familyMemberDetails.gender}
                            onValueChange={(value: "male" | "female" | "other") =>
                              setFormData((prev) => ({
                                ...prev,
                                familyMemberDetails: { ...prev.familyMemberDetails, gender: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="familyRelation">Relation *</Label>
                          <Input
                            id="familyRelation"
                            placeholder="e.g., Father, Mother, Child"
                            value={formData.familyMemberDetails.relation}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                familyMemberDetails: { ...prev.familyMemberDetails, relation: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Select Doctor *</Label>
                    <Select value={formData.doctorId} onValueChange={handleDoctorSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor._id} value={doctor._id}>
                            Dr. {doctor.name} - {doctor.speciality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Appointment Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      min={minDate}
                      value={formData.appointmentDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                    />
                  </div>

                  {/* Time Slot Selection */}
                  {formData.doctorId && formData.appointmentDate && (
                    <div className="space-y-2">
                      <Label>Available Time Slots *</Label>
                      {isLoadingSlots ? (
                        <div className="flex items-center gap-2 p-4 border rounded-lg">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                          <span className="text-sm text-muted-foreground">Loading available slots...</span>
                        </div>
                      ) : availableSlots ? (
                        availableSlots.availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {availableSlots.availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={formData.timeSlot === slot ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFormData((prev) => ({ ...prev, timeSlot: slot }))}
                                className="justify-center"
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 border rounded-lg bg-muted/50 text-center">
                            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No available slots for this date</p>
                          </div>
                        )
                      ) : null}
                    </div>
                  )}

                  {/* Mode and Urgency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Consultation Mode *</Label>
                      <Select
                        value={formData.mode}
                        onValueChange={(value: "online" | "offline") =>
                          setFormData((prev) => ({ ...prev, mode: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offline">In-Person</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Urgency Level *</Label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value: "low" | "medium" | "high" | "emergency") =>
                          setFormData((prev) => ({ ...prev, urgency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms & Description *</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Please describe your symptoms, concerns, or reason for the appointment (minimum 10 characters)"
                      value={formData.symptoms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                      rows={4}
                      required
                      minLength={10}
                    />
                  </div>

                  <Button type="submit" disabled={isBooking || !formData.timeSlot} className="w-full">
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking Appointment...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Doctor Info */}
            {selectedDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Doctor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDoctor.profilePhoto && (
                    <div className="flex justify-center">
                      <img
                        src={selectedDoctor.profilePhoto || "/placeholder.svg"}
                        alt="Doctor"
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">Dr. {selectedDoctor.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.speciality}</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.post}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedDoctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Consultation: ${selectedDoctor.consultationFee}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{selectedDoctor.clinicAddress}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appointment Summary */}
            {formData.doctorId && formData.appointmentDate && formData.timeSlot && (
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">
                      {formData.patientType === "family"
                        ? formData.familyMemberDetails.name || "Family Member"
                        : "Yourself"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">Dr. {selectedDoctor?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {new Date(formData.appointmentDate).toLocaleDateString()} at {formData.timeSlot}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium">{formData.mode === "online" ? "Online" : "In-Person"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Urgency</p>
                    <Badge className={getUrgencyColor(formData.urgency)}>{formData.urgency}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
