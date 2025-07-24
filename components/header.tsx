"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-inline gap-2">
            <p className="rounded-full p-1 w-8 h-8 text-white text-center mx-auto">E</p>
            <Link href="/" className="text-xl font-heading font-semibold">
              Exploratory Policy
            </Link>
          </div>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-gray-600 hover:text-black transition-colors font-medium">
              Explore
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-black transition-colors">
              About
            </Link>
            <Link href="/research" className="text-gray-600 hover:text-black transition-colors">
              Research
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-black transition-colors">
              Blog
            </Link>
            <Link href="/team" className="text-gray-600 hover:text-black transition-colors">
              Team
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-black transition-colors">
              Contact
            </Link>
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-6 space-y-4">
            <Link href="/explore" className="block text-gray-600 hover:text-black transition-colors font-medium" onClick={toggleMenu}>
              Explore
            </Link>
            <Link href="/about" className="block text-gray-600 hover:text-black transition-colors" onClick={toggleMenu}>
              About
            </Link>
            <Link
              href="/research"
              className="block text-gray-600 hover:text-black transition-colors"
              onClick={toggleMenu}
            >
              Research
            </Link>
            <Link href="/blog" className="block text-gray-600 hover:text-black transition-colors" onClick={toggleMenu}>
              Blog
            </Link>
            <Link href="/team" className="block text-gray-600 hover:text-black transition-colors" onClick={toggleMenu}>
              Team
            </Link>
            <Link
              href="/contact"
              className="block text-gray-600 hover:text-black transition-colors"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
