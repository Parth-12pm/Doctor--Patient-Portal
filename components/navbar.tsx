"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  User,
  Settings,
  LogOut,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    return role === "doctor" ? "bg-blue-500" : "bg-green-500";
  };

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/dashboard";
    return session.user.role === "doctor"
      ? "/doctor/dashboard"
      : "/patient/dashboard";
  };

  const getNavItems = () => {
    if (!session?.user?.role) return [];

    if (session.user.role === "doctor") {
      return [
        { href: "/doctor/dashboard", label: "Dashboard", icon: FileText },
        { href: "/doctor/calendar", label: "Calendar", icon: Calendar },
        { href: "/doctor/availability", label: "Availability", icon: Clock },
        { href: "/doctor/profile", label: "Profile", icon: User },
      ];
    } else {
      return [
        { href: "/patient/dashboard", label: "Dashboard", icon: FileText },
        {
          href: "/patient/appointments",
          label: "Appointments",
          icon: Calendar,
        },
        {
          href: "/patient/appointments/book",
          label: "Book Appointment",
          icon: Clock,
        },
        { href: "/patient/profile", label: "Profile", icon: User },
      ];
    }
  };

  // Don't show navbar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-accent p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MedPortal</span>
          </Link>

          {/* Navigation Items */}
          {session && (
            <div className="hidden md:flex items-center gap-6">
              {getNavItems().map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent ${
                    pathname === href ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ModeToggle />

            {status === "loading" ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt="Profile" />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {getInitials(session.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.email}
                        </p>
                        <Badge className={getRoleColor(session.user?.role)}>
                          {session.user?.role}
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mobile Navigation Items */}
                  <div className="md:hidden">
                    {getNavItems().map(({ href, label, icon: Icon }) => (
                      <DropdownMenuItem key={href} asChild>
                        <Link href={href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        session.user?.role === "doctor"
                          ? "/doctor/profile"
                          : "/patient/profile"
                      }
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
