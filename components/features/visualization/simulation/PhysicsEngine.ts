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
}

export class PhysicsEngine {
    private simulation: d3.Simulation<SimulationNode, undefined> | null = null
    private config: PhysicsConfig

    constructor(config: PhysicsConfig) {
        this.config = {
            collisionPadding: 1.5,
            collisionStrength: 0.8,
            gravityStrength: 0.04,
            alpha: 0.15,
            alphaDecay: 0.015,
            velocityDecay: 0.6,
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
        
        const colorClusterForce = () => {
            const strength = 0.6
            
            // Define sector angles for each color (pie chart layout)
            const colorSectors = new Map([
                ["#22c55e", 0],           // Green (Electric, Cycling) - Right
                ["#84cc16", Math.PI/2],   // Light green (Hybrid) - Top  
                ["#f59e0b", Math.PI],     // Orange (Petrol, Diesel) - Left
                ["#ef4444", 3*Math.PI/2]  // Red (Mid Petrol) - Bottom
            ])
            
            // Group nodes by color
            const colorGroups = d3.group(nodes, (d: SimulationNode) => d.fill)
            
            colorGroups.forEach((group, color) => {
                if (group.length <= 1) return
                
                // Get assigned sector angle for this color
                const sectorAngle = colorSectors.get(color) || 0
                
                // Calculate ideal sector position on circle edge
                const sectorRadius = radius * 0.7
                const sectorCenterX = centerX + sectorRadius * Math.cos(sectorAngle)
                const sectorCenterY = centerY + sectorRadius * Math.sin(sectorAngle)
                
                // Apply sector-based clustering force
                group.forEach((d: SimulationNode) => {
                    const dx = sectorCenterX - (d.x || 0)
                    const dy = sectorCenterY - (d.y || 0)
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1
                    const force = strength / Math.max(distance, 10)
                    
                    d.vx = (d.vx || 0) + dx * force * 0.3
                    d.vy = (d.vy || 0) + dy * force * 0.3
                })
                
                // Additional intra-group cohesion
                if (group.length > 1) {
                    const groupCentroidX = d3.mean(group, (d: SimulationNode) => d.x || 0) || centerX
                    const groupCentroidY = d3.mean(group, (d: SimulationNode) => d.y || 0) || centerY
                    
                    group.forEach((d: SimulationNode) => {
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

        this.simulation.force("colorCluster", colorClusterForce)
    }

    addBoundaryConstraint(onTick: (nodes: SimulationNode[]) => void) {
        if (!this.simulation) return

        const { centerX, centerY, radius } = this.config

        this.simulation.on("tick", () => {
            this.simulation!.nodes().forEach((d: SimulationNode) => {
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
        }
    }

    stop() {
        if (this.simulation) {
            this.simulation.stop()
        }
    }

    getSimulation() {
        return this.simulation
    }
}