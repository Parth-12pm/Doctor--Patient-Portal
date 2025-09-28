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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, Calendar, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvailableSlot {
  day: string;
  timeSlots: string[];
}

interface DoctorAvailability {
  availableSlots: AvailableSlot[];
  blockedDates: string[];
}

export default function DoctorAvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availability, setAvailability] = useState<DoctorAvailability>({
    availableSlots: [],
    blockedDates: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [newBlockedDate, setNewBlockedDate] = useState("");

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

    fetchAvailability();
  }, [session, status, router]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/doctors/availability");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailability({
            availableSlots: data.availableSlots || [],
            blockedDates:
              data.blockedDates?.map(
                (date: string) => new Date(date).toISOString().split("T")[0]
              ) || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotToggle = (day: string, timeSlot: string) => {
    setAvailability((prev) => {
      const newAvailability = { ...prev };
      const dayIndex = newAvailability.availableSlots.findIndex(
        (slot) => slot.day === day
      );

      if (dayIndex === -1) {
        // Day doesn't exist, create it
        newAvailability.availableSlots.push({
          day,
          timeSlots: [timeSlot],
        });
      } else {
        // Day exists, toggle the time slot
        const currentSlots = newAvailability.availableSlots[dayIndex].timeSlots;
        if (currentSlots.includes(timeSlot)) {
          // Remove the time slot
          newAvailability.availableSlots[dayIndex].timeSlots =
            currentSlots.filter((slot) => slot !== timeSlot);
          // If no slots left, remove the day
          if (newAvailability.availableSlots[dayIndex].timeSlots.length === 0) {
            newAvailability.availableSlots.splice(dayIndex, 1);
          }
        } else {
          // Add the time slot
          newAvailability.availableSlots[dayIndex].timeSlots.push(timeSlot);
          // Sort time slots
          newAvailability.availableSlots[dayIndex].timeSlots.sort();
        }
      }

      return newAvailability;
    });
  };

  const handleDayToggle = (day: string, enabled: boolean) => {
    if (enabled) {
      // Enable all time slots for the day
      setAvailability((prev) => {
        const newAvailability = { ...prev };
        const dayIndex = newAvailability.availableSlots.findIndex(
          (slot) => slot.day === day
        );

        if (dayIndex === -1) {
          newAvailability.availableSlots.push({
            day,
            timeSlots: [...TIME_SLOTS],
          });
        } else {
          newAvailability.availableSlots[dayIndex].timeSlots = [...TIME_SLOTS];
        }

        return newAvailability;
      });
    } else {
      // Disable all time slots for the day
      setAvailability((prev) => ({
        ...prev,
        availableSlots: prev.availableSlots.filter((slot) => slot.day !== day),
      }));
    }
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !availability.blockedDates.includes(newBlockedDate)) {
      setAvailability((prev) => ({
        ...prev,
        blockedDates: [...prev.blockedDates, newBlockedDate].sort(),
      }));
      setNewBlockedDate("");
    }
  };

  const removeBlockedDate = (date: string) => {
    setAvailability((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== date),
    }));
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/doctors/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availableSlots: availability.availableSlots,
          blockedDates: availability.blockedDates,
        }),
      });

      if (response.ok) {
        setMessage("Availability updated successfully!");
        setMessageType("success");
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to update availability");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const getDaySlots = (day: string) => {
    const daySlot = availability.availableSlots.find(
      (slot) => slot.day === day
    );
    return daySlot?.timeSlots || [];
  };

  const isDayEnabled = (day: string) => {
    return availability.availableSlots.some((slot) => slot.day === day);
  };

  const minDate = new Date().toISOString().split("T")[0];

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/doctor/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Manage Availability
            </h1>
            <p className="text-muted-foreground mt-1">
              Set your working hours and blocked dates
            </p>
          </div>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${
              messageType === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertDescription
              className={
                messageType === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription>
                  Set your available time slots for each day (9:00 AM - 7:00 PM)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const daySlots = getDaySlots(key as string);
                  const isEnabled = isDayEnabled(key);

                  return (
                    <div key={key} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) =>
                              handleDayToggle(key, checked)
                            }
                          />
                          <Label className="text-base font-medium">
                            {label as string}
                          </Label>
                          <Badge variant="outline">
                            {daySlots.length} slot
                            {daySlots.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>

                      {isEnabled && (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 ml-8">
                          {TIME_SLOTS.map((timeSlot) => (
                            <Button
                              key={timeSlot}
                              variant={
                                daySlots.includes(timeSlot)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleTimeSlotToggle(key, timeSlot)
                              }
                              className="text-xs"
                            >
                              {timeSlot}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blocked Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Blocked Dates
                </CardTitle>
                <CardDescription>
                  Block specific dates when you're not available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={minDate}
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background"
                  />
                  <Button
                    size="sm"
                    onClick={addBlockedDate}
                    disabled={!newBlockedDate}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availability.blockedDates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No blocked dates
                    </p>
                  ) : (
                    availability.blockedDates.map((date) => (
                      <div
                        key={date}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span className="text-sm">
                          {new Date(date).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBlockedDate(date)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Working Days
                  </span>
                  <span className="font-medium">
                    {availability.availableSlots.length} / {DAYS_OF_WEEK.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Slots
                  </span>
                  <span className="font-medium">
                    {availability.availableSlots.reduce(
                      (total, day) => total + day.timeSlots.length,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Max Daily Appointments
                  </span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Blocked Dates
                  </span>
                  <span className="font-medium">
                    {availability.blockedDates.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={saveAvailability}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Availability
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
