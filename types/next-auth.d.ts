import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "doctor" | "patient";
      isProfileComplete: boolean;
      profilePhoto?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: "doctor" | "patient";
    isProfileComplete: boolean;
    profilePhoto?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "doctor" | "patient";
    isProfileComplete: boolean;
    profilePhoto?: string;
  }
}
