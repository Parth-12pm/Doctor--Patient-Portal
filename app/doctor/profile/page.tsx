"use client";

import type React from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, User, Upload, X } from "lucide-react";
import Link from "next/link";

interface DoctorFormData {
  name: string;
  speciality: string;
  post: string;
  experience: string;
  qualifications: string;
  consultationFee: string;
  clinicAddress: string;
  profilePhoto: string;
}

export default function DoctorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    speciality: "",
    post: "",
    experience: "",
    qualifications: "",
    consultationFee: "",
    clinicAddress: "",
    profilePhoto: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

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

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/doctors/profile");
      const data = await response.json();

      if (response.ok) {
        setHasProfile(data.hasProfile);

        if (data.doctor) {
          const doctor = data.doctor;
          setFormData({
            name: doctor.name || "",
            speciality: doctor.speciality || "",
            post: doctor.post || "",
            experience: doctor.experience?.toString() || "",
            qualifications: doctor.qualifications || "",
            consultationFee: doctor.consultationFee?.toString() || "",
            clinicAddress: doctor.clinicAddress || "",
            profilePhoto: doctor.profilePhoto || "",
          });
          setIsEditing(true);
        } else {
          // No profile exists, user can create one
          setIsEditing(false);
        }
      } else {
        console.error("Error fetching profile:", data.error);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name,
        speciality: formData.speciality,
        post: formData.post,
        experience: Number.parseInt(formData.experience),
        qualifications: formData.qualifications,
        consultationFee: Number.parseFloat(formData.consultationFee),
        clinicAddress: formData.clinicAddress,
      };

      const method = isEditing ? "PUT" : "POST";
      const response = await fetch("/api/doctors/profile", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          isEditing
            ? "Profile updated successfully!"
            : "Profile created successfully!"
        );
        setIsEditing(true);
        setHasProfile(true);
        setTimeout(() => {
          router.push("/doctor/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Failed to save profile");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if profile exists first
    if (!hasProfile) {
      setError("Please create your profile first before uploading a photo.");
      return;
    }

    setIsUploading(true);
    setError("");

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!CLOUD_NAME) {
      setError("Cloudinary configuration is missing.");
      setIsUploading(false);
      return;
    }

    try {
      // 1. Get signature from our server
      const signResponse = await fetch("/api/uploads/sign-upload", {
        method: "POST",
      });
      const signData = await signResponse.json();
      if (!signResponse.ok) throw new Error(signData.error);

      // 2. Upload directly to Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append(
        "api_key",
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!
      );
      uploadFormData.append("timestamp", signData.timestamp);
      uploadFormData.append("signature", signData.signature);
      uploadFormData.append("public_id", signData.public_id);
      uploadFormData.append("folder", signData.folder);
      uploadFormData.append("transformation", signData.transformation);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.error.message);

      // 3. Update our database with the new URL
      const dbUpdateResponse = await fetch("/api/uploads/profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl: uploadData.secure_url,
          publicId: uploadData.public_id,
        }),
      });

      if (dbUpdateResponse.ok) {
        setFormData((prev) => ({
          ...prev,
          profilePhoto: uploadData.secure_url,
        }));
        setSuccess("Profile photo uploaded successfully!");
      } else {
        const dbError = await dbUpdateResponse.json();
        throw new Error(dbError.error || "Failed to save photo URL.");
      }
    } catch (error) {
      setError("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!hasProfile) {
      setError("No profile found.");
      return;
    }

    setIsSaving(true); // Use isSaving for visual feedback
    try {
      const response = await fetch("/api/uploads/profile-photo", {
        method: "DELETE",
      });

      if (response.ok) {
        setFormData((prev) => ({ ...prev, profilePhoto: "" }));
        setSuccess("Profile photo deleted successfully!");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete photo");
      }
    } catch (error) {
      setError("Failed to delete photo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-2xl">
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
              {isEditing ? "Edit Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing
                ? "Update your professional information"
                : "Please fill in your professional details"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              This information will be visible to patients when booking
              appointments
            </CardDescription>
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
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Profile Photo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Photo</h3>
                {!hasProfile && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      Please save your profile details first before uploading a
                      photo.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex items-center gap-4">
                  {formData.profilePhoto ? (
                    <div className="relative">
                      <img
                        src={formData.profilePhoto || "/placeholder.svg"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                      {hasProfile && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handlePhotoDelete}
                          disabled={isSaving}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="photo" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading || !hasProfile}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Photo"}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max size 5MB.{" "}
                      {!hasProfile && "(Available after saving profile)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speciality">Speciality *</Label>
                    <Input
                      id="speciality"
                      placeholder="e.g., Cardiologist, Pediatrician"
                      value={formData.speciality}
                      onChange={(e) =>
                        handleInputChange("speciality", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post">Position/Post *</Label>
                    <Input
                      id="post"
                      placeholder="e.g., Senior Consultant, Resident"
                      value={formData.post}
                      onChange={(e) =>
                        handleInputChange("post", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years) *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="60"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="consultationFee">
                      Consultation Fee ($) *
                    </Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.consultationFee}
                      onChange={(e) =>
                        handleInputChange("consultationFee", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications *</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="e.g., MBBS, MD (Cardiology), Fellowship in Interventional Cardiology"
                    value={formData.qualifications}
                    onChange={(e) =>
                      handleInputChange("qualifications", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">Clinic Address *</Label>
                  <Textarea
                    id="clinicAddress"
                    placeholder="Full clinic/hospital address"
                    value={formData.clinicAddress}
                    onChange={(e) =>
                      handleInputChange("clinicAddress", e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Update Profile" : "Create Profile"}
                    </>
                  )}
                </Button>
                <Link href="/doctor/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
