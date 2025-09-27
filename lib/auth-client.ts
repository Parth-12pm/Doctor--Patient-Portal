import { signIn, signOut, useSession, getSession } from "next-auth/react";

// Enhanced signUp function with better error handling
export const signUp = async (email: string, password: string, role: string) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Registration failed");
  }
};

// Helper function to handle authentication
export const authenticateUser = async (email: string, password: string) => {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("Invalid credentials");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Authentication failed");
  }
};

// Export signIn, signOut, useSession, getSession for use in components
export { signIn, signOut, useSession, getSession };
