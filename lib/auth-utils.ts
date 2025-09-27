import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { type Session } from "next-auth";
import { redirect } from "next/navigation";

export async function getServerSessionData(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSessionData();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(
  requiredRole: "doctor" | "patient"
): Promise<Session | NextResponse> {
  const session = await getServerSessionData();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role !== requiredRole) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return session;
}

// Utility to check if user has completed profile
export async function requireCompleteProfile(): Promise<Session> {
  const session = await requireAuth();

  if (!(session.user as any).isProfileComplete) {
    const redirectUrl =
      session.user.role === "doctor" ? "/doctor/profile/" : "/patient/profile";
    redirect(redirectUrl);
  }

  return session;
}

// For API routes - returns session or throws error
export async function requireAuthAPI(): Promise<Session> {
  const session = await getServerSessionData();

  if (!session) {
    throw new Error("Not authenticated");
  }

  return session;
}

// For API routes - checks role
export async function requireRoleAPI(
  requiredRole: "doctor" | "patient"
): Promise<Session> {
  const session = await requireAuthAPI();

  if (session.user.role !== requiredRole) {
    throw new Error("Insufficient permissions");
  }

  return session;
}
