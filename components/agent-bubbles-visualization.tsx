"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, MessageCircle, X, Send } from "lucide-react"

// Agent types with colors matching Netherlands visualization - Updated for real simulation data
const AGENT_TYPES = {
    "Cycling/Walking": { color: "#22c55e", emissionLevel: 1 },  // Green - Level 1 (No emission)
    "BEV-M": { color: "#22c55e", emissionLevel: 1 },           // Green - Level 1 (Battery Electric Vehicle)
    "HEV-S": { color: "#84cc16", emissionLevel: 2 },           // Light green - Level 2 (Small Hybrid)
    "ICE-S": { color: "#f59e0b", emissionLevel: 3 },           // Orange - Level 3 (Small Petrol)
    "DIE-M": { color: "#f59e0b", emissionLevel: 3 },           // Orange - Level 3 (Mid Diesel)  
    "ICE-M": { color: "#ef4444", emissionLevel: 4 }            // Red - Level 4 (Mid Petrol)
}

// Map simulation vehicle types to display names (if needed)
const mapVehicleType = (vehicleType: string): string => {
    // Direct mapping - simulation already uses correct format
    const mapping: { [key: string]: string } = {
        "BEV-M": "BEV-M",           // Battery Electric Vehicle - Mid
        "HEV-S": "HEV-S",           // Hybrid Electric Vehicle - Small
        "ICE-S": "ICE-S",           // Internal Combustion Engine - Small
        "ICE-M": "ICE-M",           // Internal Combustion Engine - Mid
        "DIE-M": "DIE-M",           // Diesel - Mid
        "Cycling/Walking": "Cycling/Walking"
    }
    return mapping[vehicleType] || vehicleType
}

// Get emission level directly from AGENT_TYPES or use the provided level
const getEmissionLevel = (vehicleType: string, providedLevel?: number): number => {
    if (providedLevel !== undefined) {
        return providedLevel
    }
    const agentConfig = AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]
    return agentConfig?.emissionLevel || 3
}

const rScale = d3.scaleLinear().domain([1, 4]).range([8, 18]) // Size range based on emission level

// AI-powered agent generation based on policy context
async function generateAIAgents(policyContext: string, numAgents: number = 50) {
    try {
        const response = await fetch('/api/generate-agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                policyContext,
                numAgents,
                agentTypes: Object.keys(AGENT_TYPES)
            })
        })

        if (!response.ok) {
            throw new Error('Failed to generate agents')
        }

        return await response.json()
    } catch (error) {
        console.error('Error generating AI agents:', error)
        // Fallback to default generation
        return generateDefaultAgents(numAgents)
    }
}

// Agent interface
interface Agent {
    id: number
    initialType: string
    adoptionThreshold: number
    influence: number
    resistance: number
    networkConnections: number
    activity: number
    name: string
}

interface SimulationNode extends d3.SimulationNodeDatum {
    id: number
    r: number
    targetR: number
    fill: string
    type: string
    x: number
    y: number
    vx: number
    vy: number
}

// Fallback agent generation
function generateDefaultAgents(numAgents: number): Agent[] {
    return Array.from({ length: numAgents }, (_, i) => {
        let type = "Mid Petrol Cars"  // Default to high-emission vehicle
        let adoptionThreshold = Math.random()
        let influence = 1 + Math.random() * 2
        let resistance = Math.random()

        // Distribute vehicle types based on emission transition
        if (i < Math.floor(numAgents * 0.1)) {
            type = "Cycling/Walking"
            adoptionThreshold = 0.1
            influence = 3 + Math.random()
            resistance = 0.1
        } else if (i < Math.floor(numAgents * 0.2)) {
            type = "Mid-size Electric Cars"
            adoptionThreshold = 0.2
            influence = 3 + Math.random()
            resistance = 0.2
        } else if (i < Math.floor(numAgents * 0.35)) {
            type = "Hybrid Electric Vehicle"
            adoptionThreshold = 0.4
            influence = 2 + Math.random()
            resistance = 0.3
        } else if (i < Math.floor(numAgents * 0.6)) {
            type = "Small Petrol Cars"
            adoptionThreshold = 0.6
            influence = 1.5 + Math.random()
            resistance = 0.5
        } else if (i < Math.floor(numAgents * 0.8)) {
            type = "Mid Diesel"
            adoptionThreshold = 0.7
            influence = 1 + Math.random()
            resistance = 0.6
        }

        return {
            id: i,
            initialType: type,
            adoptionThreshold,
            influence,
            resistance,
            networkConnections: Math.floor(Math.random() * 5) + 2,
            activity: Math.random() * 3 + 1,
            name: `Agent ${i + 1}`
        }
    })
}

