'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CausalGraph from '@/components/features/visualization/causal/causal-graph';

interface VisualizationProps {
    type: 'bar' | 'line' | 'causal';
    section: number;
}

// Sample data for different sections
const sectionData = {
    0: {
        title: "Case Overview Metrics",
        barData: [
            { name: 'Supply Chain', impact: 85, adoption: 67 },
            { name: 'ML Hardware', impact: 92, adoption: 78 },
            { name: 'AI Models', impact: 88, adoption: 45 },
            { name: 'Custom', impact: 75, adoption: 32 }
        ],
        lineData: [
            { year: '2020', value: 45 },
            { year: '2021', value: 52 },
            { year: '2022', value: 68 },
            { year: '2023', value: 78 },
            { year: '2024', value: 85 }
        ]
    },
    1: {
        title: "Data Index Trends",
        barData: [
            { name: 'Supercomputers', count: 247, performance: 89 },
            { name: 'ML Hardware', count: 156, performance: 94 },
            { name: 'AI Models', count: 89, performance: 87 },
            { name: 'Supply Chain', count: 342, performance: 76 }
        ],
        lineData: [
            { month: 'Jan', supercomputers: 220, hardware: 140, models: 75 },
            { month: 'Feb', supercomputers: 225, hardware: 145, models: 78 },
            { month: 'Mar', supercomputers: 230, hardware: 148, models: 82 },
            { month: 'Apr', supercomputers: 235, hardware: 152, models: 85 },
            { month: 'May', supercomputers: 240, hardware: 154, models: 87 },
            { month: 'Jun', supercomputers: 247, hardware: 156, models: 89 }
        ]
    },
    2: {
        title: "Causal Analysis Metrics",
        barData: [
            { name: 'Causal Links', strength: 87, confidence: 92 },
            { name: 'Impact Nodes', strength: 78, confidence: 85 },
            { name: 'Relationships', strength: 82, confidence: 88 },
            { name: 'Predictions', strength: 75, confidence: 79 }
        ],
        lineData: [
            { time: '0h', links: 1200, strength: 75 },
            { time: '1h', links: 1220, strength: 78 },
            { time: '2h', links: 1235, strength: 82 },
            { time: '3h', links: 1240, strength: 85 },
            { time: '4h', links: 1247, strength: 87 }
        ]
    },
    3: {
        title: "Search & Analysis Results",
        barData: [
            { name: 'Economic', results: 156, relevance: 89 },
            { name: 'Social', results: 98, relevance: 76 },
            { name: 'Technical', results: 234, relevance: 92 },
            { name: 'Environmental', results: 67, relevance: 71 }
        ],
        lineData: [
            { query: 'Q1', results: 45, accuracy: 78 },
            { query: 'Q2', results: 67, accuracy: 82 },
            { query: 'Q3', results: 89, accuracy: 85 },
            { query: 'Q4', results: 123, accuracy: 88 },
            { query: 'Q5', results: 156, accuracy: 91 }
        ]
    }
};



