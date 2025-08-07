"use client"

import { RaycastCommandPalette, useCommandPalette } from "@/components/raycast-command-palette"
import { UIDemo } from "@/components/ui-demo"
import { Button } from "@/components/ui/button"

export default function RaycastDemo() {
    const { isOpen, openCommandPalette, closeCommandPalette } = useCommandPalette()

    return (
        <div className="min-h-screen  relative overflow-hidden">
            {/* Background Pattern */}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                        Raycast-Style UI
                    </h1>
                    <p className="text-xl text-purple-200 mb-8 max-w-2xl">
                        Experience the beautiful glassmorphism command palette interface inspired by Raycast.
                        Clean, fast, and intuitive.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={openCommandPalette}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-xl transition-all duration-200"
                        >
                            Open Command Palette
                        </Button>

                        <div className="flex items-center space-x-2 text-purple-200">
                            <span>or press</span>
                            <kbd className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white font-bold">⚡</span>
                        </div>
                        <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
                        <p className="text-purple-200 text-sm">
                            Instant search and navigation through your policy tools and commands
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white font-bold">🎨</span>
                        </div>
                        <h3 className="text-white font-semibold mb-2">Beautiful Design</h3>
                        <p className="text-purple-200 text-sm">
                            Glassmorphism UI with smooth animations and modern aesthetics
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white font-bold">🧠</span>
                        </div>
                        <h3 className="text-white font-semibold mb-2">AI Powered</h3>
                        <p className="text-purple-200 text-sm">
                            Intelligent suggestions and AI assistance for policy analysis
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-2xl">
                    <h3 className="text-white font-semibold mb-4 text-center">How to Use</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-purple-200">
                        <div className="flex items-center space-x-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘K</kbd>
                            <span>Open command palette</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">↑↓</kbd>
                            <span>Navigate options</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd>
                            <span>Execute command</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd>
                            <span>Close palette</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Command Palette */}
            <RaycastCommandPalette
                isOpen={isOpen}
                onClose={closeCommandPalette}
            />

            <UIDemo />
        </div>

    )
}