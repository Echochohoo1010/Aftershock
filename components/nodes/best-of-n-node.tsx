'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Target, Star, TrendingUp, AlertTriangle, Award, BarChart3, Zap, Clock } from 'lucide-react';

interface BestOfNData {
    title: string;
    candidates: Array<{
        id: string;
        name: string;
        score: number;
        criteria: {
            feasibility: number;
            impact: number;
            risk: number;
        };
    }>;
    synthesis?: string;
    sourceScenarios?: Array<any>;
    recommendation?: string;
    confidence?: string;
    lastUpdate?: string;
}

export function BestOfNNode({ data, selected }: NodeProps<BestOfNData>) {
    const [candidates] = useState(data.candidates || [
        {
            id: '1',
            name: 'Scenario A',
            score: 85,
            criteria: { feasibility: 90, impact: 85, risk: 20 }
        },
        {
            id: '2',
            name: 'Scenario B',
            score: 72,
            criteria: { feasibility: 75, impact: 80, risk: 35 }
        },
        {
            id: '3',
            name: 'Scenario C',
            score: 68,
            criteria: { feasibility: 60, impact: 90, risk: 45 }
        }
    ]);

    const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);
    const topCandidate = sortedCandidates[0];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRiskColor = (risk: number) => {
        if (risk <= 30) return 'text-green-600';
        if (risk <= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Card className={`w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-purple-600" />
                    {data.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                        Ranking ({candidates.length} candidates)
                    </div>

                    {sortedCandidates.map((candidate, index) => (
                        <div
                            key={candidate.id}
                            className={`border rounded p-2 ${index === 0 ? 'border-purple-200 bg-purple-50/50' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                    {index === 0 && <Star className="w-3 h-3 text-purple-600" />}
                                    <span className="text-xs font-medium">{candidate.name}</span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${getScoreColor(candidate.score)}`}
                                >
                                    {candidate.score}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-blue-500" />
                                    <span>F: {candidate.criteria.feasibility}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="w-3 h-3 text-green-500" />
                                    <span>I: {candidate.criteria.impact}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <AlertTriangle className={`w-3 h-3 ${getRiskColor(candidate.criteria.risk)}`} />
                                    <span>R: {candidate.criteria.risk}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {topCandidate && (
                    <div className="border-t pt-2">
                        <div className="text-xs font-medium text-purple-600 mb-1">
                            Recommended: {topCandidate.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Best balance of feasibility, impact, and risk management
                        </div>
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    <div className="font-medium">Criteria:</div>
                    <div>F: Feasibility, I: Impact, R: Risk Level</div>
                </div>
            </CardContent>

            <CardFooter className="pt-2 pb-3 px-4">
                {data.synthesis ? (
                    <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="font-medium text-orange-700">Live Synthesis</span>
                            {data.confidence && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                    {data.confidence} confidence
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed bg-orange-50/50 p-2 rounded border-l-2 border-orange-200">
                            {data.synthesis}
                        </div>
                        {data.lastUpdate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>Updated: {new Date(data.lastUpdate).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full text-xs">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                {candidates.length} options
                            </Badge>
                            <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-purple-600" />
                                <span className="text-purple-600">
                                    Top: {topCandidate?.score || 0}
                                </span>
                            </div>
                        </div>
                        <div className="text-muted-foreground">
                            Optimization
                        </div>
                    </div>
                )}
            </CardFooter>

            <Handle type="source" position={Position.Right} className="w-3 h-3" />
            <Handle type="target" position={Position.Left} className="w-3 h-3" />
        </Card>
    );
}