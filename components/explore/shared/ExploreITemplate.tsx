"use client"

import CausalGraph from "@/components/causal-graph"
import EffectsPanel from "./EffectsPanel"
import { ExploreIContent } from "../content/types"

interface ExploreITemplateProps {
  content: ExploreIContent
  highlightedNode?: string | null
  highlightedRelationship?: { from: string; to: string } | null
}

export default function ExploreITemplate({ 
  content, 
  highlightedNode, 
  highlightedRelationship 
}: ExploreITemplateProps) {
  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Causal Graph - Left side */}
      <div className="flex-1 min-h-[400px]">
        <CausalGraph
          variables={content.variables}
          relationships={content.relationships}
          highlightedNode={highlightedNode}
          highlightedRelationship={highlightedRelationship}
        />
      </div>
      
      {/* Effects Panel - Right side */}
      <div className="w-full lg:w-96 overflow-y-auto max-h-[600px]">
        <EffectsPanel 
          effects={content.effects}
          recommendations={content.recommendations}
          title="Policy Impact Analysis"
        />
      </div>
    </div>
  )
}