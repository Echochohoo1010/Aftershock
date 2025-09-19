"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, GitBranch, Zap, Brain, Eye, MessageSquare } from "lucide-react"

interface ModelNode {
    id: string
    name: string
    type: 'foundation' | 'specialized' | 'multimodal' | 'reasoning'
    year: number
    parameters?: string
    organization: string
    status: 'released' | 'development' | 'deprecated'
    children?: ModelNode[]
    capabilities?: string[]
}

const modelTreeData: ModelNode[] = [
    {
        id: 'transformers',
        name: 'Transformer Architecture',
        type: 'foundation',
        year: 2017,
        organization: 'Google',
        status: 'released',
        capabilities: ['attention', 'parallelization'],
        children: [
            {
                id: 'gpt-family',
                name: 'GPT Family',
                type: 'foundation',
                year: 2018,
                organization: 'OpenAI',
                status: 'released',
                children: [
                    {
                        id: 'gpt-1',
                        name: 'GPT-1',
                        type: 'foundation',
                        year: 2018,
                        parameters: '117M',
                        organization: 'OpenAI',
                        status: 'deprecated',
                        capabilities: ['text generation']
                    },
                    {
                        id: 'gpt-2',
                        name: 'GPT-2',
                        type: 'foundation',
                        year: 2019,
                        parameters: '1.5B',
                        organization: 'OpenAI',
                        status: 'released',
                        capabilities: ['text generation', 'few-shot learning']
                    },
                    {
                        id: 'gpt-3',
                        name: 'GPT-3',
                        type: 'foundation',
                        year: 2020,
                        parameters: '175B',
                        organization: 'OpenAI',
                        status: 'released',
                        capabilities: ['text generation', 'few-shot learning', 'reasoning']
                    },
                    {
                        id: 'gpt-4',
                        name: 'GPT-4',
                        type: 'multimodal',
                        year: 2023,
                        parameters: '1.7T',
                        organization: 'OpenAI',
                        status: 'released',
                        capabilities: ['text generation', 'vision', 'reasoning', 'code generation']
                    }
                ]
            },
            {
                id: 'bert-family',
                name: 'BERT Family',
                type: 'foundation',
                year: 2018,
                organization: 'Google',
                status: 'released',
                children: [
                    {
                        id: 'bert-base',
                        name: 'BERT-Base',
                        type: 'foundation',
                        year: 2018,
                        parameters: '110M',
                        organization: 'Google',
                        status: 'released',
                        capabilities: ['bidirectional encoding', 'understanding']
                    },
                    {
                        id: 'roberta',
                        name: 'RoBERTa',
                        type: 'foundation',
                        year: 2019,
                        parameters: '355M',
                        organization: 'Meta',
                        status: 'released',
                        capabilities: ['robust training', 'understanding']
                    }
                ]
            },
            {
                id: 'claude-family',
                name: 'Claude Family',
                type: 'reasoning',
                year: 2022,
                organization: 'Anthropic',
                status: 'released',
                children: [
                    {
                        id: 'claude-1',
                        name: 'Claude 1',
                        type: 'reasoning',
                        year: 2022,
                        parameters: '52B',
                        organization: 'Anthropic',
                        status: 'released',
                        capabilities: ['constitutional AI', 'safety', 'reasoning']
                    },
                    {
                        id: 'claude-2',
                        name: 'Claude 2',
                        type: 'reasoning',
                        year: 2023,
                        parameters: '100B',
                        organization: 'Anthropic',
                        status: 'released',
                        capabilities: ['constitutional AI', 'safety', 'long context']
                    },
                    {
                        id: 'claude-3',
                        name: 'Claude 3',
                        type: 'multimodal',
                        year: 2024,
                        parameters: '200B',
                        organization: 'Anthropic',
                        status: 'released',
                        capabilities: ['vision', 'reasoning', 'safety', 'analysis']
                    }
                ]
            },
            {
                id: 'gemini-family',
                name: 'Gemini Family',
                type: 'multimodal',
                year: 2023,
                organization: 'Google',
                status: 'released',
                children: [
                    {
                        id: 'gemini-pro',
                        name: 'Gemini Pro',
                        type: 'multimodal',
                        year: 2023,
                        parameters: '540B',
                        organization: 'Google',
                        status: 'released',
                        capabilities: ['multimodal', 'reasoning', 'code generation']
                    },
                    {
                        id: 'gemini-ultra',
                        name: 'Gemini Ultra',
                        type: 'multimodal',
                        year: 2024,
                        parameters: '1.5T',
                        organization: 'Google',
                        status: 'development',
                        capabilities: ['advanced reasoning', 'multimodal', 'scientific analysis']
                    }
                ]
            }
        ]
    }
]

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'foundation': return <Brain className="h-4 w-4" />
        case 'specialized': return <Zap className="h-4 w-4" />
        case 'multimodal': return <Eye className="h-4 w-4" />
        case 'reasoning': return <MessageSquare className="h-4 w-4" />
        default: return <GitBranch className="h-4 w-4" />
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case 'foundation': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'specialized': return 'bg-green-100 text-green-800 border-green-200'
        case 'multimodal': return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'reasoning': return 'bg-orange-100 text-orange-800 border-orange-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'released': return 'bg-green-500'
        case 'development': return 'bg-yellow-500'
        case 'deprecated': return 'bg-gray-400'
        default: return 'bg-gray-300'
    }
}

