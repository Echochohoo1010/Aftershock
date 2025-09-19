import type React from "react"
import "./globals.css"
import {  Figtree, IBM_Plex_Sans, IBM_Plex_Sans_Condensed, Inter, Inter_Tight, Lato, Source_Sans_3, Source_Serif_4 } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"

const inter = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ['400', '700'],
})

const noticiaText = Lato({
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
      <body className="font-body" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>

          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
