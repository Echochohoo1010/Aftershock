"use client"

import { useMemo } from "react"
import BaseVisualization from "../shared/BaseVisualization"
import { GenericFrameData, createAgentTypesFromData } from "./GenericTypes"

interface GenericVisualizationProps {
    data: GenericFrameData[]
    title?: string
    width?: number
    height?: number
    showAdoptionRate?: boolean
    enableColorClustering?: boolean
    onSimulationRun?: () => Promise<void>
}

export default function GenericVisualization({
    data,
    title = "Agent-Based Simulation",
    width = 600,
    height = 600,
    showAdoptionRate = false,
    enableColorClustering = false,
    onSimulationRun
}: GenericVisualizationProps) {
    const agentTypes = useMemo(() => createAgentTypesFromData(data), [data])

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No simulation data available</div>
            </div>
        )
    }

    return (
        <BaseVisualization
            data={data}
            agentTypes={agentTypes}
            title={title}
            width={width}
            height={height}
            onSimulationRun={onSimulationRun}
            showAdoptionRate={showAdoptionRate}
            enableColorClustering={enableColorClustering}
            customPhysicsConfig={{
                gravityStrength: 0.03,
                collisionStrength: 0.6,
                alpha: 0.1
            }}
        />
    )
}