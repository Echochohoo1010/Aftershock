"use client"

import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"

interface CausalGraphProps {
  variables: string[]
  relationships: Array<{
    from: string
    to: string
    strength: number
    type: "positive" | "negative" | "complex"
  }>
  highlightedNode?: string | null
  highlightedRelationship?: { from: string; to: string } | null
}

export default function CausalGraph({
  variables,
  relationships,
  highlightedNode,
  highlightedRelationship,
}: CausalGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedRelationship, setSelectedRelationship] = useState<{
    from: string
    to: string
    strength: number
    type: "positive" | "negative" | "complex"
    index: number
  } | null>(null)
  const [graphRelationships, setGraphRelationships] = useState(relationships)

  // Simple force-directed layout simulation
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})

  useEffect(() => {
    setGraphRelationships(relationships)
  }, [relationships])

  useEffect(() => {
    // Initialize node positions in a circle
    const centerX = 200
    const centerY = 200
    const radius = Math.min(120, 480 / variables.length)
    const angleStep = (2 * Math.PI) / variables.length

    const positions: Record<string, { x: number; y: number }> = {}
    variables.forEach((variable, index) => {
      const angle = index * angleStep
      positions[variable] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    })
    setNodePositions(positions)
  }, [variables])

  // Auto-highlight from chat
  useEffect(() => {
    if (highlightedNode) {
      setSelectedNode(highlightedNode)
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        setSelectedNode(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightedNode])

  useEffect(() => {
    if (highlightedRelationship) {
      const relationshipIndex = graphRelationships.findIndex(
        (rel) => rel.from === highlightedRelationship.from && rel.to === highlightedRelationship.to,
      )
      if (relationshipIndex !== -1) {
        setSelectedRelationship({
          ...graphRelationships[relationshipIndex],
          index: relationshipIndex,
        })
        // Clear highlight after 3 seconds
        const timer = setTimeout(() => {
          setSelectedRelationship(null)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [highlightedRelationship, graphRelationships])

  const getEdgeColor = (type: string, strength: number) => {
    const opacity = Math.abs(strength)
    if (type === "positive") return `rgba(34, 197, 94, ${opacity})`
    if (type === "negative") return `rgba(239, 68, 68, ${opacity})`
    return `rgba(168, 85, 247, ${opacity})`
  }

  const getArrowMarker = (type: string) => {
    if (type === "positive") return "url(#arrowhead-positive)"
    if (type === "negative") return "url(#arrowhead-negative)"
    return "url(#arrowhead-complex)"
  }

  const handleRelationshipClick = (rel: any, index: number) => {
    setSelectedRelationship({
      ...rel,
      index,
    })
  }

  const handleStrengthChange = (value: number[]) => {
    if (selectedRelationship) {
      const newStrength = value[0]
      const newType = newStrength > 0 ? "positive" : newStrength < 0 ? "negative" : "complex"

      const updatedRelationships = [...graphRelationships]
      updatedRelationships[selectedRelationship.index] = {
        ...selectedRelationship,
        strength: newStrength,
        type: newType as "positive" | "negative" | "complex",
      }

      setGraphRelationships(updatedRelationships)
      setSelectedRelationship({
        ...selectedRelationship,
        strength: newStrength,
        type: newType as "positive" | "negative" | "complex",
      })
    }
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-gray-50">
      <div className="h-96">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400">
          {/* Arrow markers */}
          <defs>
            <marker
              id="arrowhead-positive"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L9,5 L0,10 Q2,5 0,0" fill="rgb(34, 197, 94)" />
            </marker>

            <marker
              id="arrowhead-negative"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L9,5 L0,10 Q2,5 0,0" fill="rgb(239, 68, 68)" />
            </marker>

            <marker
              id="arrowhead-complex"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L9,5 L0,10 Q2,5 0,0" fill="rgb(168, 85, 247)" />
            </marker>

            {/* Highlight glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {graphRelationships.map((rel, index) => {
            const fromPos = nodePositions[rel.from]
            const toPos = nodePositions[rel.to]
            if (!fromPos || !toPos) return null

            const r = 15 // fixed radius for all nodes

            const dx = toPos.x - fromPos.x
            const dy = toPos.y - fromPos.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            const offsetX = (dx / dist) * r
            const offsetY = (dy / dist) * r

            const adjustedToX = toPos.x - offsetX
            const adjustedToY = toPos.y - offsetY

            const isSelected =
              selectedRelationship && selectedRelationship.from === rel.from && selectedRelationship.to === rel.to

            const isHighlighted =
              highlightedRelationship &&
              highlightedRelationship.from === rel.from &&
              highlightedRelationship.to === rel.to

            return (
              <g key={index} onClick={() => handleRelationshipClick(rel, index)} className="cursor-pointer">
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={adjustedToX}
                  y2={adjustedToY}
                  stroke={getEdgeColor(rel.type, rel.strength)}
                  strokeWidth={Math.abs(rel.strength) * 3 + (isSelected || isHighlighted ? 3 : 1)}
                  markerEnd={getArrowMarker(rel.type)}
                  strokeDasharray={isSelected || isHighlighted ? "5,5" : "none"}
                  filter={isHighlighted ? "url(#glow)" : "none"}
                  className={isHighlighted ? "animate-pulse" : ""}
                />
                <text
                  x={(fromPos.x + adjustedToX) / 2}
                  y={(fromPos.y + adjustedToY) / 2 - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={
                    rel.strength > 0 ? "rgb(34, 197, 94)" : rel.strength < 0 ? "rgb(239, 68, 68)" : "rgb(168, 85, 247)"
                  }
                  fontWeight={isSelected || isHighlighted ? "bold" : "normal"}
                  className={isHighlighted ? "animate-pulse" : ""}
                >
                  {rel.strength.toFixed(1)}
                </text>
              </g>
            )
          })}

          {/* Nodes */}
          {variables.map((variable) => {
            const pos = nodePositions[variable]
            if (!pos) return null

            const isSelected = selectedNode === variable
            const isHighlighted = highlightedNode === variable
            const displayName = variable.replace(/_/g, " ")

            return (
              <g key={variable}>
                <text
                  x={pos.x}
                  y={pos.y - 20}
                  textAnchor="middle"
                  className="text-xs font-medium pointer-events-none"
                  fill={isSelected || isHighlighted ? "#000" : "#666"}
                  fontWeight={isHighlighted ? "bold" : "normal"}
                >
                  {displayName}
                </text>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected || isHighlighted ? 18 : 12}
                  fill={isSelected || isHighlighted ? "#000" : "#fff"}
                  stroke="#000"
                  strokeWidth={isHighlighted ? "3" : "1.4"}
                  className={`cursor-pointer transition-all ${isHighlighted ? "animate-pulse" : ""}`}
                  onClick={() => setSelectedNode(isSelected ? null : variable)}
                  filter={isHighlighted ? "url(#glow)" : "none"}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend and Pathway Controllers */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
              <span>Positive Effect</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
              <span>Negative Effect</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-purple-500 mr-2"></div>
              <span>Complex Effect</span>
            </div>
          </div>
          {(selectedNode || highlightedNode) && (
            <div className="text-gray-600">
              {highlightedNode ? "Highlighted" : "Selected"}:{" "}
              <span className="font-medium">{(selectedNode || highlightedNode)?.replace(/_/g, " ")}</span>
            </div>
          )}
        </div>

        {/* Pathway Controllers */}
        {selectedRelationship && (
          <div className="border-t pt-3 mt-2">
            <div className="text-xs font-medium mb-2">
              Adjust Relationship: {selectedRelationship.from.replace(/_/g, " ")} →{" "}
              {selectedRelationship.to.replace(/_/g, " ")}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-red-500">-1</div>
              <div className="flex-1">
                <Slider
                  value={[selectedRelationship.strength]}
                  min={-1}
                  max={1}
                  step={0.1}
                  onValueChange={handleStrengthChange}
                />
              </div>
              <div className="text-xs text-green-500">+1</div>
              <div
                className={`text-xs font-mono px-2 py-1 rounded ${
                  selectedRelationship.strength > 0
                    ? "bg-green-100 text-green-800"
                    : selectedRelationship.strength < 0
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedRelationship.strength.toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
