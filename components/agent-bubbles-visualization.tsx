"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, MessageCircle, X, Send } from "lucide-react"

// Agent types with colors and behaviors
const AGENT_TYPES = {
    "Innovator": { color: "#606c38", size: [18, 28] },
    "Adopter": { color: "#fefae0", size: [14, 22] },
    "Skeptic": { color: "#dda15e", size: [16, 24] },
    "Influencer": { color: "#bc6c25", size: [20, 32] },
    "Observer": { color: "#8b5a3c", size: [12, 18] }
}

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
        let type = "Observer"
        let adoptionThreshold = Math.random()
        let influence = 1 + Math.random() * 2
        let resistance = Math.random()

        // Distribute agent types
        if (i < Math.floor(numAgents * 0.05)) {
            type = "Innovator"
            adoptionThreshold = 0.1
            influence = 4 + Math.random()
            resistance = 0.1
        } else if (i < Math.floor(numAgents * 0.15)) {
            type = "Adopter"
            adoptionThreshold = 0.3
            influence = 2 + Math.random() * 2
            resistance = 0.3
        } else if (i >= Math.floor(numAgents * 0.8)) {
            type = "Skeptic"
            adoptionThreshold = 0.8
            influence = 1 + Math.random()
            resistance = 0.8
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
                if (aiAgent.initialType === "Observer") {
                    currentType = Math.random() < 0.7 ? "Adopter" : "Influencer"
                } else if (aiAgent.initialType === "Skeptic" && adoptionProgress > 0.6) {
                    currentType = Math.random() < 0.5 ? "Adopter" : "Skeptic"
                }
            }

            // Update influence based on adoption
            if (currentType === "Adopter" || currentType === "Influencer") {
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
    const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const width = 800
    const height = 500
    const cx = width / 2
    const cy = height / 2
    const R = Math.min(width, height) * 0.4

    // Generate AI agents when policy context changes
    useEffect(() => {
        async function initializeAgents() {
            setLoading(true)
            try {
                const generatedAgents = await generateAIAgents(policyContext, numAgents)
                setAiAgents(generatedAgents)
                const simulationFrames = generateDynamicFrames(generatedAgents, timeFrames)
                setFrames(simulationFrames)
            } catch (error) {
                console.error('Failed to generate agents:', error)
                // Fallback to default
                const defaultAgents = generateDefaultAgents(numAgents)
                setAiAgents(defaultAgents)
                const simulationFrames = generateDynamicFrames(defaultAgents, timeFrames)
                setFrames(simulationFrames)
            } finally {
                setLoading(false)
            }
        }

        initializeAgents()
    }, [policyContext, numAgents, timeFrames])

    useEffect(() => {
        if (loading || frames.length === 0) {
            console.log('Skipping visualization:', { loading, framesLength: frames.length })
            return
        }
        if (!svgRef.current) return

        console.log('Initializing visualization with frames:', frames.length, 'first frame agents:', frames[0]?.agents?.length)

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        // Create type-specific cluster centers
        const typePositions = {
            "Innovator": { x: cx - R * 0.5, y: cy - R * 0.5 },
            "Adopter": { x: cx + R * 0.5, y: cy - R * 0.5 },
            "Skeptic": { x: cx - R * 0.5, y: cy + R * 0.5 },
            "Influencer": { x: cx + R * 0.5, y: cy + R * 0.5 },
            "Observer": { x: cx, y: cy }
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

        // Add cluster center indicators
        Object.entries(typePositions).forEach(([type, pos]) => {
            const agentConfig = AGENT_TYPES[type as keyof typeof AGENT_TYPES]
            if (agentConfig) {
                svg.append("circle")
                    .attr("cx", pos.x)
                    .attr("cy", pos.y)
                    .attr("r", 8)
                    .attr("fill", agentConfig.color)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.3)

                svg.append("text")
                    .attr("x", pos.x)
                    .attr("y", pos.y - 15)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#ccc")
                    .attr("font-size", "10px")
                    .text(type)
            }
        })

        // Initialize nodes with positions near their type centers
        const nodes: SimulationNode[] = frames[0].agents.map((agent: any) => {
            const typePos = typePositions[agent.type as keyof typeof typePositions] || { x: cx, y: cy }
            return {
                id: agent.id,
                x: typePos.x + (Math.random() - 0.5) * 60,
                y: typePos.y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                r: 20,
                targetR: 20,
                fill: AGENT_TYPES[agent.type as keyof typeof AGENT_TYPES]?.color || AGENT_TYPES.Observer.color,
                type: agent.type
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

        // Physics simulation with clustering by type
        const simulation = d3.forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-8)) // Reduced repulsion for clustering
            .force("center", d3.forceCenter(cx, cy).strength(0.02)) // Very weak center force
            .force("collision", d3.forceCollide().radius((d: any) => d.r + 2).strength(0.8))
            // Clustering force - attract agents of same type to their designated areas
            .force("cluster", () => {
                const alpha = simulation.alpha()
                nodes.forEach(node => {
                    const typePos = typePositions[node.type as keyof typeof typePositions]
                    if (!typePos) return

                    // Apply attraction to type center
                    const dx = typePos.x - (node.x || 0)
                    const dy = typePos.y - (node.y || 0)
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance > 0) {
                        const strength = 0.15 * alpha // Clustering strength
                        node.vx = (node.vx || 0) + (dx / distance) * strength * Math.min(distance / 50, 1)
                        node.vy = (node.vy || 0) + (dy / distance) * strength * Math.min(distance / 50, 1)
                    }
                })
            })
            .force("boundary", () => {
                // Keep nodes within boundary
                nodes.forEach((node: SimulationNode) => {
                    const dx = (node.x || 0) - cx
                    const dy = (node.y || 0) - cy
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const maxDistance = R - node.r - 2

                    if (distance > maxDistance) {
                        const angle = Math.atan2(dy, dx)
                        node.x = cx + Math.cos(angle) * maxDistance
                        node.y = cy + Math.sin(angle) * maxDistance

                        // Bounce off boundary
                        const normalX = dx / distance
                        const normalY = dy / distance
                        const dotProduct = (node.vx || 0) * normalX + (node.vy || 0) * normalY
                        node.vx = (node.vx || 0) - 2 * dotProduct * normalX * 0.8
                        node.vy = (node.vy || 0) - 2 * dotProduct * normalY * 0.8
                    }
                })
            })
            .on("tick", () => {
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

            const agentConfig = AGENT_TYPES[agent.type as keyof typeof AGENT_TYPES]
            const targetR = agentConfig.size[0] + (agent.influence / 5) * (agentConfig.size[1] - agentConfig.size[0])

            d.targetR = targetR
            d.type = agent.type

            // Animate to new values
            d3.select(this)
                .transition()
                .duration(300)
                .attr("r", targetR)
                .attr("fill", agentConfig.color)
                .on("end", () => {
                    d.r = targetR
                    d.fill = agentConfig.color
                })
        })

        // Restart simulation with some energy
        if (simulationRef.current) {
            simulationRef.current.alpha(0.3).restart()
        }

        setCurrentFrame(frameIndex)
    }

    const play = () => {
        if (isPlaying) return
        setIsPlaying(true)

        timerRef.current = setInterval(() => {
            setCurrentFrame(prev => {
                const next = (prev + 1) % frames.length
                updateFrame(next)
                return next
            })
        }, 500) // 500ms per frame
    }

    const pause = () => {
        setIsPlaying(false)
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const reset = () => {
        pause()
        updateFrame(0)
    }

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        pause()
        const frameIndex = parseInt(e.target.value)
        updateFrame(frameIndex)
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Card className="p-8 bg-gray-800 border-gray-600">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span className="ml-3 text-white">Generating AI agents for: {policyContext}</span>
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
                            <div>Frame {currentFrame + 1}/{frames.length} — {frames[currentFrame]?.t}</div>
                            {frames[currentFrame]?.adoptionRate !== undefined && (
                                <div className="text-xs">
                                    Adoption: {Math.round(frames[currentFrame].adoptionRate * 100)}%
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
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