'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageCircle, BarChart3, Network, Cpu, Zap, TrendingUp, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AIModelTree from '@/components/features/visualization/ai-model-tree';
import AIModelSearch from '@/components/features/ai-model-search';
import { FoundationDataIntegration } from '@/components/foundation-data-integration';
import { FoundationVisualization, VisualizationMetrics } from '@/components/foundation-visualizations';

export default function FoundationPage() {
    const [selectedCase, setSelectedCase] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(0);
    const [visualizationType, setVisualizationType] = useState<'bar' | 'line' | 'causal'>('bar');
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [aiInsights, setAiInsights] = useState<{ [key: string]: string }>({});
    const [loadingInsights, setLoadingInsights] = useState<{ [key: string]: boolean }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Handle scroll to update active section and visualization
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('[data-section]');
            const scrollContainer = document.querySelector('[data-scroll-container]');

            if (!scrollContainer) return;

            const scrollTop = scrollContainer.scrollTop;
            const containerHeight = scrollContainer.clientHeight;

            // Calculate which section is most visible based on scroll position
            let newActiveSection = 0;
            sections.forEach((section, index) => {
                const element = section as HTMLElement;
                const sectionTop = element.offsetTop;
                const sectionBottom = sectionTop + element.offsetHeight;
                const viewportCenter = scrollTop + containerHeight / 2;

                if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
                    newActiveSection = index;
                }
            });

            if (newActiveSection !== activeSection) {
                setActiveSection(newActiveSection);
            }
        };

        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            // Initial check
            handleScroll();
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [activeSection]);

    // Generate AI insights for selected card
    const generateAIInsights = async (cardType: string, cardTitle: string) => {
        if (aiInsights[cardType]) {
            setModalContent({ title: cardTitle, content: aiInsights[cardType] });
            setModalOpen(true);
            return; // Already have insights for this card
        }

        setLoadingInsights(prev => ({ ...prev, [cardType]: true }));
        setModalContent({ title: cardTitle, content: 'Generating insights...' });
        setModalOpen(true);

        try {
            const scenario = {
                title: `AI Foundation Analysis - ${cardTitle}`,
                variables: [
                    "AI Hardware", "Model Performance", "Economic Impact",
                    "Supply Chain", "Job Market", "Research Investment",
                    "Regulatory Policy", "Public Adoption", "Innovation Rate",
                    "Market Competition", "Technology Adoption", "Social Impact"
                ]
            };

            const query = `Analyze the ${cardTitle} in the context of AI foundation development. Provide insights on:
            1. Current trends and key metrics
            2. Impact on AI ecosystem and society
            3. Future implications and opportunities
            4. Key relationships with other AI foundation elements
            
            Please format your response in markdown with:
            - Clear headings (## for main sections)
            - Bullet points for key insights
            - **Bold text** for important metrics or findings
            - Code blocks for technical details if relevant
            
            Focus on actionable insights and data-driven analysis.`;

            const response = await fetch('/api/reason', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    scenario,
                    mode: 'causal_graph'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate insights');
            }

            const data = await response.json();
            const insights = data.response;
            setAiInsights(prev => ({ ...prev, [cardType]: insights }));
            setModalContent({ title: cardTitle, content: insights });
        } catch (error) {
            console.error('Error generating AI insights:', error);
            const errorMessage = 'Failed to generate insights. Please try again.';
            setAiInsights(prev => ({ ...prev, [cardType]: errorMessage }));
            setModalContent({ title: cardTitle, content: errorMessage });
        } finally {
            setLoadingInsights(prev => ({ ...prev, [cardType]: false }));
        }
    };

    // Handle chat message sending
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);

        try {
            const enhancedQuery = `${userMessage}

Please format your response in markdown with appropriate formatting (headings, bullet points, **bold** for emphasis, etc.) for better readability.`;

            const response = await fetch('/api/reason', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: enhancedQuery,
                    scenario: {
                        title: 'AI Foundation Chat',
                        variables: [
                            "AI Hardware", "Model Performance", "Economic Impact",
                            "Supply Chain", "Job Market", "Research Investment",
                            "Regulatory Policy", "Public Adoption"
                        ]
                    },
                    mode: 'chat'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error sending chat message:', error);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex max-w-8xl  mx-auto">
            {/* Left Sidebar - 20% */}
            <div className="w-1/5 bg-background border-r p-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Network className="h-4 w-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">AI Foundation</span>
                            <span className="truncate text-xs">Impact Explorer</span>
                        </div>
                    </div>

                    {/* Exploration Cases */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Exploration Cases</h3>
                        <div className="space-y-1">
                            <Button
                                variant={selectedCase === 'supply-chain' ? 'default' : 'ghost'}
                                className="w-full justify-start h-auto p-3"
                                onClick={() => setSelectedCase('supply-chain')}
                            >
                                <Network className="h-4 w-4 mr-2" />
                                <div className="text-left">
                                    <div className="text-sm">Supply Chain Impact</div>
                                </div>
                            </Button>
                            <Button
                                variant={selectedCase === 'ml-hardware' ? 'default' : 'ghost'}
                                className="w-full justify-start h-auto p-3"
                                onClick={() => setSelectedCase('ml-hardware')}
                            >
                                <Cpu className="h-4 w-4 mr-2" />
                                <div className="text-left">
                                    <div className="text-sm">ML Hardware Evolution</div>
                                </div>
                            </Button>
                            <Button
                                variant={selectedCase === 'ai-models' ? 'default' : 'ghost'}
                                className="w-full justify-start h-auto p-3"
                                onClick={() => setSelectedCase('ai-models')}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                <div className="text-left">
                                    <div className="text-sm">Notable AI Models</div>
                                </div>
                            </Button>
                            <Button
                                variant={selectedCase === 'custom' ? 'default' : 'ghost'}
                                className="w-full justify-start h-auto p-3"
                                onClick={() => setSelectedCase('custom')}
                            >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                <div className="text-left">
                                    <div className="text-sm">Custom Analysis</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Configuration */}
                    {selectedCase && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">Configuration</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Impact Domain</label>
                                    <Select>
                                        <SelectTrigger className="h-8 text-xs mt-1">
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="economic">Economic</SelectItem>
                                            <SelectItem value="social">Social</SelectItem>
                                            <SelectItem value="technological">Technological</SelectItem>
                                            <SelectItem value="environmental">Environmental</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Time Horizon</label>
                                    <Select>
                                        <SelectTrigger className="h-8 text-xs mt-1">
                                            <SelectValue placeholder="Select timeframe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="current">Current (2024)</SelectItem>
                                            <SelectItem value="short">Short-term (1-3 years)</SelectItem>
                                            <SelectItem value="medium">Medium-term (3-10 years)</SelectItem>
                                            <SelectItem value="long">Long-term (10+ years)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Controls</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Time Range</label>
                                <Select>
                                    <SelectTrigger className="h-8 text-xs mt-1">
                                        <SelectValue placeholder="2020-2024" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2020-2024">2020-2024</SelectItem>
                                        <SelectItem value="2015-2024">2015-2024</SelectItem>
                                        <SelectItem value="2010-2024">2010-2024</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full h-8 text-xs">Run Simulation</Button>
                        </div>
                    </div>


                </div>
            </div>

            {/* Main Content - 60% (3/5) */}
            <div className="w-3/5 relative">
                <div className="h-full overflow-y-auto snap-y snap-mandatory" data-scroll-container>
                    {/* Section 1: Case Overview */}
                    <section data-section="0" className="min-h-full p-8 snap-start flex flex-col justify-center">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8">Exploration Overview</h2>
                            {selectedCase ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {selectedCase === 'supply-chain' && <Network className="h-5 w-5" />}
                                            {selectedCase === 'ml-hardware' && <Cpu className="h-5 w-5" />}
                                            {selectedCase === 'ai-models' && <Zap className="h-5 w-5" />}
                                            {selectedCase === 'custom' && <BarChart3 className="h-5 w-5" />}
                                            {selectedCase === 'supply-chain' && 'Supply Chain Impact Analysis'}
                                            {selectedCase === 'ml-hardware' && 'ML Hardware Evolution Analysis'}
                                            {selectedCase === 'ai-models' && 'Notable AI Models Analysis'}
                                            {selectedCase === 'custom' && 'Custom Impact Analysis'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground mb-4">
                                            {selectedCase === 'supply-chain' && 'Explore how AI transforms supply chain operations, logistics, and global trade networks.'}
                                            {selectedCase === 'ml-hardware' && 'Analyze the development and impact of specialized AI hardware and supercomputers.'}
                                            {selectedCase === 'ai-models' && 'Track the evolution and capabilities of breakthrough AI models and their societal impact.'}
                                            {selectedCase === 'custom' && 'Define your own exploration parameters and analyze specific AI impact scenarios.'}
                                        </p>
                                        <div className="flex gap-2">
                                            {selectedCase === 'supply-chain' && (
                                                <>
                                                    <Badge variant="secondary">Logistics</Badge>
                                                    <Badge variant="secondary">Automation</Badge>
                                                    <Badge variant="secondary">Optimization</Badge>
                                                </>
                                            )}
                                            {selectedCase === 'ml-hardware' && (
                                                <>
                                                    <Badge variant="secondary">GPUs</Badge>
                                                    <Badge variant="secondary">TPUs</Badge>
                                                    <Badge variant="secondary">Performance</Badge>
                                                </>
                                            )}
                                            {selectedCase === 'ai-models' && (
                                                <>
                                                    <Badge variant="secondary">LLMs</Badge>
                                                    <Badge variant="secondary">Capabilities</Badge>
                                                    <Badge variant="secondary">Scale</Badge>
                                                </>
                                            )}
                                            {selectedCase === 'custom' && (
                                                <>
                                                    <Badge variant="secondary">Custom</Badge>
                                                    <Badge variant="secondary">Flexible</Badge>
                                                    <Badge variant="secondary">Research</Badge>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-12">
                                            <Network className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                            <h3 className="text-xl font-medium mb-2">Select an Exploration Case</h3>
                                            <p className="text-muted-foreground">Choose a case from the sidebar to begin your AI impact analysis</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* Section 2: Data Index */}
                    <section data-section="1" className="min-h-full p-8 snap-start">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8">Data Index & Insights</h2>
                            <FoundationDataIntegration
                                onCardClick={generateAIInsights}
                                selectedCard={selectedCard}
                                loadingInsights={loadingInsights}
                                aiInsights={aiInsights}
                            />

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card
                                    className="hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => generateAIInsights('supply-chain', 'Supply Chain Impact')}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            Supply Chain Impact
                                            {loadingInsights['supply-chain'] && (
                                                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">AI transformation across global supply networks</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Efficiency Gains</span>
                                                <Badge>15-30%</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Cost Reduction</span>
                                                <Badge variant="secondary">$2.1T</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Adoption Rate</span>
                                                <Badge variant="outline">67%</Badge>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>

                                <Card
                                    className="hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => generateAIInsights('economic', 'Economic Indicators')}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            Economic Indicators
                                            {loadingInsights['economic'] && (
                                                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">Macroeconomic effects of AI adoption</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">GDP Impact</span>
                                                <Badge>+14%</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Job Displacement</span>
                                                <Badge variant="secondary">375M</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">New Jobs Created</span>
                                                <Badge variant="outline">97M</Badge>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: AI Model Evolution */}
                    <section data-section="2" className="min-h-full p-8 snap-start flex flex-col justify-center">
                        <div className="max-w-6xl mx-auto w-full">
                            <h2 className="text-3xl font-bold mb-8">AI Model Evolution Tree</h2>
                            <Card className="h-[600px]">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Model Development Timeline & Relationships</span>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Expand All</Button>
                                            <Button variant="outline" size="sm">Export Tree</Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-full p-0">
                                    <AIModelTree />
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section 4: Analysis */}
                    <section data-section="3" className="min-h-full p-8 snap-start">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8">Detailed Analysis</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Search Results</CardTitle>
                                            <div className="flex gap-2">
                                                <Input placeholder="Search specific impacts, models, or relationships..." className="flex-1" />
                                                <Button>Search</Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="border-l-4 border-blue-500 pl-4">
                                                    <h4 className="font-medium">Supply Chain Automation Impact</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        AI-driven automation in supply chains has reduced operational costs by 15-30% across major logistics companies...
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="secondary">Logistics</Badge>
                                                        <Badge variant="secondary">Cost Reduction</Badge>
                                                    </div>
                                                </div>

                                                <div className="border-l-4 border-green-500 pl-4">
                                                    <h4 className="font-medium">GPU Performance Scaling</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        ML hardware performance has increased 10x annually, enabling larger model training and deployment...
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="secondary">Hardware</Badge>
                                                        <Badge variant="secondary">Performance</Badge>
                                                    </div>
                                                </div>

                                                <div className="border-l-4 border-purple-500 pl-4">
                                                    <h4 className="font-medium">Large Language Model Capabilities</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Recent LLMs demonstrate emergent capabilities in reasoning, coding, and multimodal understanding...
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="secondary">LLMs</Badge>
                                                        <Badge variant="secondary">Capabilities</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Key Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Causal Links</span>
                                                <Badge>1,247</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Impact Strength</span>
                                                <Badge variant="secondary">High</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Confidence</span>
                                                <Badge variant="outline">87%</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Chat Interface */}
                <div className={`absolute bottom-0 left-0 right-0 bg-background border-t transition-all duration-300 ${chatOpen ? 'h-80' : 'h-16'} z-50`}>
                    <div className="px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                <span className="font-medium">AI Assistant</span>
                                {!chatOpen && <span className="text-sm text-muted-foreground">Ask questions about the data and analysis</span>}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setChatOpen(!chatOpen)}
                            >
                                {chatOpen ? 'Minimize' : 'Open Chat'}
                            </Button>
                        </div>
                        {chatOpen && (
                            <div className="pb-4">
                                <div className="bg-muted/50 rounded-lg p-4 h-48 mb-4 overflow-y-auto">
                                    {chatMessages.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Ask questions about AI impacts, data patterns, or request specific analyses.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {chatMessages.map((message, index) => (
                                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${message.role === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                        }`}>
                                                        {message.role === 'assistant' ? (
                                                            <div className="prose prose-xs max-w-none dark:prose-invert">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm]}
                                                                    components={{
                                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                                        li: ({ children }) => <li>{children}</li>,
                                                                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                                                        code: ({ children }) => <code className="bg-black/10 px-1 rounded text-xs">{children}</code>,
                                                                    }}
                                                                >
                                                                    {message.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        ) : (
                                                            message.content
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {chatLoading && (
                                                <div className="flex justify-start">
                                                    <div className="bg-muted p-3 rounded-lg text-sm">
                                                        <div className="animate-pulse">Thinking...</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ask about AI impacts, data patterns, or request analysis..."
                                        className="flex-1"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                        disabled={chatLoading}
                                    />
                                    <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - 20% */}
            <div className="w-2/5 bg-background border-l p-4 overflow-y-auto">
                <div className="space-y-4">
                    {/* Visualization Controls */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold text-sm">Visualizations</span>
                            <Badge variant="outline" className="text-xs">Section {activeSection + 1}</Badge>
                        </div>

                        <div className="flex gap-1">
                            <Button
                                variant={visualizationType === 'bar' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVisualizationType('bar')}
                                className="flex-1"
                            >
                                <BarChart3 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant={visualizationType === 'line' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVisualizationType('line')}
                                className="flex-1"
                            >
                                <TrendingUp className="h-3 w-3" />
                            </Button>
                            <Button
                                variant={visualizationType === 'causal' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVisualizationType('causal')}
                                className="flex-1"
                            >
                                <Network className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Dynamic Visualization */}
                    <FoundationVisualization
                        type={visualizationType}
                        section={activeSection}
                    />

                    {/* Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VisualizationMetrics section={activeSection} />
                        </CardContent>
                    </Card>

                    {/* AI Model Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">AI Model Search</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <AIModelSearch />
                        </CardContent>
                    </Card>

                    {/* Section Navigation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Section Navigation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {['Overview', 'Data Index', 'Simulation', 'Analysis'].map((name, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded text-xs cursor-pointer transition-colors ${activeSection === index
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                        }`}
                                    onClick={() => {
                                        const section = document.querySelector(`[data-section="${index}"]`);
                                        const scrollContainer = document.querySelector('[data-scroll-container]');
                                        if (section && scrollContainer) {
                                            const sectionTop = (section as HTMLElement).offsetTop;
                                            scrollContainer.scrollTo({
                                                top: sectionTop,
                                                behavior: 'smooth'
                                            });
                                        }
                                    }}
                                >
                                    {name}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* AI Insights Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{modalContent?.title}</DialogTitle>
                        <DialogDescription>
                            AI-generated insights and analysis
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {loadingInsights[selectedCard || ''] ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                                <span className="ml-3">Generating insights...</span>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-3">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-base font-medium mb-2">{children}</h3>,
                                        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                        em: ({ children }) => <em className="italic">{children}</em>,
                                        code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                                        pre: ({ children }) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">{children}</pre>,
                                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>,
                                    }}
                                >
                                    {modalContent?.content || ''}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}