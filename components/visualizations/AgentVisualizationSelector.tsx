"use client"

import { useMemo } from "react"
import CarbonPricingVisualization from "./carbon-pricing/CarbonPricingVisualization"
import GenericVisualization from "./generic/GenericVisualization"
import { GenericFrameData } from "./generic/GenericTypes"

interface AgentVisualizationSelectorProps {
    caseStudy?: string
    data?: GenericFrameData[]
    title?: string
    width?: number
    height?: number
}

export default function AgentVisualizationSelector({
    caseStudy,
    data = [],
    title,
    width = 600,
    height = 600
}: AgentVisualizationSelectorProps) {
    const visualizationType = useMemo(() => {
        if (caseStudy?.toLowerCase().includes('carbon') || 
            caseStudy?.toLowerCase().includes('pricing') ||
            caseStudy?.toLowerCase().includes('netherlands') ||
            caseStudy?.toLowerCase().includes('transport')) {
            return 'carbon-pricing'
        }
        return 'generic'
    }, [caseStudy])

    if (visualizationType === 'carbon-pricing') {
        return (
            <CarbonPricingVisualization
                title={title || "Netherlands Carbon Pricing Agent Model"}
                width={width}
                height={height}
            />
        )
    }

    return (
        <GenericVisualization
            data={data}
            title={title || "Agent-Based Simulation"}
            width={width}
            height={height}
            showAdoptionRate={false}
            enableColorClustering={false}
        />
    )
}

export const isCarbonPricingContext = (caseStudy?: string): boolean => {
    if (!caseStudy) return false
    
    const carbonPricingKeywords = [
        'carbon', 'pricing', 'netherlands', 'transport', 
        'emission', 'vehicle', 'electric', 'hybrid'
    ]
    
    const lowerCase = caseStudy.toLowerCase()
    return carbonPricingKeywords.some(keyword => lowerCase.includes(keyword))
}