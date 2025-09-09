"use client"

import AgentVisualizationSelector from "@/components/visualizations/AgentVisualizationSelector"
import { ExploreIIIContent } from "../content/types"

interface ExploreIIITemplateProps {
  content: ExploreIIIContent
  caseId: string
}

export default function ExploreIIITemplate({ content, caseId }: ExploreIIITemplateProps) {
  return (
    <div className="min-h-full">
      <AgentVisualizationSelector 
        caseStudy={caseId}
        title="Agent-Based Simulation"
        width={600}
        height={420}
      />
    </div>
  )
}