"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  Plus,
  Activity,
  Heart,
  Phone,
} from "lucide-react";
import Link from "next/link";

interface Appointment {
  _id: string;
  doctorId: {
    name: string;
    speciality: string;
  };
  appointmentDate: string;
  timeSlot: string;
  mode: "online" | "offline";
  urgency: "low" | "medium" | "high" | "emergency";
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  symptoms: string;
}

interface PatientProfile {
  name: string;
  age: number;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      // Fetch appointments
      const appointmentsRes = await fetch("/api/appointments");
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }

      // Fetch profile
      const profileRes = await fetch("/api/patients/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.patient);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
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

  const upcomingAppointments = appointments
    .filter(
      (apt) =>
        apt.status === "approved" && new Date(apt.appointmentDate) >= new Date()
    )
    .slice(0, 3);

  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Patient Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.name || session?.user?.email}
            </p>
          </div>
          <Link href="/patient/appointments/book">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Profile Status Alert */}
        {!profile && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-orange-800 font-medium">
                  Complete your profile
                </p>
                <p className="text-orange-700 text-sm">
                  Please complete your medical profile to book appointments
                </p>
              </div>
              <Link href="/patient/profile">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {upcomingAppointments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        appointments.filter((apt) => apt.status === "completed")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        appointments.filter((apt) => apt.status === "pending")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Link href="/patient/appointments">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No upcoming appointments
                    </p>
                    <Link href="/patient/appointments/book">
                      <Button className="mt-4">
                        Book Your First Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-accent/10 p-2 rounded-lg">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.doctorId.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctorId.speciality}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString()}{" "}
                              at {appointment.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getUrgencyColor(appointment.urgency)}
                          >
                            {appointment.urgency}
                          </Badge>
                          <Badge variant="outline">{appointment.mode}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No appointments yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {appointment.doctorId.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
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
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{profile.age} years</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <p className="font-medium">{profile.bloodGroup}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Emergency Contact
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          {profile.emergencyContact.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.emergencyContact.relation} •{" "}
                          {profile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href="/patient/profile">
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
                <Link href="/patient/appointments/book">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Link href="/patient/appointments">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                </Link>
                <Link href="/patient/profile">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Manage Profile
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
