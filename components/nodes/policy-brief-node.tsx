'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { FileText, Edit3, Check, X, Users, Target } from 'lucide-react';

interface PolicyBriefData {
    title: string;
    content: string;
    context?: string;
    keyQuestions?: string[];
}

export function PolicyBriefNode({ data, selected }: NodeProps<PolicyBriefData>) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(data.content || '');
    const [editContext, setEditContext] = useState(data.context || '');

    const handleSave = () => {
        // In a real app, you'd update the node data here
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(data.content || '');
        setEditContext(data.context || '');
        setIsEditing(false);
    };

    return (
        <Card className={`w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
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
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Policy context and overview..."
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] text-xs"
                        />
                        <Textarea
                            placeholder="Additional context..."
                            value={editContext}
                            onChange={(e) => setEditContext(e.target.value)}
                            className="min-h-[40px] text-xs"
                        />
                        <div className="flex gap-1">
                            <Button size="sm" onClick={handleSave} className="h-6 px-2">
                                <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{data.content}</p>
                        {data.context && (
                            <p className="text-xs text-muted-foreground border-l-2 border-blue-200 pl-2">
                                {data.context}
                            </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                            <div className="font-medium">Key Questions:</div>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                                <li>What are the policy objectives?</li>
                                <li>What are the key stakeholders?</li>
                                <li>What are the potential impacts?</li>
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 pb-3 px-4">
                <div className="flex items-center justify-between w-full text-xs">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Policy Analysis
                        </Badge>
                        <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-600">Strategic</span>
                        </div>
                    </div>
                    <div className="text-muted-foreground">
                        Foundation
                    </div>
                </div>
            </CardFooter>

            <Handle type="source" position={Position.Right} className="w-3 h-3" />
            <Handle type="target" position={Position.Left} className="w-3 h-3" />
        </Card>
    );
}