"use client"

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
      {/* Variable Relationships - Placeholder for future implementation */}
      <div className="flex-1 min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Variable relationships visualization - Coming soon</p>
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