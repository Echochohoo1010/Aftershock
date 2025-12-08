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
    // NEW: Geographic fields for network mode
    lat?: number
    lng?: number
    geoX?: number
    geoY?: number
    cityName?: string
    locationType?: 'urban_core' | 'town' | 'rural'
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