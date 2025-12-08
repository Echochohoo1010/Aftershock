import * as d3 from "d3"

export interface SimulationNode extends d3.SimulationNodeDatum {
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

export interface PhysicsConfig {
    width: number
    height: number
    centerX: number
    centerY: number
    radius: number
    collisionPadding?: number
    collisionStrength?: number
    gravityStrength?: number
    alpha?: number
    alphaDecay?: number
    velocityDecay?: number
    alphaMin?: number  // Minimum alpha for continuous gentle motion
}

export class PhysicsEngine {
    private simulation: d3.Simulation<SimulationNode, undefined> | null = null
    private config: PhysicsConfig
    private stabilityCheckInterval: NodeJS.Timeout | null = null

    constructor(config: PhysicsConfig) {
        this.config = {
            collisionPadding: 1.5,
            collisionStrength: 0.8,
            gravityStrength: 0.04,
            alpha: 0.15,
            alphaDecay: 0.015,
            velocityDecay: 0.6,
            alphaMin: 0.005,  // Default minimum alpha for continuous motion
            ...config
        }
    }

    createSimulation(nodes: SimulationNode[]): d3.Simulation<SimulationNode, undefined> {
        const { 
            centerX, centerY, radius, 
            collisionPadding, collisionStrength,
            gravityStrength, alpha, alphaDecay, velocityDecay 
        } = this.config

        // Enhanced collision detection with padding
        const collide = d3.forceCollide<SimulationNode>()
            .radius((d: SimulationNode) => d.r + collisionPadding!)
            .strength(collisionStrength!)
            .iterations(10)
        
        // Dynamic gravity forces - weaker for distant nodes
        const fx = d3.forceX<SimulationNode>(centerX).strength((d: SimulationNode) => {
            const dist = Math.hypot((d.x || 0) - centerX, (d.y || 0) - centerY)
            const maxDist = radius * 0.8
            return dist > maxDist ? 0.06 : gravityStrength!
        })
        
        const fy = d3.forceY<SimulationNode>(centerY).strength((d: SimulationNode) => {
            const dist = Math.hypot((d.x || 0) - centerX, (d.y || 0) - centerY)
            const maxDist = radius * 0.8
            return dist > maxDist ? 0.06 : gravityStrength!
        })

        this.simulation = d3.forceSimulation(nodes)
            .alpha(alpha!)
            .alphaDecay(alphaDecay!)
            .velocityDecay(velocityDecay!)
            .force("collide", collide)
            .force("fx", fx)
            .force("fy", fy)

        return this.simulation
    }

    addColorClusterForce(nodes: SimulationNode[], colorConfig?: Record<string, number>) {
        if (!this.simulation) return

        const { centerX, centerY, radius } = this.config

        // PERFORMANCE FIX: Pre-calculate sector positions (don't recalculate every tick)
        const colorSectors = new Map([
            ["#22c55e", 0],           // Green (Electric, Cycling) - Right
            ["#84cc16", Math.PI/2],   // Light green (Hybrid) - Top
            ["#f59e0b", Math.PI],     // Orange (Petrol, Diesel) - Left
            ["#ef4444", 3*Math.PI/2]  // Red (Mid Petrol) - Bottom
        ])

        const sectorPositions = new Map<string, {x: number, y: number}>()
        colorSectors.forEach((angle, color) => {
            const sectorRadius = radius * 0.7
            sectorPositions.set(color, {
                x: centerX + sectorRadius * Math.cos(angle),
                y: centerY + sectorRadius * Math.sin(angle)
            })
        })

        const colorClusterForce = () => {
            const strength = 0.6

            // PERFORMANCE FIX: Group nodes by color only once per tick
            const colorGroups = d3.group(nodes, (d: SimulationNode) => d.fill)

            colorGroups.forEach((group, color) => {
                if (group.length <= 1) return

                // Use pre-calculated sector position
                const sectorPos = sectorPositions.get(color)
                if (!sectorPos) return

                // Apply sector-based clustering force
                group.forEach((d: SimulationNode) => {
                    const dx = sectorPos.x - (d.x || 0)
                    const dy = sectorPos.y - (d.y || 0)
                    const distSq = dx * dx + dy * dy // Use squared distance to avoid sqrt
                    const dist = Math.sqrt(distSq) || 1
                    const force = strength / Math.max(dist, 10)

                    d.vx = (d.vx || 0) + dx * force * 0.3
                    d.vy = (d.vy || 0) + dy * force * 0.3
                })

                // PERFORMANCE FIX: Only calculate cohesion for groups > 2 nodes
                if (group.length > 2) {
                    const groupCentroidX = d3.mean(group, (d: SimulationNode) => d.x || 0) || centerX
                    const groupCentroidY = d3.mean(group, (d: SimulationNode) => d.y || 0) || centerY

                    group.forEach((d: SimulationNode) => {
                        const dx = groupCentroidX - (d.x || 0)
                        const dy = groupCentroidY - (d.y || 0)
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1
                        const cohesionForce = 0.2 / dist

                        d.vx = (d.vx || 0) + dx * cohesionForce * 0.8
                        d.vy = (d.vy || 0) + dy * cohesionForce * 0.8
                    })
                }
            })
        }

        this.simulation.force("colorCluster", colorClusterForce)
    }

