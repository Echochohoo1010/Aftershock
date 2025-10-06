"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CausalGraph from "@/components/features/visualization/causal/causal-graph"
import ChainReactionPanel from "@/components/chain-reaction-panel"
import ScenarioChat from "@/components/features/chat/scenario-chat"
import PureBubbleCanvas from "@/components/features/visualization/agents/PureBubbleCanvas"
import ExploreContainer from "@/components/explore/ExploreContainer"
import SimulationControls from "@/components/features/visualization/simulation/SimulationControls"
import AgentLegend from "@/components/visualizations/shared/AgentLegend"
import { AGENT_TYPES } from "@/components/shared/constants/agentTypes"
import { Share2, Shapes, FileText, Users, Maximize2, Minimize2, Eye, EyeOff } from "lucide-react"
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

  // Simulation control state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(120)
  const [frames, setFrames] = useState<any[]>([])
  const [isRunningSimulation, setIsRunningSimulation] = useState(false)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Card visibility state
  const [showCausalGraph, setShowCausalGraph] = useState(true)
  const [showSimulationControls, setShowSimulationControls] = useState(true)
  const [showPolicyAssistant, setShowPolicyAssistant] = useState(true)

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

  // Load simulation data on component mount
  useEffect(() => {
    async function loadSimulationData() {
      try {
        const response = await fetch('/simulation_data.json')
        if (response.ok) {
          const result = await response.json()
          if (Array.isArray(result)) {
            setFrames(result)
            setTotalFrames(result.length)
          }
        }
      } catch (error) {
        console.error('Failed to load simulation data:', error)
      }
    }
    loadSimulationData()
  }, [])

  // Animation control functions
  const handlePlay = useCallback(() => {
    if (currentFrame >= totalFrames - 1) {
      setCurrentFrame(0) // Reset to beginning if at end
    }
    setIsPlaying(true)
  }, [currentFrame, totalFrames])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const handleReset = useCallback(async () => {
    setIsPlaying(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    
    // Run new simulation
    setIsRunningSimulation(true)
    try {
      const response = await fetch('/api/run-simulation-js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_agents: 100, duration_months: 120 })
      })
      
      if (response.ok) {
        // Reload the simulation data
        const dataResponse = await fetch('/simulation_data.json')
        if (dataResponse.ok) {
          const result = await dataResponse.json()
          if (Array.isArray(result)) {
            setFrames(result)
            setTotalFrames(result.length)
            setCurrentFrame(0)
            setIsPlaying(true) // Auto-start after reset
          }
        }
      }
    } catch (error) {
      console.error('Failed to run new simulation:', error)
    } finally {
      setIsRunningSimulation(false)
    }
  }, [])

  const handleScrub = useCallback((frameIndex: number) => {
    setCurrentFrame(frameIndex)
    setIsPlaying(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // Animation loop (0.4s per month)
  useEffect(() => {
    if (isPlaying && !isRunningSimulation) {
      animationRef.current = setTimeout(() => {
        setCurrentFrame(prev => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 400) // 0.4 seconds per month
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPlaying, currentFrame, totalFrames, isRunningSimulation])

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
            currentFrame={currentFrame}
            onFrameUpdate={(frame) => setCurrentFrame(frame)}
          />
        </div>
      </div>

      {/* Agent Legend - Top Center */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 mt-1">
        <AgentLegend agentTypes={AGENT_TYPES} />
      </div>

      {/* Causal Graph - Bottom Left (original card) */}
      <div className="absolute bottom-4 left-4 z-50">
        <Card className="w-96 h-106 overflow-hidden shadow-md">
          <div className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Causal Graph</h3>
              <button
                onClick={() => setShowCausalGraph(!showCausalGraph)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label={showCausalGraph ? "Hide causal graph" : "Show causal graph"}
              >
                {showCausalGraph ? (
                  <Eye className="w-4 h-4 text-gray-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            {showCausalGraph && (
              <div className="h-full">
                <CausalGraph
                  variables={variables}
                  relationships={relationships}
                  highlightedNode={highlightedNode}
                  highlightedRelationship={highlightedRelationship}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Simulation Controls - Bottom Center (original card) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <SimulationControls
          isPlaying={isPlaying}
          currentFrame={currentFrame}
          totalFrames={totalFrames}
          currentFrameData={{
            t: frames[currentFrame]?.t || `Year ${Math.floor(currentFrame/12)}, Month ${(currentFrame % 12) + 1}`,
            adoptionRate: frames[currentFrame]?.adoptionRate || 0
          }}
          runningSimulation={isRunningSimulation}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onScrub={handleScrub}
        />
      </div>

      {/* Policy Assistant - Right Side (full height) */}
      <div className="absolute top-4 right-4 bottom-4 z-50">
        <Card className="w-96 h-full overflow-hidden shadow-md">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">Policy Assistant</h2>
              <button
                onClick={() => setShowPolicyAssistant(!showPolicyAssistant)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label={showPolicyAssistant ? "Hide policy assistant" : "Show policy assistant"}
              >
                {showPolicyAssistant ? (
                  <Eye className="w-4 h-4 text-gray-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            {showPolicyAssistant && (
              <p className="text-sm text-gray-600">
                Ask questions about policy impacts and explore scenarios
              </p>
            )}
          </div>
          {showPolicyAssistant && (
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
          )}
        </Card>
      </div>
    </div>
  )
}