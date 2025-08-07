"use client"

import { StoryNode } from "@/lib/universe"
import { Button } from "./ui/button"

interface BranchingTimelineProps {
    currentNode: StoryNode
    storyPath: StoryNode[]
    onDecisionClick?: (decisionPoint: number) => void
    onGeneratePDF?: () => void
}

export default function BranchingTimeline({ currentNode, storyPath, onDecisionClick, onGeneratePDF }: BranchingTimelineProps) {
    if (!currentNode) return null

    // Calculate dynamic dimensions based on story data
    const numChoices = currentNode.choices.length
    const pathLength = storyPath.length
    const svgHeight = Math.max(200, 120 + (numChoices * 40))
    const svgWidth = Math.max(600, 200 + (pathLength * 100) + 300)

    return (
        <div className="w-full space-y-4">
            {/* Compact Story Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Current Status */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Current Scenario</h4>
                    <p className="text-sm text-gray-600 mb-3">{currentNode.title}</p>
                    <div className="flex justify-between text-xs">
                        <span className="text-blue-600">T+{currentNode.worldState.t}m</span>
                        <span className="text-green-600">C: {currentNode.worldState.compute > 0 ? '+' : ''}{currentNode.worldState.compute}%</span>
                        <span className="text-red-600">U: {currentNode.worldState.unemployment > 0 ? '+' : ''}{currentNode.worldState.unemployment}%</span>
                    </div>
                </div>

                {/* Path Progress */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Journey Progress</h4>
                    <div className="flex items-center space-x-2 mb-2">
                        {storyPath.slice(-3).map((node, index) => (
                            <div key={node.id} className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                    {storyPath.length - 2 + index}
                                </div>
                                {index < 2 && <div className="w-4 h-px bg-gray-300"></div>}
                            </div>
                        ))}
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {storyPath.length + 1}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">{storyPath.length + 1} decisions made</p>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Actions</h4>
                    <div className="space-y-2">
                        <Button
                            onClick={onGeneratePDF}
                            className="w-full  text-white px-3 py-2   text-sm font-medium transition-colors"
                        >
                            Generate PDF
                        </Button>
                        <div className="text-xs text-gray-500">
                            {numChoices} future paths available
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Branching Visualization */}
            <div className=" p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold  ">Scenario Branches</h4>
                    <div className="text-sm  ">
                        {currentNode.worldState.geopolitics}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-h-[200px]">
                        {/* Arrow marker definition */}
                        <defs>
                            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
                            </marker>
                        </defs>

                        {/* Dynamic timeline based on story path */}
                        <line
                            x1="40"
                            y1={svgHeight - 40}
                            x2={svgWidth - 100}
                            y2={svgHeight - 40}
                            stroke="black"
                            strokeWidth="1"
                            markerEnd="url(#arrowhead)"
                        />

                        {/* Story path nodes */}
                        {storyPath.map((node, index) => {
                            const x = 60 + (index * 80)
                            const y = svgHeight - 40

                            return (
                                <g key={node.id}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="6"
                                        fill="green"
                                        stroke="#FFF"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={x}
                                        y={y - 15}
                                        textAnchor="middle"
                                        className="text-xs fill-gray-600"
                                    >
                                        {node.title.slice(0, 10)}...
                                    </text>
                                </g>
                            )
                        })}

                        {/* Current node */}
                        <g>
                            <circle
                                cx={60 + (storyPath.length * 80)}
                                cy={svgHeight - 40}
                                r="8"
                                fill="green"
                                stroke="#FFF"
                                strokeWidth="3"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onDecisionClick && onDecisionClick(storyPath.length + 1)}
                            />
                            <text
                                x={60 + (storyPath.length * 80)}
                                y={svgHeight - 55}
                                textAnchor="middle"
                                className="text-xs fill-red-600 font-semibold"
                            >
                                You are here
                            </text>
                        </g>

                        {/* Future choice branches */}
                        {currentNode.choices.map((choice, index) => {
                            const startX = 60 + (storyPath.length * 80)
                            const startY = svgHeight - 40
                            const endX = svgWidth - 80
                            const endY = 40 + (index * (svgHeight - 80) / Math.max(1, numChoices - 1))
                            const midX = startX + (endX - startX) * 0.6

                            return (
                                <g key={choice.id}>
                                    {/* Curved branch path */}
                                    <path
                                        d={`M ${startX} ${startY} Q ${midX} ${startY - 30} ${endX} ${endY}`}
                                        stroke="green"
                                        strokeWidth="2"
                                        fill="none"
                                        opacity={0.7}
                                        className="hover:opacity-1 cursor-pointer"
                                        onClick={() => onDecisionClick && onDecisionClick(index + 1)}
                                    />

                                    {/* Branch endpoint */}
                                    <circle cx={endX} cy={endY} r="4" fill="#6366F1" />

                                    {/* Choice label */}
                                    <foreignObject x={endX + 10} y={endY - 10} width="150" height="20">
                                        <div className="text-xs text-blue-600 font-medium truncate">
                                            {choice.description}
                                        </div>
                                    </foreignObject>

                                    {/* Impact indicator */}
                                    <foreignObject x={endX + 10} y={endY + 5} width="150" height="15">
                                        <div className="text-xs text-gray-500">
                                            {choice.impact.compute && `C:${choice.impact.compute > 0 ? '+' : ''}${choice.impact.compute}%`}
                                            {choice.impact.unemployment && ` U:${choice.impact.unemployment > 0 ? '+' : ''}${choice.impact.unemployment}%`}
                                        </div>
                                    </foreignObject>
                                </g>
                            )
                        })}

                        {/* Timeline labels */}
                        <text x="40" y={svgHeight - 20} textAnchor="middle" className="text-xs fill-gray-500">
                            Start
                        </text>
                        <text x={svgWidth - 100} y={svgHeight - 20} textAnchor="middle" className="text-xs fill-gray-500">
                            Future
                        </text>
                    </svg>
                </div>
            </div>

            {/* Current Scenario Details */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Scenario: {currentNode.title}</h3>
                <div className="bg-white p-6 rounded-lg border">
                    {/* World State Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                <span className="text-blue-600 font-bold text-sm">T+{currentNode.worldState.t}</span>
                            </div>
                            <div className="text-xs text-gray-600">Months</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <span className="text-green-600 font-bold text-sm">{currentNode.worldState.compute > 0 ? '+' : ''}{currentNode.worldState.compute}%</span>
                            </div>
                            <div className="text-xs text-gray-600">Compute</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <span className="text-red-600 font-bold text-sm">{currentNode.worldState.unemployment > 0 ? '+' : ''}{currentNode.worldState.unemployment}%</span>
                            </div>
                            <div className="text-xs text-gray-600">Unemployment</div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                                <span className="text-purple-600 font-bold text-xs">GEO</span>
                            </div>
                            <div className="text-xs text-gray-600">Geopolitics</div>
                        </div>
                    </div>

                    {/* Geopolitics status */}
                    <div className="text-center">
                        <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-sm text-gray-700 font-medium">{currentNode.worldState.geopolitics}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Path Timeline */}
            {storyPath.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Decision Path</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-4 overflow-x-auto">
                            {storyPath.map((node, index) => (
                                <div key={node.id} className="flex items-center flex-shrink-0">
                                    <div className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium min-w-max">
                                        {node.title}
                                    </div>
                                    {index < storyPath.length && (
                                        <div className="mx-2 text-gray-400 text-lg">→</div>
                                    )}
                                </div>
                            ))}
                            <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium min-w-max">
                                {currentNode.title}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Generation Button */}
            <div className="mt-6 text-center">
                <Button
                    onClick={onGeneratePDF}
                    className="bg-black  text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate PDF Report
                </Button>
            </div>
        </div>
    )
}