"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff } from "lucide-react"

export interface AgentType {
    color: string
    emissionLevel?: number
    displayName: string
}

interface AgentLegendProps {
    agentTypes: Record<string, AgentType>
    title?: string
}

export default function AgentLegend({
    agentTypes,
    title = "Agent Types"
}: AgentLegendProps) {
    const [isVisible, setIsVisible] = useState(true)

    const agentEntries = Object.entries(agentTypes)
    const halfLength = Math.ceil(agentEntries.length / 2)
    const firstRow = agentEntries.slice(0, halfLength)
    const secondRow = agentEntries.slice(halfLength)

    return (
        <Card className="p-2.5 w-fit">
            <div className="flex items-center justify-between gap-4 mb-1.5">
                <h3 className="text-xs font-semibold">{title}</h3>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label={isVisible ? "Hide legend" : "Show legend"}
                >
                    {isVisible ? (
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                    ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-600" />
                    )}
                </button>
            </div>
            {isVisible && (
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {firstRow.map(([type, config]) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-border flex-shrink-0"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span className="text-xs whitespace-nowrap">
                                    {config.displayName}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {secondRow.map(([type, config]) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div
                                    className="w-2.5 h-2.5 rounded-full border border-border flex-shrink-0"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span className="text-xs whitespace-nowrap">
                                    {config.displayName}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    )
}