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
        </defs>

        {/* Edges */}
        {relationships.map((rel, index) => {
          const fromPos = nodePositions[rel.from]
          const toPos = nodePositions[rel.to]
          if (!fromPos || !toPos) return null



          const r = 20 // fixed radius for all nodes

          const dx = toPos.x - fromPos.x
          const dy = toPos.y - fromPos.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          const offsetX = (dx / dist) * r
          const offsetY = (dy / dist) * r

          const adjustedToX = toPos.x - offsetX
          const adjustedToY = toPos.y - offsetY

          return (
            <line
              key={index}
              x1={fromPos.x}
              y1={fromPos.y}
            x2={adjustedToX}
    y2={adjustedToY}
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
            <text
                x={pos.x - 4}
                y={pos.y - 24}
                textAnchor="middle"
                className="text-xs w-fit font-medium pointer-events-none"
                fill={isSelected ? "#666" : "#000"}
              >
                {variable.replace("_", " ").split()}
              </text>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 25 : 20}
                fill={isSelected ? "#000" : "#fff"}
                stroke="#000"
                strokeWidth="1.4"
                className="cursor-pointer transition-all"
                onClick={() => setSelectedNode(isSelected ? null : variable)}
              />
              
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
