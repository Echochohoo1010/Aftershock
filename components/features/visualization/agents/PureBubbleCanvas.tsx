"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import * as d3 from "d3"
import { PhysicsEngine } from "../simulation/PhysicsEngine"
import { SimulationNode, PhysicsConfig } from "@/components/shared/types/simulation.types"

import { AGENT_TYPES, mapVehicleType, getEmissionLevel } from "@/components/shared/constants/agentTypes"

const rScale = d3.scaleLinear().domain([1, 4]).range([8, 18]) // Size based on emission level

interface PureBubbleCanvasProps {
    width: number
    height: number
    currentFrame?: number
    onFrameUpdate?: (frame: number) => void
}

export default function PureBubbleCanvas({ width, height, currentFrame = 0, onFrameUpdate }: PureBubbleCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const physicsEngineRef = useRef<PhysicsEngine | null>(null)
    const nodesRef = useRef<SimulationNode[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [frames, setFrames] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

    const margin = 40
    const radius = Math.min(width, height) / 2 - margin
    const centerX = width / 2
    const centerY = height / 2 - 40 // Move center 40px up (approximately 1cm on most screens)

    const physicsConfig: PhysicsConfig = useMemo(() => ({
        width,
        height,
        centerX,
        centerY,
        radius,
        collisionPadding: 2.0,
        collisionStrength: 0.9,
        gravityStrength: 0.06,
        alpha: 0.2,
        alphaDecay: 0.01,
        velocityDecay: 0.5
    }), [width, height, centerX, centerY, radius])

    // Initialize audio on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/bubble-change.mp3')
            audioRef.current.volume = 0.3 // Set moderate volume
        }
    }, [])

    // Load simulation data on component mount
    useEffect(() => {
        async function loadSimulationData() {
            setLoading(true)
            try {
                console.log('Loading simulation data from JSON...')
                const response = await fetch('/simulation_data.json')
                
                if (response.ok) {
                    const result = await response.json()
                    
                    // Handle both wrapped format {success: true, frames: [...]} and direct array format [...]
                    if (Array.isArray(result)) {
                        console.log('Loaded simulation data:', result.length, 'frames')
                        setFrames(result)
                        setCurrentFrameIndex(0)
                    } else if (result.success && result.frames) {
                        console.log('Loaded simulation data:', result.frames.length, 'frames,', result.agents.length, 'agents')
                        setFrames(result.frames)
                        setCurrentFrameIndex(0)
                    } else {
                        console.warn('Invalid simulation data format, using fallback')
                        setFrames([])
                    }
                } else {
                    console.warn('No simulation data file found')
                    setFrames([])
                }
            } catch (error) {
                console.error('Failed to load simulation data:', error)
                setFrames([])
            } finally {
                setLoading(false)
            }
        }

        loadSimulationData()
    }, [])

    // Generate initial nodes ONLY once when frames are loaded
    const generateInitialNodes = useCallback(() => {
        if (!frames.length) return []
        
        // Use first frame to determine agents
        const frameData = frames[0]
        if (!frameData?.agents) return []

        // Create type-specific cluster centers (emission level grouping)
        const typePositions = {
            "Cycling/Walking": { x: centerX - radius * 0.6, y: centerY - radius * 0.6 },
            "BEV-M": { x: centerX - radius * 0.3, y: centerY - radius * 0.6 },
            "HEV-S": { x: centerX + radius * 0.3, y: centerY - radius * 0.3 },
            "ICE-S": { x: centerX + radius * 0.6, y: centerY + radius * 0.3 },
            "DIE-M": { x: centerX + radius * 0.3, y: centerY + radius * 0.6 },
            "ICE-M": { x: centerX - radius * 0.3, y: centerY + radius * 0.6 }
        }

        const nodes: SimulationNode[] = frameData.agents.map((agent: any) => {
            const vehicleType = mapVehicleType(agent.type)
            const typePos = typePositions[vehicleType as keyof typeof typePositions] || { x: centerX, y: centerY }
            const emissionLevel = getEmissionLevel(vehicleType, agent.emissionLevel)
            const nodeRadius = rScale(emissionLevel)
            
            return {
                id: agent.id,
                x: typePos.x + (Math.random() - 0.5) * 60,
                y: typePos.y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                r: nodeRadius,
                targetR: nodeRadius,
                fill: AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]?.color || AGENT_TYPES["Cycling/Walking"].color,
                type: vehicleType
            }
        })

        return nodes
    }, [frames.length, centerX, centerY, radius]) // Only depends on frames.length, not currentFrame

    const initializeVisualization = useCallback(() => {
        if (!svgRef.current || loading || !frames.length) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const nodes = generateInitialNodes()
        if (!nodes.length) return
        
        nodesRef.current = nodes

        // Create container with boundary circle
        const container = svg
            .append("g")
            .attr("class", "visualization-container")

        // Optional: Add boundary circle (invisible, just for reference)
        container
            .append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", "transparent")
            .attr("stroke-width", 1)

        // Initialize PhysicsEngine
        physicsEngineRef.current = new PhysicsEngine(physicsConfig)
        const simulation = physicsEngineRef.current.createSimulation(nodes)

        // Add color clustering for better visual organization
        physicsEngineRef.current.addColorClusterForce(nodes)

        // Create circles
        const circles = container
            .selectAll<SVGCircleElement, SimulationNode>("circle.agent")
            .data(nodes, (d) => d.id.toString())
            .enter()
            .append("circle")
            .attr("class", "agent")
            .attr("r", (d) => d.r)
            .attr("fill", (d) => d.fill)
            .attr("opacity", 0.85)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)

        // Add boundary constraints and update positions
        physicsEngineRef.current.addBoundaryConstraint((updatedNodes) => {
            circles
                .attr("cx", (d) => d.x || 0)
                .attr("cy", (d) => d.y || 0)
        })

        // Removed periodic movement - agents should stay stable and only animate size/color changes

    }, [generateInitialNodes, loading, frames.length])

    useEffect(() => {
        initializeVisualization()

        return () => {
            if (physicsEngineRef.current) {
                physicsEngineRef.current.stop()
            }
        }
    }, [initializeVisualization])

    // Update frame function for animation
    const updateFrame = useCallback((frameIndex: number) => {
        if (!frames[frameIndex] || !physicsEngineRef.current) return

        const frame = frames[frameIndex]
        const svg = d3.select(svgRef.current)
        const circles = svg.selectAll("circle.agent")
        let hasSizeChanges = false

        circles.each(function (d: any) {
            const agent = frame.agents.find((a: any) => a.id === d.id)
            if (!agent) return

            const vehicleType = mapVehicleType(agent.type)
            const agentConfig = AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]
            
            if (!agentConfig) return

            const emissionLevel = getEmissionLevel(vehicleType, agent.emissionLevel)
            const targetR = rScale(emissionLevel)
            const targetFill = agentConfig.color

            // Check if size changed
            if (Math.abs((d.r || 0) - targetR) > 0.5) {
                hasSizeChanges = true
            }

            d.targetR = targetR
            d.type = vehicleType

            const circle = d3.select(this)
            circle.interrupt()
            
            // Animate both visual and physics radius together
            circle.transition()
                .duration(400)  // 0.4 seconds as requested
                .ease(d3.easeCubicOut)
                .attr("r", targetR)
                .attr("fill", targetFill)
                .tween("physics", function() {
                    const currentR = d.r || targetR
                    const interpolateR = d3.interpolate(currentR, targetR)
                    return function(t) {
                        d.r = interpolateR(t)
                    }
                })
                .on("end", () => {
                    d.r = targetR
                    d.fill = targetFill
                })
        })

        // Play sound if any bubble changed size
        if (hasSizeChanges && audioRef.current) {
            try {
                audioRef.current.currentTime = 0 // Reset to start
                audioRef.current.play().catch(e => {
                    console.log('Audio play failed (user interaction required):', e)
                })
            } catch (error) {
                console.log('Audio play error:', error)
            }
        }

        // Update collision boundaries and restart physics simulation
        if (physicsEngineRef.current) {
            physicsEngineRef.current.updateCollisionBoundaries()
            physicsEngineRef.current.restart()
        }

        setCurrentFrameIndex(frameIndex)
        onFrameUpdate?.(frameIndex)
    }, [frames, onFrameUpdate])

    // Update frame when currentFrame prop changes
    useEffect(() => {
        if (currentFrame !== currentFrameIndex && frames.length > 0) {
            updateFrame(currentFrame)
        }
    }, [currentFrame, currentFrameIndex, frames.length, updateFrame])

    // Handle window resize - reinitialize if needed
    useEffect(() => {
        const handleResize = () => {
            if (physicsEngineRef.current) {
                // Restart simulation with current physics config
                physicsEngineRef.current.restart()
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [physicsConfig])

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            </div>
        )
    }

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            className="w-full h-full"
            style={{ background: 'white' }}
        />
    )
}