// Agent types configuration used across the application
// "Sunset to Forest" color spectrum
export const AGENT_TYPES = {
    "Cycling": { color: "#0891b2", emissionLevel: 1, displayName: "Cycling" }, // Cyan 600 - hollow ring
    "BEV-M": { color: "#059669", emissionLevel: 1, displayName: "Mid-size Electric Cars" }, // Emerald 600
    "HEV-S": { color: "#d97706", emissionLevel: 2, displayName: "Hybrid Electric Vehicle" }, // Amber 600
    "ICE-S": { color: "#be123c", emissionLevel: 3, displayName: "Small Petrol Cars" }, // Rose 700
    "DIE-M": { color: "#c2410c", emissionLevel: 3, displayName: "Mid Diesel Cars" }, // Orange 700
    "ICE-M": { color: "#be123c", emissionLevel: 4, displayName: "Mid Petrol Cars" } // Rose 700
} as const;

// Map simulation vehicle types to display names
export const mapVehicleType = (vehicleType: string): string => {
    const mapping: { [key: string]: string } = {
        "BEV-M": "BEV-M",
        "HEV-S": "HEV-S",
        "ICE-S": "ICE-S",
        "ICE-M": "ICE-M",
        "DIE-M": "DIE-M",
        "Cycling": "Cycling"
    }
    return mapping[vehicleType] || vehicleType
}

export const getEmissionLevel = (vehicleType: string, providedLevel?: number): number => {
    // Use provided level if valid
    if (providedLevel !== undefined && providedLevel !== null && providedLevel > 0) {
        return providedLevel
    }

    // Fall back to vehicle type config
    const agentConfig = AGENT_TYPES[vehicleType as keyof typeof AGENT_TYPES]
    if (agentConfig) {
        return agentConfig.emissionLevel
    }

    // Log warning for debugging
    console.warn(`Missing emission level for ${vehicleType}, using default: 3`)
    return 3
}