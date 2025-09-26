"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stethoscope, Mail, Lock, UserCheck, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"doctor" | "patient" | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!role) {
      setError("Please select your role");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        router.push("/login?message=Registration successful. Please sign in.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full opacity-20 blur-lg scale-110"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl shadow-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            Create Account
          </h1>
          <p className="text-slate-600 text-lg">
            Join our medical portal today
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl shadow-blue-100/50 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Sign Up
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-slate-800 placeholder:text-slate-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="text-sm font-semibold text-slate-700"
                >
                  I am a
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                  <Select
                    value={role}
                    onValueChange={(value: "doctor" | "patient") =>
                      setRole(value)
                    }
                  >
                    <SelectTrigger className="pl-11 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-slate-800 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem
                        value="patient"
                        className="rounded-lg cursor-pointer hover:bg-blue-50 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-medium">Patient</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="doctor"
                        className="rounded-lg cursor-pointer hover:bg-blue-50 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-medium">Doctor</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-slate-800 placeholder:text-slate-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-slate-700"
                >
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-slate-800 placeholder:text-slate-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="pt-4 text-center border-t border-slate-100">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
