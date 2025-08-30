'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RefreshCw, Eye, Brain, Zap, CheckCircle, Activity, Clock } from 'lucide-react';

interface OODAData {
    title: string;
    cycle?: {
        observe: string[];
        orient: string[];
        decide: string[];
        act: string[];
    };
    currentPhase?: 'observe' | 'orient' | 'decide' | 'act';
    phase?: string;
    monitoredStrategy?: string;
    strategyScore?: number;
    observations?: string[];
    synthesis?: string;
    lastUpdate?: string;
    policySource?: string;
    inputs?: string[];
}

export function OODANode({ data, selected }: NodeProps<OODAData>) {
    const [currentPhase, setCurrentPhase] = useState<'observe' | 'orient' | 'decide' | 'act'>(
        data.currentPhase || 'observe'
    );

    const [cycle] = useState(data.cycle || {
        observe: [
            'Monitor policy environment',
            'Gather stakeholder feedback',
            'Track implementation metrics'
        ],
        orient: [
            'Analyze emerging patterns',
            'Update mental models',
            'Reassess assumptions'
        ],
        decide: [
            'Evaluate options',
            'Select course of action',
            'Plan implementation'
        ],
        act: [
            'Execute decisions',
            'Communicate changes',
            'Monitor results'
        ]
    });

    const phases = [
        { key: 'observe', label: 'Observe', icon: Eye, color: 'blue' },
        { key: 'orient', label: 'Orient', icon: Brain, color: 'green' },
        { key: 'decide', label: 'Decide', icon: Zap, color: 'yellow' },
        { key: 'act', label: 'Act', icon: CheckCircle, color: 'purple' }
    ] as const;

    const nextPhase = () => {
        const currentIndex = phases.findIndex(p => p.key === currentPhase);
        const nextIndex = (currentIndex + 1) % phases.length;
        setCurrentPhase(phases[nextIndex].key);
    };

    const getPhaseColor = (phase: string) => {
        const colors = {
            blue: 'border-blue-200 bg-blue-50/50 text-blue-700',
            green: 'border-green-200 bg-green-50/50 text-green-700',
            yellow: 'border-yellow-200 bg-yellow-50/50 text-yellow-700',
            purple: 'border-purple-200 bg-purple-50/50 text-purple-700'
        };
        return colors[phase as keyof typeof colors] || colors.blue;
    };

    return (
        <Card className={`w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4 text-orange-600" />
                    {data.title}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPhase}
                        className="ml-auto h-6 px-2 text-xs"
                    >
                        Next Phase
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-1">
                    {phases.map((phase) => {
                        const Icon = phase.icon;
                        const isActive = phase.key === currentPhase;
                        return (
                            <Badge
                                key={phase.key}
                                variant={isActive ? "default" : "outline"}
                                className={`justify-center text-xs ${isActive ? getPhaseColor(phase.color) : ''}`}
                            >
                                <Icon className="w-3 h-3 mr-1" />
                                {phase.label}
                            </Badge>
                        );
                    })}
                </div>

                <div className="border rounded p-2">
                    <div className="font-medium text-xs mb-2 capitalize">
                        {currentPhase} Phase
                    </div>
                    <div className="space-y-1">
                        {cycle[currentPhase].map((item, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="text-primary">•</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {!data.synthesis && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                        <div className="font-medium">OODA Loop (Feedback Cycle)</div>
                        <div>Continuous adaptation and learning process</div>
                    </div>
                )}
            </CardContent>

            {data.synthesis && (
                <CardFooter className="pt-2 pb-3 px-4">
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Activity className="w-3 h-3 text-orange-500" />
                            <span className="font-medium text-orange-700">Active Monitoring</span>
                            {data.monitoredStrategy && (
                                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                    {data.monitoredStrategy}
                                </Badge>
                            )}
                            {data.strategyScore && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                    {data.strategyScore} score
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed bg-orange-50/50 p-2 rounded border-l-2 border-orange-200">
                            {data.synthesis}
                        </div>
                        {data.observations && data.observations.length > 0 && (
                            <div className="text-xs">
                                <div className="font-medium text-muted-foreground mb-1">Current Observations:</div>
                                <div className="space-y-1">
                                    {data.observations.slice(0, 2).map((obs, index) => (
                                        <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                            <span className="text-orange-500">•</span>
                                            <span>{obs}</span>
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