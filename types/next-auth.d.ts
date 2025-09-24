declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      isProfileComplete: boolean
    }
  }

  interface User {
    role: string
    isProfileComplete: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    isProfileComplete: boolean
  }
}
