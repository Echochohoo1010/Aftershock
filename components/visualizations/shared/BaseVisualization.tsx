"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import * as d3 from "d3"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SimulationControls from "./SimulationControls"
import AgentLegend, { AgentType } from "./AgentLegend" 
import { PhysicsEngine, SimulationNode, PhysicsConfig } from "./PhysicsEngine"

export interface BaseVisualizationData {
    t: string
    agents: Array<{
        id: number
        type: string
        emission_level: number
    }>
    adoptionRate?: number
}

export interface BaseVisualizationProps {
    data: BaseVisualizationData[]
    agentTypes: Record<string, AgentType>
    title: string
    width?: number
    height?: number
    onSimulationRun?: () => Promise<void>
    showAdoptionRate?: boolean
    enableColorClustering?: boolean
    customPhysicsConfig?: Partial<PhysicsConfig>
}

export default function BaseVisualization({
    data,
    agentTypes,
    title,
    width = 600,
    height = 600,
    onSimulationRun,
    showAdoptionRate = false,
    enableColorClustering = true,
    customPhysicsConfig = {}
}: BaseVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [currentFrame, setCurrentFrame] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [runningSimulation, setRunningSimulation] = useState(false)
    const [shouldAutoPlay, setShouldAutoPlay] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const physicsEngineRef = useRef<PhysicsEngine | null>(null)
    const nodesRef = useRef<SimulationNode[]>([])

    const margin = 40
    const radius = Math.min(width, height) / 2 - margin
    const centerX = width / 2
    const centerY = height / 2

    const physicsConfig: PhysicsConfig = {
        width,
        height,
        centerX,
        centerY,
        radius,
        collisionPadding: 1.5,
        collisionStrength: 0.8,
        gravityStrength: 0.04,
        alpha: 0.15,
        alphaDecay: 0.015,
        velocityDecay: 0.6,
        ...customPhysicsConfig
    }

    const initializeVisualization = useCallback(() => {
        if (!svgRef.current || !data.length) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const container = svg
            .append("g")
            .attr("class", "visualization-container")

        container
            .append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", "hsl(var(--border))")
            .attr("stroke-width", 2)
            .attr("opacity", 0.3)

        const initialAgents = data[0]?.agents || []
        
        // Group agents by type for clustered positioning
        const agentsByType = initialAgents.reduce((acc, agent) => {
            if (!acc[agent.type]) acc[agent.type] = []
            acc[agent.type].push(agent)
            return acc
        }, {} as Record<string, typeof initialAgents>)
        
        const typeNames = Object.keys(agentsByType)
        const nodes: SimulationNode[] = []
        
        // Create clustered initial positions
        typeNames.forEach((typeName, typeIndex) => {
            const agents = agentsByType[typeName]
            
            // Calculate cluster center position in a circle around the main center
            const angleStep = (2 * Math.PI) / typeNames.length
            const clusterDistance = Math.min(radius * 0.4, 120) // Distance from main center
            const clusterCenterX = centerX + Math.cos(angleStep * typeIndex) * clusterDistance
            const clusterCenterY = centerY + Math.sin(angleStep * typeIndex) * clusterDistance
            
            // Position agents within their cluster
            agents.forEach((agent, agentIndex) => {
                // Use spiral positioning within the cluster for better distribution
                const spiralRadius = Math.min(60, Math.sqrt(agentIndex) * 8)
                const spiralAngle = agentIndex * 0.5 + typeIndex * 2
                
                const x = clusterCenterX + Math.cos(spiralAngle) * spiralRadius + (Math.random() - 0.5) * 20
                const y = clusterCenterY + Math.sin(spiralAngle) * spiralRadius + (Math.random() - 0.5) * 20
                
                nodes.push({
                    id: agent.id,
                    type: agent.type,
                    fill: agentTypes[agent.type]?.color || "#6b7280",
                    r: getAgentRadius(agent.emission_level),
                    targetR: getAgentRadius(agent.emission_level),
                    x,
                    y,
                    vx: 0,
                    vy: 0
                })
            })
        })

        nodesRef.current = nodes

        physicsEngineRef.current = new PhysicsEngine(physicsConfig)
        const simulation = physicsEngineRef.current.createSimulation(nodes)

        if (enableColorClustering) {
            physicsEngineRef.current.addColorClusterForce(nodes)
        }

        const circles = container
            .selectAll<SVGCircleElement, SimulationNode>("circle.agent")
            .data(nodes, (d) => d.id.toString())
            .enter()
            .append("circle")
            .attr("class", "agent")
            .attr("r", (d) => d.r)
            .attr("fill", (d) => d.fill)
            .attr("opacity", 0.8)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)

        physicsEngineRef.current.addBoundaryConstraint((updatedNodes) => {
            circles
                .attr("cx", (d) => d.x || 0)
                .attr("cy", (d) => d.y || 0)
        })

    }, [data, agentTypes, centerX, centerY, radius, enableColorClustering])

    const updateFrame = useCallback((frameIndex: number) => {
        if (!data[frameIndex] || !svgRef.current) return

        const frameData = data[frameIndex]
        const svg = d3.select(svgRef.current)

        const updatedNodes = frameData.agents.map((agent) => {
            const existingNode = nodesRef.current.find(n => n.id === agent.id)
            return {
                ...existingNode,
                id: agent.id,
                type: agent.type,
                fill: agentTypes[agent.type]?.color || "#6b7280",
                r: getAgentRadius(agent.emission_level),
                targetR: getAgentRadius(agent.emission_level),
                x: existingNode?.x || centerX,
                y: existingNode?.y || centerY,
                vx: existingNode?.vx || 0,
                vy: existingNode?.vy || 0
            } as SimulationNode
        })

        nodesRef.current = updatedNodes

        const circles = svg
            .selectAll<SVGCircleElement, SimulationNode>("circle.agent")
            .data(updatedNodes, (d) => d.id.toString())

        circles
            .transition()
            .duration(200)
            .attr("r", (d) => d.r)
            .attr("fill", (d) => d.fill)

        if (physicsEngineRef.current) {
            const simulation = physicsEngineRef.current.getSimulation()
            if (simulation) {
                simulation.nodes(updatedNodes)
                if (enableColorClustering) {
                    physicsEngineRef.current.addColorClusterForce(updatedNodes)
                }
                physicsEngineRef.current.restart()
            }
        }

        setCurrentFrame(frameIndex)
    }, [data, agentTypes, centerX, centerY, enableColorClustering])

    const getAgentRadius = (emissionLevel: number): number => {
        const baseRadius = 8
        const scaleFactor = 1 + (emissionLevel - 1) * 0.3
        return baseRadius * scaleFactor
    }

    const startAnimation = useCallback(() => {
        setIsPlaying(true)
        intervalRef.current = setInterval(() => {
            setCurrentFrame(prev => {
                const nextFrame = prev + 1
                if (nextFrame >= data.length) {
                    setIsPlaying(false)
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                        intervalRef.current = null
                    }
                    return prev
                }
                return nextFrame
            })
        }, 400)
    }, [data.length])

    const handlePlay = useCallback(async () => {
        // If data already exists, just start animation
        if (data.length > 0) {
            if (!isPlaying) {
                setCurrentFrame(0) // Reset to beginning
                startAnimation()
            }
            return
        }

        // Only run simulation if no data exists
        if (onSimulationRun) {
            setRunningSimulation(true)
            setShouldAutoPlay(true)
            try {
                await onSimulationRun()
            } catch (error) {
                console.error("Simulation failed:", error)
                setShouldAutoPlay(false)
            } finally {
                setRunningSimulation(false)
            }
        }
    }, [data.length, isPlaying, onSimulationRun, startAnimation])

    const handlePause = useCallback(() => {
        setIsPlaying(false)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    const handleReset = useCallback(async () => {
        handlePause()
        setCurrentFrame(0)
        
        if (onSimulationRun) {
            setRunningSimulation(true)
            try {
                await onSimulationRun()
            } catch (error) {
                console.error("Reset simulation failed:", error)
            } finally {
                setRunningSimulation(false)
            }
        }
    }, [handlePause, onSimulationRun])

    const handleScrub = useCallback((frameIndex: number) => {
        handlePause()
        setCurrentFrame(frameIndex)
    }, [handlePause])

    useEffect(() => {
        initializeVisualization()
    }, [initializeVisualization])

    useEffect(() => {
        updateFrame(currentFrame)
    }, [currentFrame, updateFrame])

    // Auto-play effect when data loads and shouldAutoPlay is true
    useEffect(() => {
        if (shouldAutoPlay && data.length > 0 && !runningSimulation) {
            setShouldAutoPlay(false)
            setCurrentFrame(0) // Ensure we start from beginning
            // Small delay to ensure visualization is ready
            const timer = setTimeout(() => {
                startAnimation()
            }, 500)
            
            return () => clearTimeout(timer)
        }
    }, [shouldAutoPlay, data.length, runningSimulation, startAnimation])

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            if (physicsEngineRef.current) {
                physicsEngineRef.current.stop()
            }
        }
    }, [])

    const currentFrameData = data[currentFrame]

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                
                <div className="flex justify-center mb-4">
                    <svg
                        ref={svgRef}
                        width={width}
                        height={height}
                        className="border rounded-lg bg-background"
                    />
                </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <SimulationControls
                    isPlaying={isPlaying}
                    currentFrame={currentFrame}
                    totalFrames={data.length}
                    currentFrameData={{
                        t: currentFrameData?.t || `Frame ${currentFrame + 1}`,
                        adoptionRate: showAdoptionRate ? currentFrameData?.adoptionRate : undefined
                    }}
                    runningSimulation={runningSimulation}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onReset={handleReset}
                    onScrub={handleScrub}
                />

                <AgentLegend
                    agentTypes={agentTypes}
                    title="Agent Types"
                />
            </div>
        </div>
    )
}