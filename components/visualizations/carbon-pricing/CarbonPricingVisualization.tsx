"use client"

import { useState, useEffect } from "react"
import BaseVisualization from "../shared/BaseVisualization"
import { CARBON_PRICING_AGENT_TYPES, CarbonPricingFrameData } from "./CarbonPricingTypes"
import { loadCarbonPricingData, runCarbonPricingSimulation } from "./CarbonPricingData"

interface CarbonPricingVisualizationProps {
    title?: string
    width?: number
    height?: number
}

export default function CarbonPricingVisualization({
    title = "Netherlands Carbon Pricing Agent Model",
    width = 600,
    height = 600
}: CarbonPricingVisualizationProps) {
    const [data, setData] = useState<CarbonPricingFrameData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const simulationData = await loadCarbonPricingData()
            setData(simulationData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSimulationRun = async () => {
        try {
            await runCarbonPricingSimulation()
            await loadData()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation failed')
            throw err
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading simulation data...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-2">
                <div className="text-destructive">Error: {error}</div>
                <button 
                    onClick={loadData}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        )
    }

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
            agentTypes={CARBON_PRICING_AGENT_TYPES}
            title={title}
            width={width}
            height={height}
            onSimulationRun={handleSimulationRun}
            showAdoptionRate={true}
            enableColorClustering={true}
            customPhysicsConfig={{
                gravityStrength: 0.04,
                collisionStrength: 0.8,
                alpha: 0.15
            }}
        />
    )
}