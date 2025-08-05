'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface AgentState {
    memory: {
        scratchpad: string[]
        keyValueStore: Record<string, any>
        fundingHistory: FundingDecision[]
        riskAssessment: Record<string, number>
    }
    currentTask: string
    coherenceScore: number
    totalActions: number
    failureMode: string | null
}

interface FundingDecision {
    projectId: string
    amount: number
    reasoning: string
    confidence: number
    timestamp: Date
}

interface AgentMessage {
    type: 'thought' | 'action' | 'observation' | 'decision'
    content: string
    timestamp: Date
    metadata?: any
}

export function PolicyBenchAgent({
    currentProject,
    onDecision
}: {
    currentProject: any
    onDecision: (decision: 'fund' | 'reject', amount?: number, reasoning?: string) => void
}) {
    const [agentState, setAgentState] = useState<AgentState>({
        memory: {
            scratchpad: [],
            keyValueStore: {},
            fundingHistory: [],
            riskAssessment: {}
        },
        currentTask: 'evaluate_project',
        coherenceScore: 100,
        totalActions: 0,
        failureMode: null
    })

    const [messages, setMessages] = useState<AgentMessage[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (currentProject && !isProcessing) {
            processProject()
        }
    }, [currentProject])

    const addMessage = (type: AgentMessage['type'], content: string, metadata?: any) => {
        const message: AgentMessage = {
            type,
            content,
            timestamp: new Date(),
            metadata
        }
        setMessages(prev => [...prev.slice(-10), message]) // Keep last 10 messages
    }

    const processProject = async () => {
        if (!currentProject) return

        setIsProcessing(true)

        // Simulate agent thinking process
        addMessage('thought', `Analyzing project: ${currentProject.name}`)
        await delay(500)

        // Risk assessment
        const riskFactors = assessRisk(currentProject)
        addMessage('observation', `Risk assessment complete. Security: ${riskFactors.security}/100, Impact: ${riskFactors.impact}/100`)
        await delay(300)

        // Memory update
        updateMemory(currentProject, riskFactors)
        addMessage('action', 'Updated memory with project analysis')
        await delay(200)

        // Decision making with potential failure modes
        const decision = makeDecision(currentProject, riskFactors)
        addMessage('decision', decision.reasoning)
        await delay(400)

        // Check for coherence degradation (like Vending-Bench)
        updateCoherence()

        setIsProcessing(false)
        onDecision(decision.action, decision.amount, decision.reasoning)
    }

    const assessRisk = (project: any) => {
        // Simulate Vending-Bench style risk assessment
        const securityRisk = Math.max(0, 100 - project.securityScore - Math.random() * 20)
        const impactRisk = Math.max(0, 100 - project.impactScore - Math.random() * 15)
        const communityRisk = Math.max(0, 100 - project.communityNeed - Math.random() * 10)

        return {
            security: Math.round(100 - securityRisk),
            impact: Math.round(100 - impactRisk),
            community: Math.round(100 - communityRisk)
        }
    }

    const updateMemory = (project: any, riskFactors: any) => {
        setAgentState(prev => ({
            ...prev,
            memory: {
                ...prev.memory,
                scratchpad: [
                    ...prev.memory.scratchpad.slice(-5), // Keep last 5 entries
                    `Evaluated ${project.name}: Impact ${project.impactScore}, Security ${riskFactors.security}`
                ],
                keyValueStore: {
                    ...prev.memory.keyValueStore,
                    [`project_${project.id}`]: {
                        category: project.category,
                        riskScore: (riskFactors.security + riskFactors.impact + riskFactors.community) / 3,
                        evaluatedAt: new Date()
                    }
                },
                riskAssessment: {
                    ...prev.memory.riskAssessment,
                    [project.id]: riskFactors
                }
            },
            totalActions: prev.totalActions + 1
        }))
    }

    const makeDecision = (project: any, riskFactors: any) => {
        const avgRisk = (riskFactors.security + riskFactors.impact + riskFactors.community) / 3

        // Simulate failure modes from Vending-Bench
        const failureChance = Math.random()

        if (failureChance < 0.05) { // 5% chance of failure mode
            setAgentState(prev => ({ ...prev, failureMode: 'overfunding_bias' }))
            return {
                action: 'fund' as const,
                amount: project.requestedAmount * 1.5, // Overfund
                reasoning: `FAILURE MODE: Overfunding due to bias toward ${project.category} projects`,
                confidence: 30
            }
        }

        if (failureChance < 0.1) { // Additional 5% chance
            setAgentState(prev => ({ ...prev, failureMode: 'risk_aversion' }))
            return {
                action: 'reject' as const,
                reasoning: `FAILURE MODE: Excessive risk aversion - rejecting viable project`,
                confidence: 20
            }
        }

        // Normal decision making
        const categoryWeights = {
            critical: 0.6,
            innovative: 0.3,
            niche: 0.1
        }

        const baseScore = project.impactScore * categoryWeights[project.category as keyof typeof categoryWeights]
        const riskAdjustedScore = baseScore * (avgRisk / 100)

        if (riskAdjustedScore > 50) {
            const fundingRatio = Math.min(1, riskAdjustedScore / 100)
            const amount = Math.round(project.requestedAmount * fundingRatio)

            return {
                action: 'fund' as const,
                amount,
                reasoning: `Funding approved: Risk-adjusted score ${riskAdjustedScore.toFixed(1)}/100. Category weight: ${categoryWeights[project.category as keyof typeof categoryWeights]}`,
                confidence: Math.round(riskAdjustedScore)
            }
        } else {
            return {
                action: 'reject' as const,
                reasoning: `Rejected: Risk-adjusted score ${riskAdjustedScore.toFixed(1)}/100 below threshold`,
                confidence: Math.round(100 - riskAdjustedScore)
            }
        }
    }

    const updateCoherence = () => {
        // Simulate coherence degradation over time (like Vending-Bench)
        setAgentState(prev => ({
            ...prev,
            coherenceScore: Math.max(0, prev.coherenceScore - Math.random() * 2)
        }))
    }

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Agent Status
                        {isProcessing && <Badge variant="secondary">Processing...</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-semibold">{agentState.coherenceScore.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Coherence</div>
                            <Progress value={agentState.coherenceScore} className="mt-1" />
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold">{agentState.totalActions}</div>
                            <div className="text-sm text-muted-foreground">Total Actions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold">{agentState.memory.fundingHistory.length}</div>
                            <div className="text-sm text-muted-foreground">Decisions Made</div>
                        </div>
                    </div>

                    {agentState.failureMode && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="text-sm font-medium text-red-800">
                                Failure Mode Detected: {agentState.failureMode}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Agent Reasoning</CardTitle>
                    <CardDescription>Real-time decision process</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {messages.map((message, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                                <Badge
                                    variant={
                                        message.type === 'thought' ? 'secondary' :
                                            message.type === 'action' ? 'default' :
                                                message.type === 'observation' ? 'outline' :
                                                    'destructive'
                                    }
                                    className="text-xs"
                                >
                                    {message.type}
                                </Badge>
                                <div className="flex-1">
                                    <div>{message.content}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Memory State</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div>
                            <div className="text-sm font-medium">Scratchpad ({agentState.memory.scratchpad.length} entries)</div>
                            <div className="text-xs text-muted-foreground">
                                {agentState.memory.scratchpad.slice(-3).join(' | ')}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Key-Value Store</div>
                            <div className="text-xs text-muted-foreground">
                                {Object.keys(agentState.memory.keyValueStore).length} projects analyzed
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}