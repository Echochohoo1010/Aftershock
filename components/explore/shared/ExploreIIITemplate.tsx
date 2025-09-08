"use client"

import AgentVisualizationSelector from "@/components/visualizations/AgentVisualizationSelector"
import { ExploreIIIContent } from "../content/types"

interface ExploreIIITemplateProps {
  content: ExploreIIIContent
  caseId: string
}

export default function ExploreIIITemplate({ content, caseId }: ExploreIIITemplateProps) {
  return (
    <div className="h-full">
      <AgentVisualizationSelector 
        selectedCase={caseId}
        agentTypes={content.agentTypes}
        simulationDescription={content.simulationParams.description}
        customPhysicsConfig={content.physicsConfig}
      />
    </div>
  )
}