"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed w-full glass z-50 border-b border-white/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-12 w-12 border-2 border-foreground rounded-2xl  flex items-center justify-center  font-medium text-lg">
              E
            </Link>
            <Link href="/" className="text-xl  font-semibold  ">
              Exploratory Policy
            </Link>
          </div>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            <Link href="/explore" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200 font-medium">
              Explore
            </Link>
            <Link href="/story" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200 font-medium">
              Story
            </Link>
            <Link href="/about" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200">
              About
            </Link>
            <Link href="/research" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200">
              Research
            </Link>
            <Link href="/blog" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200">
              Blog
            </Link>
            <Link href="/team" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200">
              Team
            </Link>
            <Link href="/contact" className="glass-button text-foreground/70 hover:text-primary transition-all duration-200">
              Contact
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 dark:border-white/05">
          <div className="px-4 py-6 space-y-3">
            <Link href="/explore" className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200 font-medium" onClick={toggleMenu}>
              Explore
            </Link>
            <Link href="/story" className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200 font-medium" onClick={toggleMenu}>
              Story
            </Link>
            <Link href="/about" className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200" onClick={toggleMenu}>
              About
            </Link>
            <Link
              href="/research"
              className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200"
              onClick={toggleMenu}
            >
              Research
            </Link>
            <Link href="/blog" className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200" onClick={toggleMenu}>
              Blog
            </Link>
            <Link href="/team" className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200" onClick={toggleMenu}>
              Team
            </Link>
            <Link
              href="/contact"
              className="block glass-button text-left text-foreground/70 hover:text-primary transition-all duration-200"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-white/10 dark:border-white/05">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
