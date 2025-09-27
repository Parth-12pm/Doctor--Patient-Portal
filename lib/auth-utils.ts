import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getServerSessionData() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getServerSessionData();

  if (!session) {
    throw new Error("Not authenticated");
  }

  return session;
}

export async function requireRole(requiredRole: "doctor" | "patient") {
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
