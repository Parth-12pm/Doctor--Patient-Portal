// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
// Make sure to import your authOptions from the correct path
import { authOptions } from "@/lib/auth"; // Adjust this path if needed

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };