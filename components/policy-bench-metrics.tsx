'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface MetricsProps {
    fundingDecisions: Array<{
        projectId: string
        allocatedAmount: number
        reasoning: string
        timestamp: Date
    }>
    projects: Array<{
        id: string
        name: string
        category: 'critical' | 'innovative' | 'niche'
        impactScore: number
        githubStars: number
        weeklyDownloads: number
    }>
    simulationState: {
        totalFund: number
        remainingFund: number
        daysPassed: number
        projectsEvaluated: number
    }
}

export function PolicyBenchMetrics({ fundingDecisions, projects, simulationState }: MetricsProps) {
    // Calculate impact metrics
    const fundedProjects = fundingDecisions.map(decision => {
        const project = projects.find(p => p.id === decision.projectId)
        return { ...decision, project }
    }).filter(item => item.project)

    const totalAllocated = fundingDecisions.reduce((sum, d) => sum + d.allocatedAmount, 0)
    const avgFundingAmount = totalAllocated / Math.max(1, fundingDecisions.length)

    // Simulate 5-year impact projections
    const impactProjections = fundedProjects.map(item => {
        const baseStars = item.project!.githubStars
        const baseDownloads = item.project!.weeklyDownloads
        const fundingMultiplier = Math.log10(item.allocatedAmount / 100000) / 2 // Logarithmic impact

        return {
            projectName: item.project!.name,
            category: item.project!.category,
            currentStars: baseStars,
            projectedStars: Math.round(baseStars * (1 + fundingMultiplier * 0.5)),
            currentDownloads: baseDownloads,
            projectedDownloads: Math.round(baseDownloads * (1 + fundingMultiplier * 0.3)),
            fundingAmount: item.allocatedAmount,
            impactScore: item.project!.impactScore
        }
    })

    // Category distribution
    const categoryData = [
        {
            name: 'Critical Infrastructure',
            value: fundedProjects.filter(p => p.project!.category === 'critical').length,
            amount: fundedProjects.filter(p => p.project!.category === 'critical').reduce((sum, p) => sum + p.allocatedAmount, 0),
            color: '#ef4444'
        },
        {
            name: 'Innovative Tools',
            value: fundedProjects.filter(p => p.project!.category === 'innovative').length,
            amount: fundedProjects.filter(p => p.project!.category === 'innovative').reduce((sum, p) => sum + p.allocatedAmount, 0),
            color: '#3b82f6'
        },
        {
            name: 'Niche Libraries',
            value: fundedProjects.filter(p => p.project!.category === 'niche').length,
            amount: fundedProjects.filter(p => p.project!.category === 'niche').reduce((sum, p) => sum + p.allocatedAmount, 0),
            color: '#10b981'
        }
    ]

    // Time series data for funding decisions
    const timeSeriesData = fundingDecisions.reduce((acc, decision, index) => {
        const runningTotal = fundingDecisions.slice(0, index + 1).reduce((sum, d) => sum + d.allocatedAmount, 0)
        acc.push({
            day: index + 1,
            cumulativeFunding: runningTotal,
            remainingFund: simulationState.totalFund - runningTotal,
            projectsFunded: index + 1
        })
        return acc
    }, [] as any[])

    // Failure mode analysis
    const failureModes = fundingDecisions.filter(d => d.reasoning.includes('FAILURE MODE'))
    const failureRate = (failureModes.length / Math.max(1, fundingDecisions.length)) * 100

    // Efficiency metrics (inspired by Vending-Bench)
    const efficiencyScore = fundedProjects.length > 0 ?
        fundedProjects.reduce((sum, p) => sum + p.project!.impactScore, 0) / fundedProjects.length : 0

    const fundingEfficiency = totalAllocated > 0 ?
        (efficiencyScore * fundedProjects.length) / (totalAllocated / 1000000) : 0 // Impact per million

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            ${totalAllocated.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Allocated</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {efficiencyScore.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">Avg Impact Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {fundingEfficiency.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">Impact per $1M</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-500">
                            {failureRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Failure Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Funding Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Funding Timeline</CardTitle>
                    <CardDescription>Cumulative funding allocation over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                            <Line
                                type="monotone"
                                dataKey="cumulativeFunding"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Cumulative Funding"
                            />
                            <Line
                                type="monotone"
                                dataKey="remainingFund"
                                stroke="#ef4444"
                                strokeWidth={2}
                                name="Remaining Fund"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Category Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Funding by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="amount"
                                    label={({ name, value }) => `${name}: $${(value / 1000000).toFixed(1)}M`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Count by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Impact Projections */}
            <Card>
                <CardHeader>
                    <CardTitle>5-Year Impact Projections</CardTitle>
                    <CardDescription>Simulated outcomes based on funding decisions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {impactProjections.slice(0, 10).map((projection, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{projection.projectName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        <Badge variant="outline" className="mr-2">
                                            {projection.category}
                                        </Badge>
                                        Funded: ${projection.fundingAmount.toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Stars:</span> {projection.currentStars.toLocaleString()} → {projection.projectedStars.toLocaleString()}
                                        <span className="text-green-600 ml-2">
                                            (+{(((projection.projectedStars - projection.currentStars) / projection.currentStars) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Downloads:</span> {(projection.currentDownloads / 1000000).toFixed(1)}M → {(projection.projectedDownloads / 1000000).toFixed(1)}M
                                        <span className="text-green-600 ml-2">
                                            (+{(((projection.projectedDownloads - projection.currentDownloads) / projection.currentDownloads) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Failure Analysis */}
            {failureModes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Failure Mode Analysis</CardTitle>
                        <CardDescription>Agent decision failures (inspired by Vending-Bench)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {failureModes.map((failure, index) => (
                                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <div className="text-sm font-medium text-red-800">
                                        {failure.reasoning}
                                    </div>
                                    <div className="text-xs text-red-600">
                                        Amount: ${failure.allocatedAmount.toLocaleString()} | {failure.timestamp.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison to Benchmarks */}
            <Card>
                <CardHeader>
                    <CardTitle>Benchmark Comparison</CardTitle>
                    <CardDescription>Performance vs. German Sovereign Tech Fund and Vending-Bench</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-lg font-semibold">German STF</div>
                            <div className="text-sm text-muted-foreground">€23.5M / 60 projects</div>
                            <div className="text-xs">~€392K per project</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg bg-blue-50">
                            <div className="text-lg font-semibold">PolicyBench</div>
                            <div className="text-sm text-muted-foreground">
                                ${totalAllocated.toLocaleString()} / {fundedProjects.length} projects
                            </div>
                            <div className="text-xs">
                                ~${avgFundingAmount.toLocaleString()} per project
                            </div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-lg font-semibold">Vending-Bench</div>
                            <div className="text-sm text-muted-foreground">$2,217.93 mean net worth</div>
                            <div className="text-xs">222 days simulation</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}