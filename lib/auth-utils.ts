import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function getServerSessionData() {
  const session = await getServerSession(authOptions)
  return session
}

export async function requireAuth() {
  const session = await getServerSessionData()

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function requireRole(role: "doctor" | "patient") {
  const session = await requireAuth()

  if (session.user.role !== role) {
    const redirectPath = session.user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"
    redirect(redirectPath)
  }

  return session
}

export async function requireProfileComplete() {
  const session = await requireAuth()

  if (!session.user.isProfileComplete) {
    const profilePath = session.user.role === "doctor" ? "/doctor/profile/setup" : "/patient/profile/setup"
    redirect(profilePath)
  }

  return session
}
