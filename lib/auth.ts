import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          let profilePhoto: string | undefined = undefined;
          if (user.isProfileComplete) {
            if (user.role === "doctor") {
              const doctor = (await Doctor.findOne({
                userId: user._id,
              }).lean()) as { profilePhoto?: string } | null;
              if (doctor) {
                profilePhoto = doctor.profilePhoto;
              }
            } else if (user.role === "patient") {
              const patient = (await Patient.findOne({
                userId: user._id,
              }).lean()) as { profilePhoto?: string } | null;
              if (patient) {
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
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isProfileComplete = user.isProfileComplete;
        token.profilePhoto = user.profilePhoto;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isProfileComplete = token.isProfileComplete;
        session.user.profilePhoto = token.profilePhoto;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // This event can be used to update the session if the profile photo changes
      // For now, we'll just log it. A more advanced implementation could
      // re-fetch the profile photo here.
      if (user) {
        // console.log("User signed in:", user.email);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
