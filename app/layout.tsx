import type React from "react"
import "./globals.css"
import { Inter, Urbanist, Switzer, Outfit } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"

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

export const metadata = {
  title: "Exploratory Policy",
  description: "Developing causal AI tools for policy formulation and analysis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${interMedium.variable}`} suppressHydrationWarning>
      <body className="font-inter font-medium" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
