// Agent types configuration used across the application
export const AGENT_TYPES = {
    "Cycling/Walking": { color: "#22c55e", emissionLevel: 1, displayName: "Cycling/Walking" },
    "BEV-M": { color: "#22c55e", emissionLevel: 1, displayName: "Mid-size Electric Cars" },
    "HEV-S": { color: "#84cc16", emissionLevel: 2, displayName: "Hybrid Electric Vehicle" },
    "ICE-S": { color: "#f59e0b", emissionLevel: 3, displayName: "Small Petrol Cars" },
    "DIE-M": { color: "#f59e0b", emissionLevel: 3, displayName: "Mid Diesel Cars" },
    "ICE-M": { color: "#ef4444", emissionLevel: 4, displayName: "Mid Petrol Cars" }
} as const;

// Map simulation vehicle types to display names
export const mapVehicleType = (vehicleType: string): string => {
    const mapping: { [key: string]: string } = {
        "BEV-M": "BEV-M",
        "HEV-S": "HEV-S", 
        "ICE-S": "ICE-S",
        "ICE-M": "ICE-M",
        "DIE-M": "DIE-M",
        "Cycling/Walking": "Cycling/Walking"
    }
    return mapping[vehicleType] || vehicleType
}

export const getEmissionLevel = (vehicleType: string, providedLevel?: number): number => {
    if (providedLevel !== undefined) return providedLevel
    const agentConfig = AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]
    return agentConfig?.emissionLevel || 3
}