    addBoundaryConstraint(onTick: (nodes: SimulationNode[]) => void) {
        if (!this.simulation) return

        const { centerX, centerY, radius } = this.config

        this.simulation.on("tick", () => {
            this.simulation!.nodes().forEach((d: SimulationNode) => {
                // Smooth radius interpolation when size changes
                if (d.targetR !== undefined && Math.abs(d.r - d.targetR) > 0.1) {
                    // Interpolate towards target radius (10% per tick = smooth transition)
                    d.r = d.r + (d.targetR - d.r) * 0.1
                }

                // Keep nodes within circle boundary
                const dx = (d.x || 0) - centerX
                const dy = (d.y || 0) - centerY
                const dist = Math.hypot(dx, dy)
                const maxDist = radius - d.r - 5
                if (dist > maxDist) {
                    const scale = maxDist / dist
                    d.x = centerX + dx * scale
                    d.y = centerY + dy * scale
                }
            })

            onTick(this.simulation!.nodes())
        })

        // PERFORMANCE FIX: Auto-pause simulation when stable
        this.startStabilityCheck()
    }

    private startStabilityCheck() {
        // Clear any existing interval
        if (this.stabilityCheckInterval) {
            clearInterval(this.stabilityCheckInterval)
        }

        // Check stability every 2 seconds
        this.stabilityCheckInterval = setInterval(() => {
            if (!this.simulation) return

            const alpha = this.simulation.alpha()
            const minAlpha = this.config.alphaMin || 0.005

            // Maintain minimum alpha for continuous gentle movement
            // NEVER stop the simulation (only stop on cleanup)
            if (alpha < minAlpha) {
                this.simulation.alpha(minAlpha)
            }
        }, 2000)
    }

    updateCollisionBoundaries() {
        if (!this.simulation) return
        
        const collide = d3.forceCollide<SimulationNode>()
            .radius((d: SimulationNode) => d.r + this.config.collisionPadding!)
            .strength(this.config.collisionStrength!)
            .iterations(10)
        
        this.simulation.force("collide", collide)
    }

    restart() {
        if (this.simulation) {
            this.simulation.alpha(0.3).restart()

            // Add temporary boost to forces
            setTimeout(() => {
                if (this.simulation) {
                    this.simulation.alpha(0.2).restart()
                }
            }, 50)

            // PERFORMANCE FIX: Restart stability check when simulation restarts
            this.startStabilityCheck()
        }
    }

    stop() {
        if (this.simulation) {
            this.simulation.stop()
        }

        // Clean up stability check interval
        if (this.stabilityCheckInterval) {
            clearInterval(this.stabilityCheckInterval)
            this.stabilityCheckInterval = null
        }
    }

    getSimulation() {
        return this.simulation
    }
}