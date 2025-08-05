'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PolicyBenchAgent } from '@/components/policy-bench-agent'
import { PolicyBenchMetrics } from '@/components/policy-bench-metrics'

interface Project {
    id: string
    name: string
    category: 'critical' | 'innovative' | 'niche'
    impactScore: number
    requestedAmount: number
    description: string
    maintainers: number
    githubStars: number
    weeklyDownloads: number
    securityScore: number
    communityNeed: number
}

interface FundingDecision {
    projectId: string
    allocatedAmount: number
    reasoning: string
    timestamp: Date
}

export default function PolicyBenchPage() {
    const [simulationState, setSimulationState] = useState({
        totalFund: 10000000, // $10M
        remainingFund: 10000000,
        dailyFee: 2,
        daysPassed: 0,
        projectsEvaluated: 0,
        fundingDecisions: [] as FundingDecision[]
    })

    const [projects, setProjects] = useState<Project[]>([])
    const [currentProject, setCurrentProject] = useState<Project | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)

    useEffect(() => {
        // Load simulated projects on mount
        loadSimulatedProjects()
    }, [])

    const loadSimulatedProjects = async () => {
        // Simulate loading 100 projects
        const response = await fetch('/api/policy-bench/projects')
        const data = await response.json()
        setProjects(data.projects)
        setCurrentProject(data.projects[0])
    }

    const evaluateProject = async (decision: 'fund' | 'reject', amount?: number) => {
        if (!currentProject) return

        setIsSimulating(true)

        // Simulate AI evaluation delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (decision === 'fund' && amount) {
            const newDecision: FundingDecision = {
                projectId: currentProject.id,
                allocatedAmount: amount,
                reasoning: `Allocated based on impact score ${currentProject.impactScore}/100 and category weight`,
                timestamp: new Date()
            }

            setSimulationState(prev => ({
                ...prev,
                remainingFund: prev.remainingFund - amount - prev.dailyFee,
                daysPassed: prev.daysPassed + 1,
                projectsEvaluated: prev.projectsEvaluated + 1,
                fundingDecisions: [...prev.fundingDecisions, newDecision]
            }))
        } else {
            setSimulationState(prev => ({
                ...prev,
                remainingFund: prev.remainingFund - prev.dailyFee,
                daysPassed: prev.daysPassed + 1,
                projectsEvaluated: prev.projectsEvaluated + 1
            }))
        }

        // Move to next project
        const currentIndex = projects.findIndex(p => p.id === currentProject.id)
        const nextProject = projects[currentIndex + 1]
        setCurrentProject(nextProject || null)
        setIsSimulating(false)
    }

    const calculateRecommendedAmount = (project: Project) => {
        const baseAmount = project.requestedAmount
        const categoryMultiplier = {
            critical: 0.6,
            innovative: 0.3,
            niche: 0.1
        }[project.category]

        const impactMultiplier = project.impactScore / 100
        return Math.round(baseAmount * categoryMultiplier * impactMultiplier)
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">PolicyBench AI Simulation</h1>
                <p className="text-muted-foreground">
                    Allocating $10M virtual fund to Python open-source projects
                </p>
            </div>

            {/* Simulation Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Simulation Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                ${simulationState.remainingFund.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Remaining Fund</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{simulationState.daysPassed}</div>
                            <div className="text-sm text-muted-foreground">Days Passed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{simulationState.projectsEvaluated}</div>
                            <div className="text-sm text-muted-foreground">Projects Evaluated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{simulationState.fundingDecisions.length}</div>
                            <div className="text-sm text-muted-foreground">Projects Funded</div>
                        </div>
                    </div>
                    <Progress
                        value={(simulationState.projectsEvaluated / 100) * 100}
                        className="w-full"
                    />
                </CardContent>
            </Card>

            <Tabs defaultValue="evaluation" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="evaluation">Project Evaluation</TabsTrigger>
                    <TabsTrigger value="dashboard">Funding Dashboard</TabsTrigger>
                    <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="evaluation" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {currentProject ? (
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{currentProject.name}</CardTitle>
                                                <CardDescription>{currentProject.description}</CardDescription>
                                            </div>
                                            <Badge variant={
                                                currentProject.category === 'critical' ? 'destructive' :
                                                    currentProject.category === 'innovative' ? 'default' : 'secondary'
                                            }>
                                                {currentProject.category}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Impact Score</div>
                                                <div className="text-lg font-semibold">{currentProject.impactScore}/100</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Requested</div>
                                                <div className="text-lg font-semibold">${currentProject.requestedAmount.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">GitHub Stars</div>
                                                <div className="text-lg font-semibold">{currentProject.githubStars.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Weekly Downloads</div>
                                                <div className="text-lg font-semibold">{currentProject.weeklyDownloads.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => evaluateProject('fund', calculateRecommendedAmount(currentProject))}
                                                disabled={isSimulating}
                                                className="flex-1"
                                            >
                                                Fund (${calculateRecommendedAmount(currentProject).toLocaleString()})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => evaluateProject('reject')}
                                                disabled={isSimulating}
                                                className="flex-1"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <h3 className="text-lg font-semibold mb-2">Simulation Complete</h3>
                                        <p className="text-muted-foreground">All projects have been evaluated</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div>
                            <PolicyBenchAgent
                                currentProject={currentProject}
                                onDecision={(decision, amount, reasoning) => {
                                    if (reasoning) {
                                        evaluateProject(decision, amount)
                                    }
                                }}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="dashboard">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Funded Projects</h3>
                        {simulationState.fundingDecisions.map((decision, index) => {
                            const project = projects.find(p => p.id === decision.projectId)
                            return (
                                <Card key={index}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold">{project?.name}</h4>
                                                <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">
                                                    ${decision.allocatedAmount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {decision.timestamp.toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="metrics">
                    <PolicyBenchMetrics
                        fundingDecisions={simulationState.fundingDecisions}
                        projects={projects}
                        simulationState={simulationState}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}