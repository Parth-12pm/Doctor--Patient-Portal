import { type NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

export async function authMiddleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/auth",
    "/api/doctors/list", // Public doctor listing
    "/login",
    "/register",
    "/",
  ]

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If accessing auth routes while logged in, redirect to dashboard
  if (session && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = session.user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // If accessing protected routes without session, redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based route protection
  if (session) {
    const userRole = session.user.role

    // Doctor routes
    if (pathname.startsWith("/doctor") && userRole !== "doctor") {
      return NextResponse.redirect(new URL("/patient/dashboard", request.url))
    }

    // Patient routes
    if (pathname.startsWith("/patient") && userRole !== "patient") {
      return NextResponse.redirect(new URL("/doctor/dashboard", request.url))
    }

    // API route protection
    if (pathname.startsWith("/api/doctors") && userRole !== "doctor" && !pathname.includes("/list")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (pathname.startsWith("/api/patients") && userRole !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.next()
}
