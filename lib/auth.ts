import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          let profilePhoto: string | undefined = undefined;
          if (user.isProfileComplete) {
            if (user.role === "doctor") {
              const doctor = (await Doctor.findOne({
                userId: user._id,
              }).lean()) as { profilePhoto?: string } | null;
              if (doctor?.profilePhoto) {
                profilePhoto = doctor.profilePhoto;
              }
            } else if (user.role === "patient") {
              const patient = (await Patient.findOne({
                userId: user._id,
              }).lean()) as { profilePhoto?: string } | null;
              if (patient?.profilePhoto) {
                profilePhoto = patient.profilePhoto;
              }
            }
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            isProfileComplete: user.isProfileComplete,
            profilePhoto: profilePhoto,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isProfileComplete = user.isProfileComplete;
        token.profilePhoto = user.profilePhoto;
      }

      // Handle session updates
      if (trigger === "update" && session?.user) {
        // Update token with new session data
        token.isProfileComplete =
          session.user.isProfileComplete ?? token.isProfileComplete;
        token.profilePhoto = session.user.profilePhoto ?? token.profilePhoto;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        token.isProfileComplete =
          (session.user as any).isProfileComplete ?? token.isProfileComplete;
        token.profilePhoto =
          (session.user as any).profilePhoto ?? token.profilePhoto;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log("New user signed in:", user.email);
      }
    },
    async signOut() {
      console.log("User signed out");
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export { authOptions };
