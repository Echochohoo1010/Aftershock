// Shared types for simulation and visualization components

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

export interface AgentType {
    color: string
    emissionLevel: number
    displayName: string
}

export interface SimulationFrameData {
    t: string
    agents: Array<{
        id: number
        type: string
        emission_level: number
    }>
    adoptionRate?: number
}

export interface ReactionEvent {
    id: string
    title: string
    description: string
    type: "positive" | "negative" | "neutral" | "alert"
    timestamp: Date
    magnitude: number
}