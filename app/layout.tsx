import type React from "react"
import "./globals.css"
import { Inter, Outfit, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ['400', '500', '600', '700'],
})

const interMedium = Outfit({
  subsets: ["latin"],
  variable: "--font-inter-medium",
  display: "swap",
  weight: ['400'],
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: "Aftershock",
  description: "Turn complexity into clarity - Interactive policy simulation and analysis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${interMedium.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-inter font-medium" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
