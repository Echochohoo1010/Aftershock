import type React from "react"
import "./globals.css"
import { Inter_Tight, Noticia_Text, Figtree, Noto_Serif } from "next/font/google"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const noticaText = Noticia_Text({
  subsets: ["latin"],
  variable: "--font-notica",
  display: "swap",
  weight: ['400', '700'], // optional weights
})

export const metadata = {
  title: "Exploratory Policy",
  description: "Developing causal AI tools for policy formulation and analysis",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${noticaText.variable}`}>
      <body className="font-body">
        <ThemeProvider attribute="class" defaultTheme="light">
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
