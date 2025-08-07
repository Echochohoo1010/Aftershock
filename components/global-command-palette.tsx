"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Command, ArrowRight, Hash, User, FileText, Settings, Zap, Home, BookOpen, Users, Mail, Lightbulb } from "lucide-react"

interface CommandItem {
    id: string
    title: string
    subtitle?: string
    icon: React.ReactNode
    type: "Application" | "Command" | "File" | "Navigation"
    category: "Navigation" | "Tools" | "Commands" | "Recent"
    action?: () => void
    href?: string
}

export function GlobalCommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [filteredCommands, setFilteredCommands] = useState<CommandItem[]>([])
    const router = useRouter()

    const commands: CommandItem[] = [
        // Navigation Commands
        {
            id: "nav-home",
            title: "Home",
            subtitle: "Go to homepage",
            icon: <Home className="w-4 h-4 text-indigo-600" />,
            type: "Navigation",
            category: "Navigation",
            href: "/"
        },
        {
            id: "nav-explore",
            title: "Explore",
            subtitle: "Policy exploration tools",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">E</div>,
            type: "Navigation",
            category: "Navigation",
            href: "/explore"
        },
        {
            id: "nav-story",
            title: "Story",
            subtitle: "Policy narratives",
            icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
            type: "Navigation",
            category: "Navigation",
            href: "/story"
        },
        {
            id: "nav-blog",
            title: "Blog",
            subtitle: "Research insights",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">B</div>,
            type: "Navigation",
            category: "Navigation",
            href: "/blog"
        },
        {
            id: "nav-research",
            title: "Research",
            subtitle: "Academic work",
            icon: <Lightbulb className="w-4 h-4 text-indigo-600" />,
            type: "Navigation",
            category: "Navigation",
            href: "/research"
        },
        {
            id: "nav-team",
            title: "Team",
            subtitle: "Meet the team",
            icon: <Users className="w-4 h-4 text-indigo-600" />,
            type: "Navigation",
            category: "Navigation",
            href: "/team"
        },
        {
            id: "nav-contact",
            title: "Contact",
            subtitle: "Get in touch",
            icon: <Mail className="w-4 h-4 text-indigo-600" />,
            type: "Navigation",
            category: "Navigation",
            href: "/contact"
        },

        // Policy Tools
        {
            id: "tool-simulator",
            title: "Policy Simulator",
            subtitle: "Agent-based policy modeling",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>,
            type: "Application",
            category: "Tools",
            href: "/explore"
        },
        {
            id: "tool-decision-engines",
            title: "Decision Engines",
            subtitle: "Complex systems analysis",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">D</div>,
            type: "Application",
            category: "Tools",
            href: "/blog/agent-based-climate-policy"
        },
        {
            id: "tool-causal-inference",
            title: "Causal Inference",
            subtitle: "Policy design methodology",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">C</div>,
            type: "Application",
            category: "Tools",
            href: "/blog/causal-inference-policy-design"
        },
        {
            id: "tool-ai-governance",
            title: "AI Governance",
            subtitle: "Framework evaluation",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-violet-600 to-purple-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">A</div>,
            type: "Application",
            category: "Tools",
            href: "/blog/ai-governance-frameworks"
        },

        // Commands
        {
            id: "cmd-policy-brief",
            title: "Generate Policy Brief",
            subtitle: "AI-powered analysis",
            icon: <Zap className="w-4 h-4 text-indigo-600" />,
            type: "Command",
            category: "Commands",
            action: () => alert("Policy Brief Generator - Coming Soon!")
        },
        {
            id: "cmd-scenario",
            title: "Scenario Analysis",
            subtitle: "Run simulations",
            icon: <Hash className="w-4 h-4 text-purple-600" />,
            type: "Command",
            category: "Commands",
            action: () => alert("Scenario Analysis - Coming Soon!")
        },
        {
            id: "cmd-export",
            title: "Export Results",
            subtitle: "Download data",
            icon: <FileText className="w-4 h-4 text-blue-600" />,
            type: "Command",
            category: "Commands",
            action: () => alert("Export functionality - Coming Soon!")
        },
        {
            id: "cmd-theme",
            title: "Toggle Theme",
            subtitle: "Switch between light and dark mode",
            icon: <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs">🌓</div>,
            type: "Command",
            category: "Commands",
            action: () => {
                const isDark = document.documentElement.classList.contains('dark')
                document.documentElement.classList.toggle('dark')
                localStorage.setItem('theme', isDark ? 'light' : 'dark')
            }
        }
    ]

    useEffect(() => {
        if (searchQuery) {
            const filtered = commands.filter(cmd =>
                cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cmd.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredCommands(filtered)
        } else {
            setFilteredCommands(commands)
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
                    executeCommand(filteredCommands[selectedIndex])
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

    const executeCommand = (command: CommandItem) => {
        if (command.href) {
            router.push(command.href)
        } else if (command.action) {
            command.action()
        }
        onClose()
    }

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
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/40 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search Header */}
                    <div className="flex items-center px-6 py-4 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
                        <Search className="w-5 h-5 text-indigo-500 mr-3" />
                        <input
                            type="text"
                            placeholder="Search for apps and commands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-indigo-400/70 dark:placeholder-indigo-300/50 outline-none text-lg"
                            autoFocus
                        />
                        <div className="flex items-center space-x-2 ml-4">
                            <kbd className="px-2 py-1 text-xs bg-indigo-100/60 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200/50 dark:border-indigo-600/30">
                                Ask AI
                            </kbd>
                            <kbd className="px-2 py-1 text-xs bg-indigo-100/60 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200/50 dark:border-indigo-600/30">
                                Tab
                            </kbd>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {Object.entries(groupedCommands).map(([category, commands]) => (
                            <div key={category}>
                                {/* Category Header */}
                                <div className="px-6 py-3 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30 border-b border-indigo-100/50 dark:border-indigo-800/30">
                                    {category}
                                </div>

                                {/* Command Items */}
                                {commands.map((command, index) => {
                                    const globalIndex = filteredCommands.indexOf(command)
                                    const isSelected = globalIndex === selectedIndex

                                    return (
                                        <div
                                            key={command.id}
                                            className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 ${isSelected
                                                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/20 dark:to-purple-400/20 border-l-2 border-indigo-500 backdrop-blur-sm'
                                                    : 'hover:bg-white/40 dark:hover:bg-gray-700/30'
                                                }`}
                                            onClick={() => executeCommand(command)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {command.icon}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {command.title}
                                                    </div>
                                                    {command.subtitle && (
                                                        <div className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                                                            {command.subtitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70 bg-indigo-100/60 dark:bg-indigo-800/40 px-2 py-1 rounded-full">
                                                    {command.type}
                                                </span>
                                                {isSelected && (
                                                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-3 border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
                        <div className="flex items-center space-x-4 text-sm text-indigo-600/80 dark:text-indigo-400/80">
                            <div className="flex items-center space-x-1">
                                <kbd className="px-1.5 py-0.5 text-xs bg-indigo-100/60 dark:bg-indigo-800/40 rounded">↵</kbd>
                                <span>Execute</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <kbd className="px-1.5 py-0.5 text-xs bg-indigo-100/60 dark:bg-indigo-800/40 rounded">↑↓</kbd>
                                <span>Navigate</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-indigo-600/80 dark:text-indigo-400/80">
                            <span>Quick Actions</span>
                            <kbd className="px-1.5 py-0.5 text-xs bg-indigo-100/60 dark:bg-indigo-800/40 rounded">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-xs bg-indigo-100/60 dark:bg-indigo-800/40 rounded">K</kbd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Global hook for command palette
export function useGlobalCommandPalette() {
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