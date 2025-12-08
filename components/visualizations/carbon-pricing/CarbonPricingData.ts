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
            console.log('No existing simulation data found, will need to run simulation first')
            return []
        }
        
        const rawData = await response.json()
        
        if (!Array.isArray(rawData) || rawData.length === 0) {
            console.log('Empty or invalid simulation data, will need to run simulation')
            return []
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
        console.log('Error loading carbon pricing data, will need to run simulation first:', error)
        return []
    }
}

function getEmissionLevelFromType(vehicleType: string): number {
    const emissionLevels: Record<string, number> = {
        "Cycling": 1,
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
    
    const cleanTransportTypes = ["Cycling", "BEV-M", "HEV-S"]
    const cleanCount = agents.filter(agent => 
        cleanTransportTypes.includes(agent.type)
    ).length
    
    return cleanCount / agents.length
}