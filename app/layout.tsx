import type React from "react"
import "./globals.css"
import { IBM_Plex_Sans, IBM_Plex_Serif, Inter, Noticia_Text } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const noticiaText = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-noticia",
  display: "swap",
  weight: ['400', '700'],
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
    <html lang="en" className={`${inter.variable} ${noticiaText.variable}`} suppressHydrationWarning>
      <body className="font-body">
        <ThemeProvider attribute="class" >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