interface TreeNodeProps {
    node: ModelNode
    level: number
    isLast: boolean
    parentLines: boolean[]
}

function TreeNode({ node, level, isLast, parentLines }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(level < 2)
    const hasChildren = node.children && node.children.length > 0

    return (
        <div className="relative">
            {/* Connection lines */}
            <div className="flex items-center">
                {/* Vertical lines from parents */}
                {parentLines.map((showLine, index) => (
                    <div key={index} className="w-6 flex justify-center">
                        {showLine && <div className="w-px h-8 bg-border" />}
                    </div>
                ))}

                {/* Current level connection */}
                {level > 0 && (
                    <div className="w-6 flex justify-center relative">
                        <div className={`w-px bg-border ${isLast ? 'h-4' : 'h-8'}`} />
                        <div className="absolute top-4 left-3 w-3 h-px bg-border" />
                    </div>
                )}

                {/* Node content */}
                <div className="flex-1 ml-2">
                    <div className="flex items-center gap-2 py-1">
                        {/* Expand/collapse button */}
                        {hasChildren && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </Button>
                        )}

                        {/* Status indicator */}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />

                        {/* Type icon */}
                        <div className={`p-1 rounded border ${getTypeColor(node.type)}`}>
                            {getTypeIcon(node.type)}
                        </div>

                        {/* Node info */}
                        <div className="flex items-center gap-2 flex-1">
                            <span className="font-medium text-sm">{node.name}</span>
                            {node.parameters && (
                                <Badge variant="outline" className="text-xs">
                                    {node.parameters}
                                </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                                {node.year}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{node.organization}</span>
                        </div>
                    </div>

                    {/* Capabilities */}
                    {node.capabilities && (
                        <div className="ml-8 mt-1 flex flex-wrap gap-1">
                            {node.capabilities.map((capability, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {capability}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {node.children!.map((child, index) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            isLast={index === node.children!.length - 1}
                            parentLines={[...parentLines, !isLast]}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AIModelTree() {
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const filteredData = selectedType
        ? modelTreeData.map(root => ({
            ...root,
            children: root.children?.filter(child =>
                child.type === selectedType ||
                child.children?.some(grandchild => grandchild.type === selectedType)
            )
        }))
        : modelTreeData

    return (
        <div className="w-full h-full bg-background">
            {/* Filter controls */}
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-medium">Filter by Model Type:</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedType === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(null)}
                    >
                        All Types
                    </Button>
                    {['foundation', 'specialized', 'multimodal', 'reasoning'].map(type => (
                        <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedType(type)}
                            className="capitalize"
                        >
                            {getTypeIcon(type)}
                            <span className="ml-1">{type}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tree visualization */}
            <div className="p-4 overflow-auto h-full">
                <div className="space-y-2">
                    {filteredData.map((root, index) => (
                        <TreeNode
                            key={root.id}
                            node={root}
                            level={0}
                            isLast={index === filteredData.length - 1}
                            parentLines={[]}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t bg-muted/30">
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Released</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span>Development</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                <span>Deprecated</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Model Types</h4>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Brain className="h-3 w-3" />
                                <span>Foundation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                <span>Multimodal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" />
                                <span>Reasoning</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}