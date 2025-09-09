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
            setLoading(true)
            setError(null)
            await runCarbonPricingSimulation()
            
            // Wait a bit for the file to be written, then reload data
            setTimeout(async () => {
                await loadData()
            }, 1000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation failed')
            setLoading(false)
            throw err
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-lg font-semibold">{title}</div>
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <div className="text-muted-foreground">
                            {data.length === 0 ? 'Running Netherlands simulation...' : 'Loading simulation data...'}
                        </div>
                    </div>
                    {data.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center max-w-md">
                            This will take about 30 seconds to simulate 15 years of agent behavior with 100 agents.
                        </div>
                    )}
                </div>
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

    if (!data.length && !loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-lg font-semibold">{title}</div>
                    <div className="text-muted-foreground text-center">
                        No simulation data available. Click start to run the Netherlands carbon pricing simulation.
                    </div>
                    <button
                        onClick={handleSimulationRun}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
                        disabled={loading}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Simulation
                    </button>
                </div>
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