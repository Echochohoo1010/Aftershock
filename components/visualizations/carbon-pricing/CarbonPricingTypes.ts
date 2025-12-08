import { AgentType } from "../shared/AgentLegend"

export const CARBON_PRICING_AGENT_TYPES: Record<string, AgentType> = {
    "Cycling": { 
        color: "#22c55e", 
        emissionLevel: 1, 
        displayName: "Cycling" 
    },
    "BEV-M": { 
        color: "#22c55e", 
        emissionLevel: 1, 
        displayName: "Mid-size Electric Cars" 
    },
    "HEV-S": { 
        color: "#84cc16", 
        emissionLevel: 2, 
        displayName: "Hybrid Electric Vehicle" 
    },
    "ICE-S": { 
        color: "#f59e0b", 
        emissionLevel: 3, 
        displayName: "Small Petrol Cars" 
    },
    "DIE-M": { 
        color: "#f59e0b", 
        emissionLevel: 3, 
        displayName: "Mid Diesel Cars" 
    },
    "ICE-M": { 
        color: "#ef4444", 
        emissionLevel: 4, 
        displayName: "Mid Petrol Cars" 
    }
}

export interface CarbonPricingAgent {
    id: number
    type: keyof typeof CARBON_PRICING_AGENT_TYPES
    emission_level: number
}

export interface CarbonPricingFrameData {
    t: string
    agents: CarbonPricingAgent[]
    adoptionRate?: number
}

export const mapVehicleType = (vehicleType: string): keyof typeof CARBON_PRICING_AGENT_TYPES => {
    const mapping: Record<string, keyof typeof CARBON_PRICING_AGENT_TYPES> = {
        "BEV-M": "BEV-M",
        "HEV-S": "HEV-S", 
        "ICE-S": "ICE-S",
        "DIE-M": "DIE-M",
        "ICE-M": "ICE-M",
        "Cycling": "Cycling"
    }
    return mapping[vehicleType] || "ICE-M"
}