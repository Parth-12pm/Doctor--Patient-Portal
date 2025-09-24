export { signIn, signOut } from "next-auth/react"
export { useSession } from "next-auth/react"
export { getSession } from "next-auth/react"

// Custom signUp function since NextAuth doesn't have built-in registration
export const signUp = async (email: string, password: string, role: string) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Registration failed")
  }

  return response.json()
}
