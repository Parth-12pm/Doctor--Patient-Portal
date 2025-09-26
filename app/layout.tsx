import type React from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Doctor Patient Portal",
  description:
    "A comprehensive portal for doctors and patients to manage appointments",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
            </AuthProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
