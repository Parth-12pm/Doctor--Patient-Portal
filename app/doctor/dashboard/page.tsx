"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  Settings,
  Activity,
  Users,
  CheckCircle,
  X,
} from "lucide-react";
import Link from "next/link";

interface Appointment {
  _id: string;
  patientId: {
    name: string;
    age: number;
    gender: string;
  };
  appointmentDate: string;
  timeSlot: string;
  mode: "online" | "offline";
  urgency: "low" | "medium" | "high" | "emergency";
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  symptoms: string;
  patientType: "self" | "family";
  familyMemberDetails?: {
    name: string;
    age: number;
    gender: string;
    relation: string;
  };
}

interface DoctorProfile {
  name: string;
  speciality: string;
  post: string;
  experience: number;
  consultationFee: number;
  clinicAddress: string;
  profilePhoto?: string;
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      // Fetch appointments
      const appointmentsRes = await fetch("/api/doctors/appointments");
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }

      // Fetch profile
      const profileRes = await fetch("/api/doctors/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.doctor);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAction = async (
    appointmentId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
        }),
      });

      if (response.ok) {
        // Refresh appointments
        fetchData();
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toDateString();
    return new Date(apt.appointmentDate).toDateString() === today;
  });

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Dr. {profile?.name || session?.user?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/doctor/calendar">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </Link>
            <Link href="/doctor/profile">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Status Alert */}
        {!profile && (
          <Card className="mb-6 border-warning/20 bg-warning/10 dark:border-warning/30 dark:bg-warning/5">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-warning-foreground" />
              <div className="flex-1">
                <p className="text-warning-foreground font-medium">
                  Complete your profile
                </p>
                <p className="text-warning-foreground/80 text-sm">
                  Please complete your professional profile to start accepting
                  appointments
                </p>
              </div>
              <Link href="/doctor/profile">
                <Button variant="outline" size="sm">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-info/10 p-2 rounded-lg dark:bg-info/20">
                    <Calendar className="h-5 w-5 text-info-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {todayAppointments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-warning/10 p-2 rounded-lg dark:bg-warning/20">
                    <Clock className="h-5 w-5 text-warning-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {pendingAppointments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-success/10 p-2 rounded-lg dark:bg-success/20">
                    <Activity className="h-5 w-5 text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {completedAppointments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-primary/10 p-2 rounded-lg dark:bg-primary/20">
                    <Users className="h-5 w-5 text-primary-foreground dark:text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{appointments.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Appointments */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pending Appointments</CardTitle>
                  <Badge variant="outline">
                    {pendingAppointments.length} pending
                  </Badge>
                </div>
                <CardDescription>
                  Review and approve appointment requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No pending appointments
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">
                                {(appointment.patientType === "family" &&
                                  appointment.familyMemberDetails?.name) ||
                                  appointment.patientId?.name ||
                                  "Unknown Patient"}
                              </h4>
                              <Badge
                                className={getUrgencyColor(appointment.urgency)}
                              >
                                {appointment.urgency}
                              </Badge>
                              <Badge variant="outline">
                                {appointment.mode}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {appointment.patientType === "family" &&
                              appointment.familyMemberDetails ? (
                                <>
                                  {appointment.familyMemberDetails.age} years,{" "}
                                  {appointment.familyMemberDetails.gender} •
                                  Booked by:{" "}
                                  {appointment.patientId?.name || "N/A"} (
                                  {appointment.familyMemberDetails.relation})
                                </>
                              ) : (
                                <>
                                  {appointment.patientId?.age} years,{" "}
                                  {appointment.patientId?.gender}
                                </>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString()}{" "}
                              at {appointment.timeSlot}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Symptoms:</span>{" "}
                              {appointment.symptoms}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAppointmentAction(
                                  appointment._id,
                                  "approve"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAppointmentAction(
                                  appointment._id,
                                  "reject"
                                )
                              }
                              className="border-error/20 text-error-foreground hover:bg-error/10 dark:border-error/30 dark:hover:bg-error/20"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingAppointments.length > 5 && (
                      <div className="text-center pt-4">
                        <Link href="/doctor/appointments">
                          <Button variant="outline">
                            View All Pending ({pendingAppointments.length})
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No appointments scheduled for today
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-accent/10 p-2 rounded-lg">
                            <User className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {(appointment.patientType === "family" &&
                                appointment.familyMemberDetails?.name) ||
                                appointment.patientId?.name ||
                                "Unknown Patient"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Badge variant="outline">{appointment.mode}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.profilePhoto && (
                    <div className="flex justify-center">
                      <img
                        src={profile.profilePhoto || "/placeholder.svg"}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">Dr. {profile.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Speciality</p>
                    <p className="font-medium">{profile.speciality}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{profile.post}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{profile.experience} years</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Consultation Fee
                    </p>
                    <p className="font-medium">${profile.consultationFee}</p>
                  </div>
                  <Link href="/doctor/profile">
                    <Button
                      variant="outline"
                      className="w-full mt-4 bg-transparent"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/doctor/calendar">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </Link>
                <Link href="/doctor/appointments">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    All Appointments
                  </Button>
                </Link>
                <Link href="/doctor/availability">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Availability
                  </Button>
                </Link>
                <Link href="/doctor/profile">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
