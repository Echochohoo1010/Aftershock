import { AgentType } from "../shared/AgentLegend"

export const DEFAULT_AGENT_TYPES: Record<string, AgentType> = {
    "Type A": { 
        color: "#22c55e", 
        emissionLevel: 1, 
        displayName: "Low Impact" 
    },
    "Type B": { 
        color: "#84cc16", 
        emissionLevel: 2, 
        displayName: "Medium-Low Impact" 
    },
    "Type C": { 
        color: "#f59e0b", 
        emissionLevel: 3, 
        displayName: "Medium-High Impact" 
    },
    "Type D": { 
        color: "#ef4444", 
        emissionLevel: 4, 
        displayName: "High Impact" 
    }
}

export interface GenericAgent {
    id: number
    type: string
    emission_level?: number
}

export interface GenericFrameData {
    t: string
    agents: GenericAgent[]
    adoptionRate?: number
}

export function createAgentTypesFromData(data: GenericFrameData[]): Record<string, AgentType> {
    if (!data.length) return DEFAULT_AGENT_TYPES
    
    const allTypes = new Set<string>()
    data.forEach(frame => {
        frame.agents.forEach(agent => {
            allTypes.add(agent.type)
        })
    })
    
    const colors = ["#22c55e", "#84cc16", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#10b981"]
    const typeArray = Array.from(allTypes).sort()
    
    const agentTypes: Record<string, AgentType> = {}
    typeArray.forEach((type, index) => {
        agentTypes[type] = {
            color: colors[index % colors.length],
            emissionLevel: Math.min(4, Math.floor(index / 2) + 1),
            displayName: type
        }
    })
    
    return agentTypes
}