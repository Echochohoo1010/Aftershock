"use client"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import * as d3 from "d3"
import { PhysicsEngine } from "../simulation/PhysicsEngine"
import { SimulationNode, PhysicsConfig } from "@/components/shared/types/simulation.types"
import { AGENT_TYPES, mapVehicleType, getEmissionLevel } from "@/components/shared/constants/agentTypes"

// Network mode imports
import type { Topology } from 'topojson-specification'
import type { CityData, AgentGeoData, NetworkEdge } from '@/lib/network/types'
import { generateSocialNetwork, calculateNetworkStatistics } from '@/lib/network/edge-generator'
import { createNetherlandsProjection, projectCoordinate } from '@/lib/network/projection'
import { DEFAULT_NETWORK_PARAMS } from '@/lib/network/types'
import MapBackground from '../network/MapBackground'
import NetworkEdges from '../network/NetworkEdges'

const rScale = d3.scaleLinear().domain([1, 4]).range([8, 18]) // Size based on emission level

// PERFORMANCE: Memoized circle component to prevent unnecessary re-renders
interface BubbleCircleProps {
    node: SimulationNode
    isHovered: boolean
    onMouseEnter: () => void
    onMouseLeave: () => void
}

const BubbleCircle = memo(({ node, isHovered, onMouseEnter, onMouseLeave }: BubbleCircleProps) => {
    const cx = node.x ?? 0
    const cy = node.y ?? 0

    return (
        <circle
            className="agent"
            r={node.r ?? 8}
            cx={cx}
            cy={cy}
            fill={node.type === "Cycling" ? "none" : (node.fill ?? "#ccc")}
            stroke={
                isHovered
                    ? "#fbbf24"
                    : node.type === "Cycling" ? (node.fill ?? "#ccc") : "#fff"
            }
            strokeWidth={
                isHovered
                    ? 4
                    : node.type === "Cycling" ? 2 : 1
            }
            opacity={0.85}
            style={{
                cursor: 'pointer',
                filter: isHovered ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    )
}, (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these values changed
    return (
        prevProps.node.x === nextProps.node.x &&
        prevProps.node.y === nextProps.node.y &&
        prevProps.node.r === nextProps.node.r &&
        prevProps.node.fill === nextProps.node.fill &&
        prevProps.node.type === nextProps.node.type &&
        prevProps.isHovered === nextProps.isHovered
    )
})

BubbleCircle.displayName = 'BubbleCircle'

interface PureBubbleCanvasProps {
    width: number
    height: number
    currentFrame?: number
    onFrameUpdate?: (frame: number) => void
    networkMode?: boolean  // NEW: Network visualization mode
}

export default function PureBubbleCanvas({
    width,
    height,
    currentFrame = 0,
    onFrameUpdate,
    networkMode = false  // NEW
}: PureBubbleCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const physicsEngineRef = useRef<PhysicsEngine | null>(null)
    const nodesRef = useRef<SimulationNode[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [frames, setFrames] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
    const [hoveredAgent, setHoveredAgent] = useState<{
        id: number
        type: string
        emission_level: number
        x: number
        y: number
    } | null>(null)

    // NEW: Network mode state
    const [geoData, setGeoData] = useState<{
        topology: Topology | null
        cities: CityData[] | null
        projection: d3.GeoProjection | null
        agentLocations: Map<number, AgentGeoData> | null
        edges: NetworkEdge[] | null
    }>({
        topology: null,
        cities: null,
        projection: null,
        agentLocations: null,
        edges: null
    })
    const [isLoadingGeoData, setIsLoadingGeoData] = useState(false)
    const [circleUpdateTrigger, setCircleUpdateTrigger] = useState(0) // Force re-render when circles update
    const lastPhysicsUpdateRef = useRef<number>(0) // Throttle physics updates
    const animationFrameRef = useRef<number | null>(null)

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

    // NEW: Load network data when network mode is activated
    useEffect(() => {
        if (networkMode && !geoData.topology && nodesRef.current.length > 0) {
            loadNetworkData()
        }
    }, [networkMode])

    // NEW: Load geographic data and generate network
    const loadNetworkData = async () => {
        setIsLoadingGeoData(true)
        try {
            console.log('Loading network geographic data...')

            // Load map topology and cities data in parallel
            const [topologyResponse, citiesResponse] = await Promise.all([
                fetch('/geo-data/netherlands-map.json'),
                fetch('/geo-data/netherlands-cities.json')
            ])

            if (!topologyResponse.ok || !citiesResponse.ok) {
                throw new Error('Failed to load geographic data')
            }

            const topology: Topology = await topologyResponse.json()
            const cities: CityData[] = await citiesResponse.json()

            console.log('Loaded map and cities data')

            // Create projection
            const projection = createNetherlandsProjection(width, height, topology)

            // Helper: Select city weighted by population
            const selectCityByPopulation = (cities: CityData[]): CityData => {
                const totalPopulation = cities.reduce((sum, city) => sum + city.population, 0)
                let random = Math.random() * totalPopulation

                for (const city of cities) {
                    random -= city.population
                    if (random <= 0) return city
                }

                return cities[0] // Fallback
            }

            // Simple population-weighted assignment
            const agentLocations = new Map<number, AgentGeoData>()

            nodesRef.current.forEach(node => {
                // Select city weighted by population
                const city = selectCityByPopulation(cities)

                // Project city coordinates to SVG
                const [x, y] = projectCoordinate(projection, city.lng, city.lat)

                // Set initial position AT city center (physics will spread them out naturally)
                node.x = x
                node.y = y
                node.lat = city.lat
                node.lng = city.lng
                node.geoX = x  // Keep for reference
                node.geoY = y
                node.cityName = city.name
                node.locationType = city.type

                // Also store in agentLocations map for edge generation
                agentLocations.set(node.id, {
                    id: node.id,
                    lat: city.lat,
                    lng: city.lng,
                    cityName: city.name,
                    locationType: city.type
                })
            })

            console.log('Assigned bubbles to cities:', agentLocations.size, 'agents')

            // Generate social network edges
            const edges = generateSocialNetwork(agentLocations, DEFAULT_NETWORK_PARAMS)
            const stats = calculateNetworkStatistics(edges, nodesRef.current.length)

            console.log('Generated network:', stats)

            setGeoData({
                topology,
                cities,
                projection,
                agentLocations,
                edges
            })

        } catch (error) {
            console.error('Failed to load network data:', error)
        } finally {
            setIsLoadingGeoData(false)
        }
    }

    // Generate initial nodes ONLY once when frames are loaded
    const generateInitialNodes = useCallback(() => {
        if (!frames.length) return []

        // Use first frame to determine agents
        const frameData = frames[0]
        if (!frameData?.agents) return []

        // Create type-specific cluster centers (emission level grouping)
        const typePositions = {
            "Cycling": { x: centerX - radius * 0.6, y: centerY - radius * 0.6 },
            "BEV-M": { x: centerX - radius * 0.3, y: centerY - radius * 0.6 },
            "HEV-S": { x: centerX + radius * 0.3, y: centerY - radius * 0.3 },
            "ICE-S": { x: centerX + radius * 0.6, y: centerY + radius * 0.3 },
            "DIE-M": { x: centerX + radius * 0.3, y: centerY + radius * 0.6 },
            "ICE-M": { x: centerX - radius * 0.3, y: centerY + radius * 0.6 }
        }

        const nodes: SimulationNode[] = frameData.agents.map((agent: any) => {
            const vehicleType = mapVehicleType(agent.type)
            const typePos = typePositions[vehicleType as keyof typeof typePositions] || { x: centerX, y: centerY }
            const emissionLevel = getEmissionLevel(vehicleType, agent.emission_level)
            const nodeRadius = rScale(emissionLevel)

            return {
                id: agent.id,
                x: typePos.x + (Math.random() - 0.5) * 60,
                y: typePos.y + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                r: nodeRadius,
                targetR: nodeRadius,
                fill: AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]?.color || AGENT_TYPES["Cycling"].color,
                type: vehicleType
            }
        })

        return nodes
    }, [frames.length, centerX, centerY, radius]) // Only depends on frames.length, not currentFrame

    const initializeVisualization = useCallback(() => {
        if (!svgRef.current || loading || !frames.length) return

        const svg = d3.select(svgRef.current)

        // Select or create the visualization container
        let container = svg.select<SVGGElement>(".visualization-container")

        // Only create container if it doesn't exist
        if (container.empty()) {
            container = svg
                .append("g")
                .attr("class", "visualization-container")
        } else {
            // Clear existing circles if container exists
            container.selectAll("circle").remove()
        }

        const nodes = generateInitialNodes()
        if (!nodes.length) return

        nodesRef.current = nodes

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

        // Add boundary constraints and update positions
        // PERFORMANCE FIX: Throttle React re-renders to ~30fps instead of ~60fps
        physicsEngineRef.current.addBoundaryConstraint((updatedNodes) => {
            // Update node positions in ref
            nodesRef.current.forEach((node, i) => {
                if (updatedNodes[i]) {
                    node.x = updatedNodes[i].x
                    node.y = updatedNodes[i].y
                }
            })

            // Throttle re-renders to max 30fps (every ~33ms) instead of 60fps
            const now = performance.now()
            if (now - lastPhysicsUpdateRef.current >= 33) {
                lastPhysicsUpdateRef.current = now

                // Use requestAnimationFrame for smoother updates
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                }
                animationFrameRef.current = requestAnimationFrame(() => {
                    setCircleUpdateTrigger(prev => prev + 1)
                })
            }
        })

        // Removed periodic movement - agents should stay stable and only animate size/color changes

    }, [generateInitialNodes, loading, frames.length])

    useEffect(() => {
        initializeVisualization()

        return () => {
            if (physicsEngineRef.current) {
                physicsEngineRef.current.stop()
            }
            // PERFORMANCE FIX: Cleanup animation frame on unmount
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
        }
    }, [initializeVisualization])

    // Control physics engine based on network mode
    useEffect(() => {
        if (networkMode && geoData.projection && geoData.cities) {
            console.log('Entering network mode - enabling city clustering physics')

            // Create city position map for gravity centers
            const cityPositions = new Map<string, {x: number, y: number}>()
            geoData.cities.forEach(city => {
                const [x, y] = projectCoordinate(geoData.projection!, city.lng, city.lat)
                cityPositions.set(city.name, { x, y })
            })

            // Get the D3 simulation from physics engine
            const simulation = physicsEngineRef.current?.getSimulation?.()

            if (simulation) {
                // IMPORTANT: Remove center gravity forces (fx, fy) that pull to screen center
                simulation.force('fx', null)
                simulation.force('fy', null)

                // Add city clustering force - pulls bubbles toward their assigned city
                simulation.force('city-cluster', (alpha: number) => {
                    nodesRef.current.forEach(node => {
                        if (!node.cityName) return

                        const cityPos = cityPositions.get(node.cityName)
                        if (!cityPos) return

                        // Calculate pull toward city center
                        const dx = cityPos.x - (node.x || 0)
                        const dy = cityPos.y - (node.y || 0)

                        // Apply force (stronger pull toward city)
                        const strength = 0.15 * alpha  // Increased from 0.05
                        node.vx = (node.vx || 0) + dx * strength
                        node.vy = (node.vy || 0) + dy * strength
                    })
                })

                // Add collision detection to prevent overlap
                simulation.force('collide', d3.forceCollide<SimulationNode>()
                    .radius(d => (d.r || 8) + 2)
                    .strength(0.8)
                )

                // Gentle restart for smooth clustering animation
                simulation.alpha(0.5).restart()  // Increased alpha for stronger animation
            }
        } else if (!networkMode) {
            console.log('Entering cluster mode - restoring regular physics')

            const simulation = physicsEngineRef.current?.getSimulation?.()

            if (simulation) {
                // Remove city clustering force
                simulation.force('city-cluster', null)

                // Restore center gravity forces (fx, fy)
                const { centerX, centerY, radius } = physicsConfig
                const gravityStrength = 0.04

                simulation.force('fx', d3.forceX<SimulationNode>(centerX).strength((d: SimulationNode) => {
                    const dist = Math.hypot((d.x || 0) - centerX, (d.y || 0) - centerY)
                    const maxDist = radius * 0.8
                    return dist > maxDist ? 0.06 : gravityStrength
                }))

                simulation.force('fy', d3.forceY<SimulationNode>(centerY).strength((d: SimulationNode) => {
                    const dist = Math.hypot((d.x || 0) - centerX, (d.y || 0) - centerY)
                    const maxDist = radius * 0.8
                    return dist > maxDist ? 0.06 : gravityStrength
                }))

                // Restart physics
                simulation.alpha(0.3).restart()
            }
        }
    }, [networkMode, geoData.projection, geoData.cities])

    // Update frame function for animation
    const updateFrame = useCallback((frameIndex: number) => {
        if (!frames[frameIndex] || !physicsEngineRef.current || !nodesRef.current.length) return

        const frame = frames[frameIndex]
        let hasSizeChanges = false
        let hasAnyChanges = false

        // PERFORMANCE FIX: Create agent lookup map to avoid O(n²) complexity
        const agentMap = new Map(frame.agents.map((a: any) => [a.id, a]))

        // PERFORMANCE FIX: Only update nodes that actually changed
        nodesRef.current.forEach((node: any) => {
            const agent = agentMap.get(node.id) as any
            if (!agent) return

            const vehicleType = mapVehicleType(agent.type)
            const agentConfig = AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]

            if (!agentConfig) return

            const emissionLevel = getEmissionLevel(vehicleType, agent.emission_level as number)
            const targetR = rScale(emissionLevel)
            const targetFill = agentConfig.color

            // PERFORMANCE FIX: Only update if values actually changed
            const sizeChanged = Math.abs((node.r || 0) - targetR) > 0.5
            const colorChanged = node.fill !== targetFill
            const typeChanged = node.type !== vehicleType

            if (sizeChanged || colorChanged || typeChanged) {
                hasAnyChanges = true

                if (sizeChanged) {
                    hasSizeChanges = true
                    node.r = targetR
                }
                if (colorChanged) {
                    node.fill = targetFill
                }
                if (typeChanged) {
                    node.type = vehicleType
                }
            }
        })

        // PERFORMANCE FIX: Only trigger re-render if something actually changed
        if (hasAnyChanges) {
            setCircleUpdateTrigger(prev => prev + 1)
        }

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

        // PERFORMANCE FIX: Only update physics if there were actual changes
        if (hasAnyChanges && physicsEngineRef.current) {
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

    // NEW: Show loading state for network data
    if (networkMode && isLoadingGeoData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading network data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="w-full h-full"
                style={{ background: 'white' }}
            >
                {/* Network mode: Map background layer */}
                {networkMode && geoData.topology && geoData.projection && geoData.cities && (
                    <MapBackground
                        width={width}
                        height={height}
                        projection={geoData.projection}
                        topology={geoData.topology}
                        cities={geoData.cities}
                    />
                )}

                {/* Network mode: Edges layer (between map and bubbles) */}
                {networkMode && geoData.edges && (
                    <NetworkEdges
                        edges={geoData.edges}
                        nodes={nodesRef.current}
                    />
                )}

                {/* CIRCLES - Rendered by React with memoization (forces re-render via circleUpdateTrigger) */}
                <g className="visualization-container">
                    {nodesRef.current.map(node => (
                        <BubbleCircle
                            key={node.id}
                            node={node}
                            isHovered={hoveredAgent?.id === node.id}
                            onMouseEnter={() => {
                                const frameData = frames[currentFrameIndex]
                                const agentData = frameData?.agents.find((a: any) => a.id === node.id)
                                if (agentData) {
                                    setHoveredAgent({
                                        id: node.id,
                                        type: agentData.type,
                                        emission_level: agentData.emission_level,
                                        x: node.x ?? 0,
                                        y: node.y ?? 0
                                    })
                                }
                            }}
                            onMouseLeave={() => setHoveredAgent(null)}
                        />
                    ))}
                </g>
            </svg>

            {/* Hover Card */}
            {hoveredAgent && (() => {
                // Map vehicle types to annual CO2 emissions (kg/year)
                const emissionsByType: { [key: string]: number } = {
                    "Cycling": 0,
                    "BEV-M": 0,
                    "HEV-S": 2250,
                    "ICE-S": 2750,
                    "DIE-M": 3250,
                    "ICE-M": 3750
                }

                const vehicleType = mapVehicleType(hoveredAgent.type)
                const annualEmissions = emissionsByType[vehicleType] || 0

                return (
                    <div
                        className="absolute bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-lg p-3 pointer-events-none z-50"
                        style={{
                            left: `${hoveredAgent.x + 20}px`,
                            top: `${hoveredAgent.y - 60}px`,
                            transform: 'translateX(0)',
                        }}
                    >
                        <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Agent Details
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-600">Agent Number:</span>
                                    <span className="font-semibold text-gray-900">#{hoveredAgent.id}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-600">Vehicle Choice:</span>
                                    <span className="font-semibold text-gray-900">
                                        {AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]?.displayName || hoveredAgent.type}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-gray-600">Annual Emissions:</span>
                                    <span className="font-semibold text-gray-900">
                                        {annualEmissions > 0 ? `${annualEmissions.toLocaleString()} kg CO₂` : '0 kg CO₂'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
