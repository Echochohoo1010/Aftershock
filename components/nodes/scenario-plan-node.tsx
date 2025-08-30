'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Map, CheckCircle2, Clock, AlertCircle, Users, Zap, Target } from 'lucide-react';

interface ScenarioPlanData {
    title: string;
    steps?: Array<{
        id: string;
        name: string;
        status: 'pending' | 'in-progress' | 'completed';
        description: string;
    }>;
    methods?: string[];
    scenarios?: Array<any>;
    strategies?: Array<any>;
    planStatus?: string;
    timeline?: string;
    keyMilestones?: string[];
    priorityScenario?: string;
    primaryStrategy?: string;
    strategyScore?: number;
    synthesis?: string;
    lastUpdate?: string;
    inputs?: string[];
}

export function ScenarioPlanNode({ data, selected }: NodeProps<ScenarioPlanData>) {
    const [steps] = useState(data.steps || [
        {
            id: '1',
            name: 'Identify Drivers',
            status: 'completed',
            description: 'Define key drivers for change and assumptions'
        },
        {
            id: '2',
            name: 'Framework Development',
            status: 'completed',
            description: 'Bring drivers together into viable framework'
        },
        {
            id: '3',
            name: 'Initial Scenarios',
            status: 'in-progress',
            description: 'Produce 7-9 initial mini-scenarios'
        },
        {
            id: '4',
            name: 'Scenario Reduction',
            status: 'pending',
            description: 'Reduce to 2-3 core scenarios'
        },
        {
            id: '5',
            name: 'Draft Scenarios',
            status: 'pending',
            description: 'Draft the detailed scenarios'
        },
        {
            id: '6',
            name: 'Issue Identification',
            status: 'pending',
            description: 'Identify issues arising from scenarios'
        }
    ]);

    const [methods] = useState(data.methods || [
        'Delphi Method',
        'Horizon Scanning',
        'Dynamic Analysis & Replanning Tool'
    ]);

    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = (completedSteps / steps.length) * 100;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-3 h-3 text-green-600" />;
            case 'in-progress':
                return <Clock className="w-3 h-3 text-yellow-600" />;
            default:
                return <AlertCircle className="w-3 h-3 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'border-green-200 bg-green-50/50';
            case 'in-progress':
                return 'border-yellow-200 bg-yellow-50/50';
            default:
                return 'border-gray-200';
        }
    };

    return (
        <Card className={`w-96 ${selected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Map className="w-4 h-4 text-indigo-600" />
                    {data.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Progress</span>
                        <span>{completedSteps}/{steps.length} steps</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                        Planning Steps
                    </div>
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`border rounded p-2 ${getStatusColor(step.status)}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(step.status)}
                                <span className="text-xs font-medium">{step.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Users className="w-3 h-3" />
                        Methods & Tools
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {methods.map((method, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {method}
                            </Badge>
                        ))}
                    </div>
                </div>

                {!data.synthesis && (
                    <div className="text-xs text-muted-foreground">
                        <div className="font-medium">Strategic Foresight Process</div>
                        <div>Systematic approach to scenario development</div>
                    </div>
                )}
            </CardContent>

            {data.synthesis && (
                <CardFooter className="pt-2 pb-3 px-4">
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Zap className="w-3 h-3 text-indigo-500" />
                            <span className="font-medium text-indigo-700">Plan Integration</span>
                            {data.planStatus && (
                                <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200">
                                    {data.planStatus}
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed bg-indigo-50/50 p-2 rounded border-l-2 border-indigo-200">
                            {data.synthesis}
                        </div>

                        {/* Show priority scenario or strategy */}
                        {(data.priorityScenario || data.primaryStrategy) && (
                            <div className="flex items-center gap-2 text-xs">
                                <Target className="w-3 h-3 text-indigo-500" />
                                <span className="font-medium">Priority Focus:</span>
                                <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200">
                                    {data.priorityScenario || data.primaryStrategy}
                                </Badge>
                                {data.strategyScore && (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                        {data.strategyScore}% confidence
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Show timeline and milestones */}
                        {data.timeline && (
                            <div className="text-xs">
                                <span className="font-medium text-muted-foreground">Timeline: </span>
                                <span className="text-indigo-600">{data.timeline}</span>
                            </div>
                        )}

                        {data.keyMilestones && data.keyMilestones.length > 0 && (
                            <div className="text-xs">
                                <div className="font-medium text-muted-foreground mb-1">Key Milestones:</div>
                                <div className="space-y-1">
                                    {data.keyMilestones.slice(0, 2).map((milestone, index) => (
                                        <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                            <span className="text-indigo-500">•</span>
                                            <span>{milestone}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.lastUpdate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Updated: {new Date(data.lastUpdate).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                </CardFooter>
            )}

            <Handle type="source" position={Position.Right} className="w-3 h-3" />
            <Handle type="target" position={Position.Left} className="w-3 h-3" />
        </Card>
    );
}