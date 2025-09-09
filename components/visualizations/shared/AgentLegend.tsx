"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    return (
        <Card className="p-3">
            <h3 className="text-sm font-semibold mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {Object.entries(agentTypes).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-1">
                        <div
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: config.color }}
                        />
                        <Badge variant="outline" className="text-xs px-1 py-0">
                            {config.displayName}
                        </Badge>
                    </div>
                ))}
            </div>
        </Card>
    )
}