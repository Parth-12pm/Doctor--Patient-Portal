import { getServerSession } from "next-auth/next";
import { handlers } from "@/lib/auth";
import { NextResponse } from "next/server";
import { type Session } from "next-auth";

export async function getServerSessionData() {
  return await getServerSession(handlers);
}

export async function requireAuth() {
  const session = await getServerSessionData();

  if (!session) {
    throw new Error("Not authenticated");
  }

  return session;
}

export async function requireRole(requiredRole: "doctor" | "patient") {
  const session = (await getServerSessionData()) as Session;

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
