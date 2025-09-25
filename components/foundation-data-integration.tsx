'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeatherIcon } from 'lucide-react';

interface DataStats {
    supercomputers: number;
    mlHardware: number;
    aiModels: number;
}

interface FoundationDataIntegrationProps {
    onCardClick?: (cardType: string, cardTitle: string) => void;
    selectedCard?: string | null;
    loadingInsights?: { [key: string]: boolean };
    aiInsights?: { [key: string]: string };
}

export function FoundationDataIntegration({
    onCardClick,
    selectedCard,
    loadingInsights = {},
    aiInsights = {}
}: FoundationDataIntegrationProps) {
    const [dataStats, setDataStats] = useState<DataStats>({
        supercomputers: 0,
        mlHardware: 0,
        aiModels: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDataStats = async () => {
            try {
                // Load and count data from CSV files
                const [supercomputersRes, mlHardwareRes, aiModelsRes] = await Promise.all([
                    fetch('/data/ai_supercomputers.csv'),
                    fetch('/data/ml_hardware.csv'),
                    fetch('/data/notable_ai_models.csv')
                ]);

                const [supercomputersText, mlHardwareText, aiModelsText] = await Promise.all([
                    supercomputersRes.text(),
                    mlHardwareRes.text(),
                    aiModelsRes.text()
                ]);

                // Count rows (subtract 1 for header)
                const supercomputersCount = supercomputersText.split('\n').filter(line => line.trim()).length - 1;
                const mlHardwareCount = mlHardwareText.split('\n').filter(line => line.trim()).length - 1;
                const aiModelsCount = aiModelsText.split('\n').filter(line => line.trim()).length - 1;

                setDataStats({
                    supercomputers: Math.max(0, supercomputersCount),
                    mlHardware: Math.max(0, mlHardwareCount),
                    aiModels: Math.max(0, aiModelsCount)
                });
            } catch (error) {
                console.error('Error loading data stats:', error);
                // Fallback to placeholder data
                setDataStats({
                    supercomputers: 247,
                    mlHardware: 156,
                    aiModels: 89
                });
            } finally {
                setLoading(false);
            }
        };

        loadDataStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                    <div className="h-6 bg-muted rounded w-12"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
                className={`cursor-pointer ${selectedCard === 'supercomputers' ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => onCardClick?.('supercomputers', 'AI Supercomputers')}
            >
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        AI Supercomputers
                        {loadingInsights['supercomputers'] && (
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Global computational infrastructure powering AI development</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Total Systems</span>
                            <Badge>{dataStats.supercomputers}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Peak Performance</span>
                            <Badge variant="secondary">1.2 ExaFLOPS</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Leading Regions</span>
                            <Badge variant="outline">US, China, EU</Badge>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <Card
                className={`cursor-pointer ${selectedCard === 'ml-hardware' ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => onCardClick?.('ml-hardware', 'ML Hardware')}
            >
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        ML Hardware
                        {loadingInsights['ml-hardware'] && (
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Specialized chips and accelerators driving AI performance</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Hardware Models</span>
                            <Badge>{dataStats.mlHardware}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Performance Growth</span>
                            <Badge variant="secondary">10x/year</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Key Vendors</span>
                            <Badge variant="outline">NVIDIA, AMD, Intel</Badge>
                        </div>
                    </div>
                    {aiInsights['ml-hardware'] && (
                        <Badge variant="outline">Insights<FeatherIcon width={16} height={16} /></Badge>
                    )}
                </CardContent>
            </Card>

            <Card
                className={`cursor-pointer ${selectedCard === 'ai-models' ? 'ring-2 ring-primary' : ''
                    }`}
                onClick={() => onCardClick?.('ai-models', 'Notable AI Models')}
            >
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        Notable AI Models
                        {loadingInsights['ai-models'] && (
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Breakthrough models shaping AI capabilities</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Tracked Models</span>
                            <Badge>{dataStats.aiModels}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Parameter Scale</span>
                            <Badge variant="secondary">1T+ params</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Capabilities</span>
                            <Badge variant="outline">Multimodal</Badge>
                        </div>
                    </div>
                    {aiInsights['ai-models'] && (
                        <Badge variant="outline">Insights<FeatherIcon width={16} height={16} /></Badge>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}