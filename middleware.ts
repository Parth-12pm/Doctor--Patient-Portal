import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If accessing auth routes while logged in, redirect to dashboard
    if (token && (pathname === "/login" || pathname === "/register")) {
      const redirectUrl =
        token.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Role-based route protection
    if (token) {
      const userRole = token.role;

      // Doctor routes
      if (pathname.startsWith("/doctor") && userRole !== "doctor") {
        return NextResponse.redirect(new URL("/patient/dashboard", req.url));
      }

      // Patient routes
      if (pathname.startsWith("/patient") && userRole !== "patient") {
        return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
      }

      // Redirect to profile creation if profile is incomplete
      // if (!token.isProfileComplete) {
      //   const profileRoutes = ["/doctor/profile", "/patient/profile"];
      //   const isProfileRoute = profileRoutes.some((route) =>
      //     pathname.startsWith(route)
      //   );

      //   if (!isProfileRoute && !pathname.startsWith("/api")) {
      //     const redirectUrl =
      //       userRole === "doctor" ? "/doctor/profile/" : "/patient/profile";
      //     return NextResponse.redirect(new URL(redirectUrl, req.url));
      //   }
      // }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/api/auth",
          "/api/doctors/list",
        ];

        const isPublicRoute = publicRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // Allow public routes
        if (isPublicRoute) return true;

        // Require token for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