// Dynamic simulation generation based on AI agents
function generateDynamicFrames(aiAgents: Agent[], numFrames: number = 24) {
    const frames = []

    for (let frame = 0; frame < numFrames; frame++) {
        const agents = []
        const adoptionProgress = frame / numFrames

        // Calculate network effects
        let adoptedCount = 0

        for (let i = 0; i < aiAgents.length; i++) {
            const aiAgent = aiAgents[i]
            let currentType = aiAgent.initialType
            let influence = aiAgent.influence

            // Network effect: count nearby adopted agents
            const networkEffect = adoptedCount / aiAgents.length
            const personalThreshold = aiAgent.adoptionThreshold - (networkEffect * 0.3)

            // Determine current type based on adoption progress and network effects
            if (adoptionProgress > personalThreshold) {
                if (aiAgent.initialType === "Mid Petrol Cars") {
                    currentType = Math.random() < 0.4 ? "Hybrid Electric Vehicle" : Math.random() < 0.7 ? "Mid-size Electric Cars" : "Cycling/Walking"
                } else if (aiAgent.initialType === "Mid Diesel" && adoptionProgress > 0.6) {
                    currentType = Math.random() < 0.5 ? "Hybrid Electric Vehicle" : "Small Petrol Cars"
                }
            }

            // Update influence based on adoption
            if (currentType === "Mid-size Electric Cars" || currentType === "Hybrid Electric Vehicle") {
                influence = Math.min(5, aiAgent.influence + adoptionProgress * 2)
                adoptedCount++
            }

            agents.push({
                id: aiAgent.id,
                type: currentType,
                influence,
                activity: aiAgent.activity + (Math.random() - 0.5) * 0.5,
                name: aiAgent.name
            })
        }

        const adoptionRate = adoptedCount / aiAgents.length

        frames.push({
            t: `Month ${frame + 1}`,
            agents,
            adoptionRate
        })
    }

    return frames
}

interface AgentBubblesProps {
    policyContext?: string
    numAgents?: number
    timeFrames?: number
}

