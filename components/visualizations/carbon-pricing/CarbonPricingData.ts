import { CarbonPricingFrameData, mapVehicleType } from "./CarbonPricingTypes"

export async function runCarbonPricingSimulation(): Promise<void> {
    const response = await fetch('/api/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`)
    }
    
    await response.json()
}

export async function loadCarbonPricingData(): Promise<CarbonPricingFrameData[]> {
    try {
        const response = await fetch('/simulation_data.json')
        if (!response.ok) {
            throw new Error('Failed to load simulation data')
        }
        
        const rawData = await response.json()
        
        if (!Array.isArray(rawData)) {
            throw new Error('Invalid simulation data format')
        }
        
        return rawData.map(frame => ({
            t: frame.t || `Month ${frame.month || 0}`,
            agents: (frame.agents || []).map((agent: any) => ({
                id: agent.id,
                type: mapVehicleType(agent.type),
                emission_level: agent.emission_level || getEmissionLevelFromType(agent.type)
            })),
            adoptionRate: calculateAdoptionRate(frame.agents || [])
        }))
    } catch (error) {
        console.error('Error loading carbon pricing data:', error)
        return []
    }
}

function getEmissionLevelFromType(vehicleType: string): number {
    const emissionLevels: Record<string, number> = {
        "Cycling/Walking": 1,
        "BEV-M": 1,
        "HEV-S": 2,
        "ICE-S": 3,
        "DIE-M": 3,
        "ICE-M": 4
    }
    return emissionLevels[vehicleType] || 4
}

function calculateAdoptionRate(agents: any[]): number {
    if (!agents.length) return 0
    
    const cleanTransportTypes = ["Cycling/Walking", "BEV-M", "HEV-S"]
    const cleanCount = agents.filter(agent => 
        cleanTransportTypes.includes(agent.type)
    ).length
    
    return cleanCount / agents.length
}