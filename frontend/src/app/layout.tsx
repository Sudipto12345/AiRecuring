import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";

import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIRecruit — Intelligent Hiring",
  description: "AI-powered recruiting platform: CV ranking, screening, interviews and proctoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased font-body`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