export default function AgentBubblesVisualization({
    policyContext = "General policy adoption simulation",
    numAgents = 50,
    timeFrames = 24
}: AgentBubblesProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentFrame, setCurrentFrame] = useState(0)
    const [frames, setFrames] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [aiAgents, setAiAgents] = useState<Agent[]>([])
    const [selectedAgent, setSelectedAgent] = useState<any>(null)
    const [showChat, setShowChat] = useState(false)
    const [runningSimulation, setRunningSimulation] = useState(false)
    const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const width = 800
    const height = 500
    const cx = width / 2
    const cy = height / 2
    const R = Math.min(width, height) * 0.4

    // Load existing simulation data on component mount
    useEffect(() => {
        async function loadExistingSimulation() {
            setLoading(true)
            try {
                console.log('Loading simulation data from JSON...')
                const response = await fetch('/simulation_data.json')
                
                if (response.ok) {
                    const result = await response.json()
                    
                    if (result.success && result.agents && result.frames) {
                        console.log('Loaded simulation data:', result.frames.length, 'frames,', result.agents.length, 'agents')
                        setAiAgents(result.agents)
                        setFrames(result.frames)
                        setCurrentFrame(0)
                    } else {
                        console.warn('Invalid simulation data format')
                        setFrames([])
                    }
                } else {
                    console.warn('No simulation data file found, will generate on play')
                    setFrames([])
                }
            } catch (error) {
                console.error('Failed to load simulation data:', error)
                setFrames([])
            } finally {
                setLoading(false)
            }
        }

        loadExistingSimulation()
    }, [])

    useEffect(() => {
        if (loading || frames.length === 0) {
            console.log('Skipping visualization:', { loading, framesLength: frames.length })
            return
        }
        if (!svgRef.current) return

        console.log('Initializing visualization with frames:', frames.length, 'first frame agents:', frames[0]?.agents?.length)

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        // Create type-specific cluster centers (emission level grouping)
        const typePositions = {
            "Cycling/Walking": { x: cx - R * 0.6, y: cy - R * 0.6 }, // Clean transport - Level 1
            "BEV-M": { x: cx - R * 0.3, y: cy - R * 0.6 },           // Battery Electric - Level 1
            "HEV-S": { x: cx + R * 0.3, y: cy - R * 0.3 },           // Small Hybrid - Level 2
            "ICE-S": { x: cx + R * 0.6, y: cy + R * 0.3 },           // Small Petrol - Level 3
            "DIE-M": { x: cx + R * 0.3, y: cy + R * 0.6 },           // Mid Diesel - Level 3
            "ICE-M": { x: cx - R * 0.3, y: cy + R * 0.6 }            // Mid Petrol - Level 4
        }

        // Create boundary circle
        svg.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", R)
            .attr("fill", "none")
            .attr("stroke", "#444")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.5)


        // Initialize nodes with positions near their type centers
        const nodes: SimulationNode[] = frames[0].agents.map((agent: any) => {
            const vehicleType = mapVehicleType(agent.type)
            const typePos = typePositions[vehicleType as keyof typeof typePositions] || { x: cx, y: cy }
            const emissionLevel = getEmissionLevel(vehicleType, agent.emissionLevel)
            const radius = rScale(emissionLevel)
            
            return {
                id: agent.id,
                x: typePos.x + (Math.random() - 0.5) * 60,
                y: typePos.y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                r: radius,
                targetR: radius,
                fill: AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]?.color || AGENT_TYPES["Cycling/Walking"].color,
                type: vehicleType
            }
        })

        // Create circles with click interaction
        const circles = svg.append("g")
            .selectAll("circle.agent")
            .data(nodes)
            .join("circle")
            .attr("class", "agent")
            .attr("cx", (d: SimulationNode) => d.x || 0)
            .attr("cy", (d: SimulationNode) => d.y || 0)
            .attr("r", (d: SimulationNode) => d.r)
            .attr("fill", (d: SimulationNode) => d.fill)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("click", function (event, d: any) {
                // Find the current agent data
                const frameData = frames[currentFrame] || frames[0]
                const agentData = frameData.agents.find((a: any) => a.id === d.id)
                const aiAgentData = aiAgents.find(a => a.id === d.id)

                if (agentData && aiAgentData) {
                    setSelectedAgent({
                        ...agentData,
                        ...aiAgentData,
                        currentFrame: currentFrame + 1
                    })
                    setShowChat(true)
                }

                // Visual feedback
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 3)
                    .attr("stroke", "#ffff00")
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 1)
                    .attr("stroke", "#fff")
            })
            .on("mouseover", function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("stroke-width", 2)
                    .attr("stroke", "#ffff00")
            })
            .on("mouseout", function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr("stroke-width", 1)
                    .attr("stroke", "#fff")
            })

        // Enhanced physics simulation based on Netherlands visualization
        const pad = 1.5
        const collide = d3.forceCollide().radius((d: any) => d.r + pad).strength(0.8).iterations(10)
        
        // Dynamic gravity forces - weaker for distant nodes to allow color migration
        const fx = d3.forceX(cx).strength((d: any) => {
            const dist = Math.hypot((d.x || 0) - cx, (d.y || 0) - cy)
            const maxDist = R * 0.8
            return dist > maxDist ? 0.06 : 0.04 // Stronger pull only for very distant nodes
        })
        const fy = d3.forceY(cy).strength((d: any) => {
            const dist = Math.hypot((d.x || 0) - cx, (d.y || 0) - cy)
            const maxDist = R * 0.8
            return dist > maxDist ? 0.06 : 0.04 // Stronger pull only for very distant nodes
        })

        // Enhanced pie-chart-like color clustering forces
        function colorClusterForce() {
            const strength = 0.6 // Significantly increased from 0.25
            
            // Define sector angles for each color (pie chart layout)
            const colorSectors = new Map([
                ["#22c55e", 0],           // Green (Electric, Cycling) - Right
                ["#84cc16", Math.PI/2],   // Light green (Hybrid) - Top  
                ["#f59e0b", Math.PI],     // Orange (Petrol, Diesel) - Left
                ["#ef4444", 3*Math.PI/2]  // Red (Mid Petrol) - Bottom
            ])
            
            function force() {
                // Group nodes by color
                const colorGroups = d3.group(nodes, (d: any) => d.fill)
                
                colorGroups.forEach((group, color) => {
                    if (group.length <= 1) return
                    
                    // Get assigned sector angle for this color
                    const sectorAngle = colorSectors.get(color) || 0
                    
                    // Calculate ideal sector position on circle edge
                    const sectorRadius = R * 0.7 // 70% of circle radius
                    const sectorCenterX = cx + sectorRadius * Math.cos(sectorAngle)
                    const sectorCenterY = cy + sectorRadius * Math.sin(sectorAngle)
                    
                    // Apply sector-based clustering force to each node in the group
                    group.forEach((d: any) => {
                        const dx = sectorCenterX - (d.x || 0)
                        const dy = sectorCenterY - (d.y || 0)
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1
                        const force = strength / Math.max(distance, 10) // Prevent extreme forces
                        
                        d.vx = (d.vx || 0) + dx * force * 0.3
                        d.vy = (d.vy || 0) + dy * force * 0.3
                    })
                    
                    // Additional intra-group cohesion (keep same colors tight together)
                    if (group.length > 1) {
                        const groupCentroidX = d3.mean(group, (d: any) => d.x || 0) || cx
                        const groupCentroidY = d3.mean(group, (d: any) => d.y || 0) || cy
                        
                        group.forEach((d: any) => {
                            const dx = groupCentroidX - (d.x || 0)
                            const dy = groupCentroidY - (d.y || 0)
                            const distance = Math.sqrt(dx * dx + dy * dy) || 1
                            const cohesionForce = 0.2 / distance
                            
                            d.vx = (d.vx || 0) + dx * cohesionForce * 0.8
                            d.vy = (d.vy || 0) + dy * cohesionForce * 0.8
                        })
                    }
                })
            }
            
            return force
        }

        const colorCluster = colorClusterForce()

        const simulation = d3.forceSimulation(nodes)
            .alpha(0.15) // Increased initial energy
            .alphaDecay(0.015) // Slower decay for longer settling
            .velocityDecay(0.6) // Less velocity decay for more movement
            .force("collide", collide)
            .force("fx", fx)
            .force("fy", fy)
            .force("colorCluster", colorCluster)
            .on("tick", () => {
                // Keep nodes within circle boundary
                nodes.forEach((d: any) => {
                    const dx = (d.x || 0) - cx
                    const dy = (d.y || 0) - cy
                    const dist = Math.hypot(dx, dy)
                    const maxDist = R - d.r - 5
                    if (dist > maxDist) {
                        const scale = maxDist / dist
                        d.x = cx + dx * scale
                        d.y = cy + dy * scale
                    }
                })
                
                circles
                    .attr("cx", (d: SimulationNode) => d.x || 0)
                    .attr("cy", (d: SimulationNode) => d.y || 0)
                    .attr("r", (d: SimulationNode) => d.r)
                    .attr("fill", (d: SimulationNode) => d.fill)
            })

        simulationRef.current = simulation

        // Apply initial frame
        updateFrame(0)

        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop()
            }
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [frames, loading])

    const updateFrame = (frameIndex: number) => {
        const frame = frames[frameIndex]
        if (!frame || !simulationRef.current) return

        const svg = d3.select(svgRef.current)
        const circles = svg.selectAll("circle.agent")

        circles.each(function (d: any) {
            const agent = frame.agents.find((a: any) => a.id === d.id)
            if (!agent) return

            // Map vehicle types
            const vehicleType = mapVehicleType(agent.type)
            const agentConfig = AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]
            
            if (!agentConfig) {
                console.warn(`Vehicle type '${vehicleType}' not found in AGENT_TYPES (original: ${agent.type})`)
                return
            }

            // Use emission-based sizing from agent data or vehicle type
            const emissionLevel = getEmissionLevel(vehicleType, agent.emissionLevel)
            const targetR = rScale(emissionLevel)
            const targetFill = agentConfig.color

            d.targetR = targetR
            d.type = vehicleType

            // Enhanced animation with Netherlands-style transitions
            const circle = d3.select(this)
            circle.interrupt()
            circle.transition()
                .duration(300)
                .ease(d3.easeCubicOut)
                .attr("r", targetR)
                .attr("fill", targetFill)
                .on("end", () => {
                    d.r = targetR
                    d.fill = targetFill
                    
                    // Update collision force radius for new size
                    if (simulationRef.current) {
                        simulationRef.current.force("collide", d3.forceCollide()
                            .radius((d: any) => d.r + 1.5).strength(0.8).iterations(10))
                    }
                })
        })

        // Boost simulation energy for color changes (like Netherlands viz)
        if (simulationRef.current) {
            simulationRef.current.alpha(0.3).restart()
            
            // Add temporary boost to color clustering forces
            setTimeout(() => {
                if (simulationRef.current) {
                    simulationRef.current.alpha(0.2).restart()
                }
            }, 50)
        }

        setCurrentFrame(frameIndex)
    }

    const runSimulationAndPlay = async () => {
        if (runningSimulation) return
        
        setRunningSimulation(true)
        setLoading(true)
        
        try {
            console.log('Running Python simulation...')
            const response = await fetch('/api/run-simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            
            const result = await response.json()
            
            if (result.success && result.agents && result.frames) {
                console.log('Simulation completed, updating data:', result.frames.length, 'frames')
                setAiAgents(result.agents)
                setFrames(result.frames)
                setCurrentFrame(0)
            } else {
                console.warn('Simulation failed, using fallback data:', result.error)
                if (result.fallbackData) {
                    setAiAgents(result.fallbackData.agents)
                    setFrames(result.fallbackData.frames)
                }
            }
        } catch (error) {
            console.error('Failed to run simulation:', error)
            // Keep existing data on error
        } finally {
            setRunningSimulation(false)
            setLoading(false)
            
            // Start playing after simulation completes
            setTimeout(() => {
                play()
            }, 1000)
        }
    }
    
    const play = () => {
        if (isPlaying) return
        
        // If no data loaded yet, run simulation first
        if (frames.length === 0 && !runningSimulation) {
            runSimulationAndPlay()
            return
        }
        
        setIsPlaying(true)

        timerRef.current = setInterval(() => {
            setCurrentFrame(prev => {
                const next = (prev + 1) % frames.length
                updateFrame(next)
                return next
            })
        }, 400) // 400ms per frame (0.4 seconds per month)
    }

    const pause = () => {
        setIsPlaying(false)
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const reset = async () => {
        pause()
        setCurrentFrame(0)
        
        // Run new simulation to generate fresh data
        setRunningSimulation(true)
        setLoading(true)
        
        try {
            console.log('Running new simulation...')
            const response = await fetch('/api/run-simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            
            const result = await response.json()
            
            if (result.success && result.agents && result.frames) {
                console.log('New simulation completed:', result.frames.length, 'frames')
                setAiAgents(result.agents)
                setFrames(result.frames)
                setCurrentFrame(0)
                
                // Update the JSON file for future loads
                await updateSimulationJSON()
            } else {
                console.warn('Simulation failed, keeping existing data:', result.error)
                // Fallback: try to regenerate from existing XLSX
                await updateSimulationJSON()
            }
        } catch (error) {
            console.error('Failed to run new simulation:', error)
        } finally {
            setRunningSimulation(false)
            setLoading(false)
        }
    }
    
    // Helper function to update the JSON file with new simulation data
    const updateSimulationJSON = async () => {
        try {
            console.log('Updating simulation JSON file...')
            const response = await fetch('/api/update-simulation-json', {
                method: 'GET' // Use GET to regenerate from latest XLSX
            })
            
            const result = await response.json()
            
            if (result.success) {
                console.log('Simulation JSON updated successfully')
            } else {
                console.warn('Failed to update simulation JSON:', result.error)
            }
        } catch (error) {
            console.error('Failed to update simulation JSON:', error)
        }
    }

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        pause()
        const frameIndex = parseInt(e.target.value)
        updateFrame(frameIndex)
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Card className="p-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">
                            {runningSimulation 
                                ? 'Running new Python simulation...' 
                                : 'Loading simulation data...'
                            }
                        </span>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {/* Legend - Compact */}
            <Card className="p-3">
                <h3 className="text-sm font-semibold mb-2">Agent Types</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(AGENT_TYPES).map(([type, config]) => (
                        <div key={type} className="flex items-center gap-1">
                            <div
                                className="w-3 h-3 rounded-full border border-border"
                                style={{ backgroundColor: config.color }}
                            />
                            <Badge variant="outline" className="text-xs px-1 py-0">
                                {type}
                            </Badge>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Controls - Compact */}
            <Card className="p-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={isPlaying ? pause : play}
                                variant="outline"
                                size="sm"
                                className="px-2 py-1"
                            >
                                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </Button>
                            <Button
                                onClick={reset}
                                variant="outline"
                                size="sm"
                                className="px-2 py-1"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <div>{frames[currentFrame]?.t || `Month ${currentFrame + 1}`}</div>
                            <div className="text-xs">
                                Progress: {currentFrame + 1}/{frames.length} months
                            </div>
                            {frames[currentFrame]?.adoptionRate !== undefined && (
                                <div className="text-xs">
                                    Clean Transport: {Math.round(frames[currentFrame].adoptionRate * 100)}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Year 1</span>
                            <span>Year 15</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={frames.length - 1}
                            value={currentFrame}
                            onChange={handleScrub}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </Card>

            {/* Visualization */}
            <Card className="p-2">
                <div className="flex justify-center">
                    <svg
                        ref={svgRef}
                        width={width}
                        height={height}
                        className="border border-border rounded bg-muted/50"
                    />
                </div>
            </Card>


        </div >
    )
}