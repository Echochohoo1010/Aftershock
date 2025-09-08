"use client"

import { useState, useEffect } from "react"
import ExploreITemplate from "./shared/ExploreITemplate"
import ExploreIITemplate from "./shared/ExploreIITemplate"
import ExploreIIITemplate from "./shared/ExploreIIITemplate"
import ContextCard from "./shared/ContextCard"
import { CaseContent, CaseId, ReactionEvent } from "./content/types"
import { loadCaseContent } from "./content/loader"

interface ExploreContainerProps {
  caseId: CaseId
  activeTab: "explore1" | "explore2" | "explore3"
  highlightedNode?: string | null
  highlightedRelationship?: { from: string; to: string } | null
  selectedEvent?: ReactionEvent | null
  onEventSelect?: (event: ReactionEvent) => void
}

export default function ExploreContainer({
  caseId,
  activeTab,
  highlightedNode,
  highlightedRelationship,
  selectedEvent,
  onEventSelect
}: ExploreContainerProps) {
  const [caseContent, setCaseContent] = useState<CaseContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)
        setError(null)
        const content = await loadCaseContent(caseId)
        setCaseContent(content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load case content')
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [caseId])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Loading case content...</div>
        </div>
      </div>
    )
  }

  if (error || !caseContent) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-destructive">Error: {error || 'Case content not found'}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getTabDescription = () => {
    switch (activeTab) {
      case "explore1":
        return "Visualize and modify causal relationships between variables"
      case "explore2":
        return "Monitor real-time system responses to policy changes"
      case "explore3":
        return "Force-directed agent-based model with collision physics"
      default:
        return ""
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "explore1":
        return "Causal Graph"
      case "explore2":
        return "Chain Reactions"
      case "explore3":
        return "Agent Dynamics"
      default:
        return ""
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with context */}
      <div className="p-4 border-b bg-background">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{getTabTitle()}</h2>
            <p className="text-sm text-gray-600">{getTabDescription()}</p>
          </div>
        </div>
        
        {/* Context Card */}
        <ContextCard context={caseContent.context} />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === "explore1" && (
          <ExploreITemplate
            content={caseContent.exploreI}
            highlightedNode={highlightedNode}
            highlightedRelationship={highlightedRelationship}
          />
        )}
        
        {activeTab === "explore2" && (
          <ExploreIITemplate
            content={caseContent.exploreII}
            selectedEvent={selectedEvent}
            onEventSelect={onEventSelect}
          />
        )}
        
        {activeTab === "explore3" && (
          <ExploreIIITemplate
            content={caseContent.exploreIII}
            caseId={caseId}
          />
        )}
      </div>
    </div>
  )
}