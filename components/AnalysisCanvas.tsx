"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CausalGraph from "@/components/causal-graph"
import ChainReactionPanel from "@/components/chain-reaction-panel"
import ScenarioChat from "@/components/scenario-chat"
import PureBubbleCanvas from "@/components/PureBubbleCanvas"
import ExploreContainer from "@/components/explore/ExploreContainer"
import SimulationControls from "@/components/visualizations/shared/SimulationControls"
import { Share2, Shapes, FileText, Users, Maximize2, Minimize2 } from "lucide-react"
import { CaseId } from "@/components/explore/content/types"

// Interface for chain reaction events
interface ReactionEvent {
  id: string
  title: string
  description: string
  type: "positive" | "negative" | "neutral" | "alert"
  timestamp: Date
  magnitude: number
}

interface AnalysisCanvasProps {
  policyTitle: string
  policyDescription: string
  variables: string[]
  relationships: Array<{
    from: string
    to: string
    strength: number
    type: "positive" | "negative" | "complex"
  }>
  selectedCase: CaseId | null
  activeTab: "explore1" | "explore2" | "explore3"
  setActiveTab: (tab: "explore1" | "explore2" | "explore3") => void
  highlightedNode: string | null
  highlightedRelationship: { from: string; to: string } | null
  selectedEvent: ReactionEvent | null
  onEventSelect: (event: ReactionEvent) => void
  onHighlightNode: (variable: string | null) => void
  onHighlightRelationship: (from: string, to: string) => void
  onUpdateGraph: (newRelationships: Array<{ from: string; to: string; strength: number; type: string }>) => void
  quickTags: string[]
  generateEventAnalysis: (event: ReactionEvent) => string
  onChatUpdate: (messages: Array<{ role: string, content: string }>) => void
}

export default function AnalysisCanvas({
  policyTitle,
  policyDescription,
  variables,
  relationships,
  selectedCase,
  activeTab,
  setActiveTab,
  highlightedNode,
  highlightedRelationship,
  selectedEvent,
  onEventSelect,
  onHighlightNode,
  onHighlightRelationship,
  onUpdateGraph,
  quickTags,
  generateEventAnalysis,
  onChatUpdate
}: AnalysisCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Zoom and pan functionality
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newScale = Math.min(Math.max(0.1, canvasTransform.scale + delta), 3)
    
    setCanvasTransform(prev => ({
      ...prev,
      scale: newScale
    }))
  }, [canvasTransform.scale])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y })
    }
  }, [canvasTransform.x, canvasTransform.y])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setCanvasTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }))
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
    }
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel)
      }
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleWheel, handleMouseMove, handleMouseUp, isDragging])


  return (
    <div className="fixed inset-0 top-16 overflow-hidden bg-white">
      {/* Full-Screen Agent Bubble Canvas Background */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`
        }}
      >
        {/* Agent Bubble Visualization as Background - Pure visualization only */}
        <div className="w-full h-full">
          <PureBubbleCanvas
            width={typeof window !== 'undefined' ? window.innerWidth : 1920}
            height={typeof window !== 'undefined' ? window.innerHeight : 1080}
          />
        </div>
      </div>


      {/* Causal Graph - Bottom Left (original card) */}
      <div className="absolute bottom-4 left-4 z-50">
        <Card className="w-96 h-106 overflow-hidden shadow-md">
          <div className="p-4 h-full">
            <h3 className="text-xl font-bold mb-4">Causal Graph</h3>
            <div className="h-full">
              <CausalGraph
                variables={variables}
                relationships={relationships}
                highlightedNode={highlightedNode}
                highlightedRelationship={highlightedRelationship}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Simulation Controls - Bottom Center (original card) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <SimulationControls
          isPlaying={false}
          currentFrame={0}
          totalFrames={120}
          currentFrameData={{
            t: "Year 0, Month 12",
            adoptionRate: 0.6
          }}
          runningSimulation={false}
          onPlay={() => {}}
          onPause={() => {}}
          onReset={() => {}}
          onScrub={() => {}}
        />
      </div>

      {/* Policy Assistant - Right Side (full height) */}
      <div className="absolute top-4 right-4 bottom-4 z-50">
        <Card className="w-96 h-full overflow-hidden shadow-md">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-xl font-bold">Policy Assistant</h2>
            <p className="text-sm text-gray-600">
              Ask questions about policy impacts and explore scenarios
            </p>
          </div>
          <div className="h-[calc(100%-140px)]">
            <ScenarioChat
              scenario={{
                id: "1",
                title: policyTitle,
                description: policyDescription,
                variables: variables,
              }}
              onHighlightNode={onHighlightNode}
              onHighlightRelationship={onHighlightRelationship}
              onUpdateGraph={onUpdateGraph}
              selectedEvent={selectedEvent}
              generateEventAnalysis={generateEventAnalysis}
              activeSimulator={activeTab}
              onChangeSimulator={setActiveTab}
              onChatUpdate={onChatUpdate}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}