export function FoundationVisualization({ type, section }: VisualizationProps) {
    const data = sectionData[section as keyof typeof sectionData];

    if (type === 'bar') {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-sm">{data.title} - Bar Chart</CardTitle>
                </CardHeader>
                <CardContent className="h-48">
                    <div className="space-y-3 h-full flex flex-col justify-center">
                        {data.barData.map((item, index) => {
                            const values = Object.values(item);
                            const value = values[1] as number;
                            const maxValue = Math.max(...data.barData.map(d => Object.values(d)[1] as number));
                            const percentage = (value / maxValue) * 100;

                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>{item.name}</span>
                                        <span>{value}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (type === 'line') {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-sm">{data.title} - Line Chart</CardTitle>
                </CardHeader>
                <CardContent className="h-48">
                    <div className="relative h-full">
                        <svg className="w-full h-full" viewBox="0 0 300 150">
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line
                                    key={i}
                                    x1="30"
                                    y1={30 + i * 25}
                                    x2="270"
                                    y2={30 + i * 25}
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                />
                            ))}

                            {/* Data line */}
                            <polyline
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                points={data.lineData.map((item, index) => {
                                    const values = Object.values(item);
                                    const value = values[1] as number;
                                    const maxValue = Math.max(...data.lineData.map(d => Object.values(d)[1] as number));
                                    const x = 30 + (index * (240 / (data.lineData.length - 1)));
                                    const y = 130 - ((value / maxValue) * 100);
                                    return `${x},${y}`;
                                }).join(' ')}
                            />

                            {/* Data points */}
                            {data.lineData.map((item, index) => {
                                const values = Object.values(item);
                                const value = values[1] as number;
                                const maxValue = Math.max(...data.lineData.map(d => Object.values(d)[1] as number));
                                const x = 30 + (index * (240 / (data.lineData.length - 1)));
                                const y = 130 - ((value / maxValue) * 100);
                                return (
                                    <circle
                                        key={index}
                                        cx={x}
                                        cy={y}
                                        r="3"
                                        fill="hsl(var(--primary))"
                                    />
                                );
                            })}
                        </svg>

                        {/* Labels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs px-8">
                            {data.lineData.map((item, index) => (
                                <span key={index}>{Object.values(item)[0]}</span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (type === 'causal') {
        // Define causal graph data based on the current section
        const getCausalData = () => {
            switch (section) {
                case 0: // Case Overview
                    return {
                        variables: ["AI Hardware", "Model Performance", "Economic Impact", "Supply Chain", "Job Market"],
                        relationships: [
                            { from: "AI Hardware", to: "Model Performance", strength: 0.9, type: "positive" as const },
                            { from: "Model Performance", to: "Economic Impact", strength: 0.8, type: "positive" as const },
                            { from: "Economic Impact", to: "Supply Chain", strength: 0.7, type: "positive" as const },
                            { from: "Supply Chain", to: "Job Market", strength: 0.5, type: "complex" as const }
                        ]
                    };
                case 1: // Data Index
                    return {
                        variables: ["Supercomputers", "ML Hardware", "AI Models", "Research Investment", "Innovation Rate"],
                        relationships: [
                            { from: "Research Investment", to: "Supercomputers", strength: 0.8, type: "positive" as const },
                            { from: "Supercomputers", to: "ML Hardware", strength: 0.7, type: "positive" as const },
                            { from: "ML Hardware", to: "AI Models", strength: 0.9, type: "positive" as const },
                            { from: "AI Models", to: "Innovation Rate", strength: 0.6, type: "positive" as const }
                        ]
                    };
                case 2: // Causal Analysis
                    return {
                        variables: ["AI Hardware", "Model Performance", "Economic Impact", "Supply Chain", "Job Market", "Research Investment", "Regulatory Policy", "Public Adoption"],
                        relationships: [
                            { from: "AI Hardware", to: "Model Performance", strength: 0.9, type: "positive" as const },
                            { from: "Model Performance", to: "Economic Impact", strength: 0.8, type: "positive" as const },
                            { from: "Economic Impact", to: "Research Investment", strength: 0.7, type: "positive" as const },
                            { from: "Research Investment", to: "AI Hardware", strength: 0.6, type: "positive" as const },
                            { from: "Model Performance", to: "Supply Chain", strength: 0.8, type: "positive" as const },
                            { from: "Supply Chain", to: "Economic Impact", strength: 0.7, type: "positive" as const },
                            { from: "Economic Impact", to: "Job Market", strength: 0.5, type: "complex" as const },
                            { from: "Job Market", to: "Public Adoption", strength: 0.4, type: "negative" as const },
                            { from: "Public Adoption", to: "Regulatory Policy", strength: 0.6, type: "positive" as const },
                            { from: "Regulatory Policy", to: "Research Investment", strength: 0.3, type: "complex" as const }
                        ]
                    };
                case 3: // Search & Analysis
                    return {
                        variables: ["Economic Factors", "Social Impact", "Technical Innovation", "Environmental Effects", "Policy Response"],
                        relationships: [
                            { from: "Technical Innovation", to: "Economic Factors", strength: 0.8, type: "positive" as const },
                            { from: "Economic Factors", to: "Social Impact", strength: 0.6, type: "complex" as const },
                            { from: "Technical Innovation", to: "Environmental Effects", strength: 0.4, type: "negative" as const },
                            { from: "Social Impact", to: "Policy Response", strength: 0.7, type: "positive" as const },
                            { from: "Environmental Effects", to: "Policy Response", strength: 0.8, type: "positive" as const }
                        ]
                    };
                default:
                    return {
                        variables: ["AI Hardware", "Model Performance", "Economic Impact"],
                        relationships: [
                            { from: "AI Hardware", to: "Model Performance", strength: 0.9, type: "positive" as const },
                            { from: "Model Performance", to: "Economic Impact", strength: 0.8, type: "positive" as const }
                        ]
                    };
            }
        };

        const causalData = getCausalData();

        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-sm">{data.title} - Causal Graph</CardTitle>
                </CardHeader>
                <CardContent className="h-48 p-0">
                    <CausalGraph
                        variables={causalData.variables}
                        relationships={causalData.relationships}
                    />
                </CardContent>
            </Card>
        );
    }

    return null;
}

export function VisualizationMetrics({ section }: { section: number }) {
    const data = sectionData[section as keyof typeof sectionData];

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs">Data Points</span>
                <Badge variant="outline">{data.barData.length * 10}</Badge>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs">Accuracy</span>
                <Badge variant="secondary">87%</Badge>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs">Updated</span>
                <Badge>Live</Badge>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs">Section</span>
                <Badge variant="outline">{section + 1}/4</Badge>
            </div>
        </div>
    );
}