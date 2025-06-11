"use client"

import { useEffect, useRef, useState } from "react"

interface CausalGraphProps {
  variables: string[]
  relationships: Array<{
    from: string
    to: string
    strength: number
    type: "positive" | "negative" | "complex"
  }>
}

export default function CausalGraph({ variables, relationships }: CausalGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Simple force-directed layout simulation
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})

  useEffect(() => {
    // Initialize node positions in a circle
    const centerX = 200
    const centerY = 150
    const radius = 100
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

  return (
    <div className="w-full h-80 border border-gray-200 rounded-lg bg-gray-50">
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 300">
        {/* Arrow markers */}
        <defs>
          <marker id="arrowhead-positive" markerWidth="4" markerHeight="4" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 4 3.5, 0 7" fill="rgb(34, 197, 94)" />
          </marker>
          <marker id="arrowhead-negative" markerWidth="4" markerHeight="4" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 4 3.5, 0 7" fill="rgb(239, 68, 68)" />
          </marker>
          <marker id="arrowhead-complex" markerWidth="4" markerHeight="4" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 4 3.5, 0 7" fill="rgb(168, 85, 247)" />
          </marker>
        </defs>

        {/* Edges */}
        {relationships.map((rel, index) => {
          const fromPos = nodePositions[rel.from]
          const toPos = nodePositions[rel.to]
          if (!fromPos || !toPos) return null

          return (
            <line
              key={index}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={getEdgeColor(rel.type, rel.strength)}
              strokeWidth={Math.abs(rel.strength) * 2 + 1}
              markerEnd={getArrowMarker(rel.type)}
            />
          )
        })}

        {/* Nodes */}
        {variables.map((variable) => {
          const pos = nodePositions[variable]
          if (!pos) return null

          const isSelected = selectedNode === variable
          return (
            <g key={variable}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 25 : 20}
                fill={isSelected ? "#000" : "#fff"}
                stroke="#000"
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onClick={() => setSelectedNode(isSelected ? null : variable)}
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                className="text-xs font-medium pointer-events-none"
                fill={isSelected ? "#fff" : "#000"}
              >
                {variable.replace("_", " ").slice(0, 8)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-xs">
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
          {selectedNode && (
            <div className="text-gray-600">
              Selected: <span className="font-medium">{selectedNode.replace("_", " ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
