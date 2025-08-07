"use client"

import { useState, useEffect } from "react"
import { Search, Command, ArrowRight, Hash, User, FileText, Settings, Zap } from "lucide-react"

interface CommandItem {
    id: string
    title: string
    subtitle?: string
    icon: React.ReactNode
    type: "Application" | "Command" | "File"
    category: "Suggestions" | "Commands" | "Recent"
}

const mockCommands: CommandItem[] = [
    {
        id: "1",
        title: "Policy Simulator",
        subtitle: "Explore Policy",
        icon: <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs">P</div>,
        type: "Application",
        category: "Suggestions"
    },
    {
        id: "2",
        title: "Agent-Based Models",
        subtitle: "Research Tools",
        icon: <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">A</div>,
        type: "Application",
        category: "Suggestions"
    },
    {
        id: "3",
        title: "Decision Engines",
        subtitle: "Complex Systems",
        icon: <div className="w-4 h-4 bg-indigo-500 rounded-sm flex items-center justify-center text-white text-xs">D</div>,
        type: "Command",
        category: "Suggestions"
    },
    {
        id: "4",
        title: "Causal Inference",
        subtitle: "Policy Design",
        icon: <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs">C</div>,
        type: "Application",
        category: "Suggestions"
    },
    {
        id: "5",
        title: "Generate Policy Brief",
        subtitle: "AI Assistant",
        icon: <Zap className="w-4 h-4 text-green-600" />,
        type: "Command",
        category: "Commands"
    },
    {
        id: "6",
        title: "Scenario Analysis",
        subtitle: "Simulation",
        icon: <Hash className="w-4 h-4 text-orange-600" />,
        type: "Command",
        category: "Commands"
    },
    {
        id: "7",
        title: "Export Results",
        subtitle: "Data Export",
        icon: <FileText className="w-4 h-4 text-blue-600" />,
        type: "Command",
        category: "Commands"
    }
]

export function RaycastCommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [filteredCommands, setFilteredCommands] = useState(mockCommands)

    useEffect(() => {
        if (searchQuery) {
            const filtered = mockCommands.filter(cmd =>
                cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredCommands(filtered)
        } else {
            setFilteredCommands(mockCommands)
        }
        setSelectedIndex(0)
    }, [searchQuery])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setSelectedIndex(prev => Math.max(prev - 1, 0))
                    break
                case "Enter":
                    e.preventDefault()
                    // Handle command execution
                    console.log("Execute:", filteredCommands[selectedIndex])
                    onClose()
                    break
                case "Escape":
                    e.preventDefault()
                    onClose()
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, selectedIndex, filteredCommands, onClose])

    if (!isOpen) return null

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = []
        acc[cmd.category].push(cmd)
        return acc
    }, {} as Record<string, CommandItem[]>)

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Command Palette */}
            <div className="relative w-full max-w-2xl">
                {/* Glassmorphism Container */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search Header */}
                    <div className="flex items-center px-6 py-4 border-b border-white/10 dark:border-gray-700/30">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Search for apps and commands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none text-lg"
                            autoFocus
                        />
                        <div className="flex items-center space-x-2 ml-4">
                            <kbd className="px-2 py-1 text-xs bg-white/20 dark:bg-gray-700/30 rounded border border-white/20 dark:border-gray-600/30">
                                Ask AI
                            </kbd>
                            <kbd className="px-2 py-1 text-xs bg-white/20 dark:bg-gray-700/30 rounded border border-white/20 dark:border-gray-600/30">
                                Tab
                            </kbd>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {Object.entries(groupedCommands).map(([category, commands]) => (
                            <div key={category}>
                                {/* Category Header */}
                                <div className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white/30 dark:bg-gray-800/30">
                                    {category}
                                </div>

                                {/* Command Items */}
                                {commands.map((command, index) => {
                                    const globalIndex = filteredCommands.indexOf(command)
                                    const isSelected = globalIndex === selectedIndex

                                    return (
                                        <div
                                            key={command.id}
                                            className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-150 ${isSelected
                                                    ? 'bg-blue-500/20 dark:bg-blue-400/20 border-l-2 border-blue-500'
                                                    : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
                                                }`}
                                            onClick={() => {
                                                console.log("Execute:", command)
                                                onClose()
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {command.icon}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {command.title}
                                                    </div>
                                                    {command.subtitle && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {command.subtitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/20 dark:bg-gray-700/30 px-2 py-1 rounded">
                                                    {command.type}
                                                </span>
                                                {isSelected && (
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 dark:border-gray-700/30 bg-white/20 dark:bg-gray-800/20">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                                <kbd className="px-1.5 py-0.5 text-xs bg-white/30 dark:bg-gray-700/30 rounded">↵</kbd>
                                <span>Open Command</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <kbd className="px-1.5 py-0.5 text-xs bg-white/30 dark:bg-gray-700/30 rounded">↑↓</kbd>
                                <span>Navigate</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Actions</span>
                            <kbd className="px-1.5 py-0.5 text-xs bg-white/30 dark:bg-gray-700/30 rounded">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-xs bg-white/30 dark:bg-gray-700/30 rounded">K</kbd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Hook to trigger the command palette
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return {
        isOpen,
        openCommandPalette: () => setIsOpen(true),
        closeCommandPalette: () => setIsOpen(false)
    }
}