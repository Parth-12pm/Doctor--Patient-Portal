import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      isProfileComplete: boolean;
      profilePhoto?: string;
    };
  }

  interface User {
    role: string;
    isProfileComplete: boolean;
    profilePhoto?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    isProfileComplete: boolean;
    profilePhoto?: string;
  }
}
