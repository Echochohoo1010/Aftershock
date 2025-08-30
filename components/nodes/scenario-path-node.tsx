'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { GitBranch, Plus, Trash2, Edit3, TrendingUp, AlertCircle, Zap, Clock } from 'lucide-react';

interface ScenarioData {
    id: string;
    name: string;
    probability: number;
    impact: string;
}

interface ScenarioPathData {
    title: string;
    scenarios?: ScenarioData[];
    synthesis?: string;
    lastUpdate?: string;
    inputSource?: string;
}

export function ScenarioPathNode({ data, selected }: NodeProps<ScenarioPathData>) {
    const [scenarios, setScenarios] = useState(data?.scenarios || [
        { id: '1', name: 'Baseline Scenario', probability: 60, impact: 'Moderate' },
        { id: '2', name: 'Optimistic Scenario', probability: 25, impact: 'High' },
        { id: '3', name: 'Pessimistic Scenario', probability: 15, impact: 'Low' }
    ]);
    const [isEditing, setIsEditing] = useState(false);

    const addScenario = () => {
        const newScenario = {
            id: Date.now().toString(),
            name: `Scenario ${scenarios.length + 1}`,
            probability: 0,
            impact: 'TBD'
        };
        setScenarios([...scenarios, newScenario]);
    };

    const removeScenario = (id: string) => {
        setScenarios(scenarios.filter(s => s.id !== id));
    };

    const updateScenario = (id: string, field: keyof ScenarioData, value: string | number) => {
        setScenarios(scenarios.map((s: ScenarioData) =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const totalProbability = scenarios.reduce((sum: number, s: ScenarioData) => sum + s.probability, 0);
    const isValidCoverage = totalProbability <= 100;

    return (
        <Card className={`w-96 ${selected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <GitBranch className="w-4 h-4 text-green-600" />
                    {data.title}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="ml-auto h-6 w-6 p-0"
                    >
                        <Edit3 className="w-3 h-3" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    {scenarios.map((scenario) => (
                        <div key={scenario.id} className="border rounded p-2 space-y-1">
                            {isEditing ? (
                                <div className="space-y-1">
                                    <div className="flex gap-1 items-center">
                                        <Input
                                            value={scenario.name}
                                            onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                                            className="text-xs h-6"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeScenario(scenario.id)}
                                            className="h-6 w-6 p-0 text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-1">
                                        <Input
                                            type="number"
                                            value={scenario.probability}
                                            onChange={(e) => updateScenario(scenario.id, 'probability', parseInt(e.target.value))}
                                            className="text-xs h-6"
                                            placeholder="Probability %"
                                        />
                                        <Input
                                            value={scenario.impact}
                                            onChange={(e) => updateScenario(scenario.id, 'impact', e.target.value)}
                                            className="text-xs h-6"
                                            placeholder="Impact"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="font-medium text-xs">{scenario.name}</div>
                                    <div className="text-xs text-muted-foreground flex justify-between">
                                        <span>Probability: {scenario.probability}%</span>
                                        <span>Impact: {scenario.impact}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addScenario}
                            className="w-full h-6 text-xs"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Scenario
                        </Button>
                    )}
                </div>

            </CardContent>

            <CardFooter className="pt-2 pb-3 px-4">
                {data.synthesis ? (
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Zap className="w-3 h-3 text-blue-500" />
                            <span className="font-medium text-blue-700">Policy Integration</span>
                            {data.inputSource && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                    from {data.inputSource}
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed bg-blue-50/50 p-2 rounded border-l-2 border-blue-200">
                            {data.synthesis}
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {scenarios.length} scenarios
                                </Badge>
                                <div className="flex items-center gap-1">
                                    {isValidCoverage ? (
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3 text-red-600" />
                                    )}
                                    <span className={isValidCoverage ? 'text-green-600' : 'text-red-600'}>
                                        {totalProbability}%
                                    </span>
                                </div>
                            </div>
                            {data.lastUpdate && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(data.lastUpdate).toLocaleTimeString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full text-xs">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {scenarios.length} scenarios
                            </Badge>
                            <div className="flex items-center gap-1">
                                {isValidCoverage ? (
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-3 h-3 text-red-600" />
                                )}
                                <span className={isValidCoverage ? 'text-green-600' : 'text-red-600'}>
                                    {totalProbability}%
                                </span>
                            </div>
                        </div>
                        <div className="text-muted-foreground">
                            Scenario Planning
                        </div>
                    </div>
                )}
            </CardFooter>

            <Handle type="source" position={Position.Right} className="w-3 h-3" />
            <Handle type="target" position={Position.Left} className="w-3 h-3" />
        </Card>
    );
}