'use client';

import React, { useCallback, useState } from 'react';
import {
    ReactFlow,
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    MiniMap,
    Background,
    BackgroundVariant,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PolicyBriefNode } from './nodes/policy-brief-node';
import { ScenarioPathNode } from './nodes/scenario-path-node';
import { BestOfNNode } from './nodes/best-of-n-node';
import { OODANode } from './nodes/ooda-node';
import { ScenarioPlanNode } from './nodes/scenario-plan-node';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, GitBranch, Target, RefreshCw, Map, Sparkles, Brain, Activity, TrendingUp, AlertCircle, CheckCircle, Zap, Maximize2, Minimize2, Lightbulb, Eye, EyeOff, BarChart3, Shield, Clock } from 'lucide-react';

const nodeTypes = {
    policyBrief: PolicyBriefNode,
    scenarioPath: ScenarioPathNode,
    bestOfN: BestOfNNode,
    ooda: OODANode,
    scenarioPlan: ScenarioPlanNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'policyBrief',
        position: { x: 100, y: 100 },
        data: {
            title: 'Policy Brief',
            content: 'Define the policy context and key questions'
        },
    },
];

const initialEdges: Edge[] = [];

export function ScenarioPlanningCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeId, setNodeId] = useState(2);
    const [isGenerating, setIsGenerating] = useState(false);
    const [connectionUpdates, setConnectionUpdates] = useState<Array<{
        id: string;
        message: string;
        timestamp: Date;
        type: 'success' | 'info' | 'warning';
    }>>([]);
    const [isProcessingConnection, setIsProcessingConnection] = useState(false);
    const [latestSynopsis, setLatestSynopsis] = useState<string>('');
    const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
    const [isStrategyCardVisible, setIsStrategyCardVisible] = useState(true);
    const [isStatusCardVisible, setIsStatusCardVisible] = useState(true);

    const processConnection = useCallback(async (sourceNode: Node, targetNode: Node, connection: Connection) => {
        setIsProcessingConnection(true);

        try {
            // Simulate AI processing of the connection
            await new Promise(resolve => setTimeout(resolve, 1000));

            let updateMessage = '';
            let updatedTargetData = { ...targetNode.data };

            // Generate intelligent connection-based updates with synthesis
            if (sourceNode.type === 'policyBrief' && targetNode.type === 'scenarioPath') {
                const policyScenarios = [
                    { id: '1', name: 'Policy-Aligned Growth', probability: 40, impact: 'High' },
                    { id: '2', name: 'Regulatory Compliance', probability: 35, impact: 'Medium' },
                    { id: '3', name: 'Policy Resistance', probability: 25, impact: 'Low' }
                ];
                updateMessage = `Policy analysis reveals 3 scenarios: Policy-Aligned Growth (40% likely, high impact) emerges as the primary pathway, with regulatory compliance as a stable fallback option.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    scenarios: policyScenarios,
                    synthesis: 'Policy-driven scenarios prioritize alignment and compliance strategies',
                    lastUpdate: new Date().toISOString(),
                    inputSource: sourceNode.data.title
                };
            } else if (sourceNode.type === 'scenarioPath' && targetNode.type === 'bestOfN') {
                const sourceScenarios = sourceNode.data.scenarios || [];
                const topScenario = sourceScenarios.reduce((prev, current) =>
                    (prev.probability > current.probability) ? prev : current, sourceScenarios[0]);

                const optimizedCandidates = [
                    { id: '1', name: 'Multi-Scenario Strategy', score: 92, criteria: { feasibility: 88, impact: 95, risk: 20 } },
                    { id: '2', name: 'Adaptive Approach', score: 85, criteria: { feasibility: 90, impact: 80, risk: 25 } },
                    { id: '3', name: 'Conservative Path', score: 78, criteria: { feasibility: 95, impact: 70, risk: 15 } }
                ];

                updateMessage = `Analyzing ${sourceScenarios.length} scenarios: "${topScenario?.name}" (${topScenario?.probability}% probability) drives the Multi-Scenario Strategy as optimal choice (92 score) due to high impact potential and low risk profile.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    candidates: optimizedCandidates,
                    synthesis: `Best strategy: Multi-Scenario approach balances ${topScenario?.name} opportunities with risk mitigation`,
                    sourceScenarios: sourceScenarios,
                    recommendation: 'Multi-Scenario Strategy',
                    confidence: '92%',
                    lastUpdate: new Date().toISOString()
                };
            } else if (sourceNode.type === 'bestOfN' && targetNode.type === 'ooda') {
                const topStrategy = sourceNode.data.candidates?.[0] || { name: 'Top Strategy', score: 90 };
                updateMessage = `Implementing "${topStrategy.name}" (${topStrategy.score} score) into OODA loop: Observing performance metrics, Orienting based on stakeholder feedback, Deciding on adaptations, Acting on optimizations.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    title: 'Strategy-Driven OODA Loop',
                    content: `Monitoring "${topStrategy.name}" performance and adapting based on real-world feedback`,
                    phase: 'Observe',
                    cycle: 'Active',
                    monitoredStrategy: topStrategy.name,
                    strategyScore: topStrategy.score,
                    observations: ['Strategy performance metrics', 'Market feedback', 'Stakeholder responses'],
                    synthesis: `OODA loop optimized for ${topStrategy.name} with ${topStrategy.score}% confidence`,
                    lastUpdate: new Date().toISOString()
                };
            } else if (sourceNode.type === 'scenarioPath' && targetNode.type === 'scenarioPlan') {
                const scenarios = sourceNode.data.scenarios || [];
                const highImpactScenarios = scenarios.filter(s => s.impact === 'High' || s.impact === 'Very High');
                updateMessage = `Integrating ${scenarios.length} scenarios into plan: ${highImpactScenarios.length} high-impact scenarios identified, prioritizing "${scenarios[0]?.name}" for immediate planning focus.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    title: 'Scenario-Integrated Plan',
                    content: `Comprehensive planning framework addressing ${scenarios.length} potential futures`,
                    scenarios: scenarios,
                    planStatus: 'Active',
                    timeline: '12-24 months',
                    keyMilestones: ['Phase 1: Assessment', 'Phase 2: Implementation', 'Phase 3: Review'],
                    priorityScenario: scenarios[0]?.name,
                    synthesis: `Plan optimized for ${highImpactScenarios.length} high-impact scenarios`,
                    lastUpdate: new Date().toISOString()
                };
            } else if (sourceNode.type === 'bestOfN' && targetNode.type === 'scenarioPlan') {
                const strategies = sourceNode.data.candidates || [];
                const topStrategy = strategies[0] || { name: 'Top Strategy', score: 90 };
                updateMessage = `Incorporating optimal strategies: "${topStrategy.name}" (${topStrategy.score} score) selected as primary implementation path, with ${strategies.length - 1} backup strategies for contingency planning.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    title: 'Strategy-Optimized Plan',
                    content: `Action plan based on "${topStrategy.name}" with comprehensive backup strategies`,
                    strategies: strategies,
                    planStatus: 'Optimized',
                    implementation: 'Ready',
                    primaryStrategy: topStrategy.name,
                    strategyScore: topStrategy.score,
                    riskMitigation: 'Comprehensive',
                    synthesis: `Plan centered on ${topStrategy.name} (${topStrategy.score}% confidence) with ${strategies.length - 1} alternatives`,
                    lastUpdate: new Date().toISOString()
                };
            } else if (sourceNode.type === 'policyBrief' && targetNode.type === 'ooda') {
                updateMessage = `Policy framework "${sourceNode.data.title}" integrated: OODA loop now monitors regulatory changes, compliance metrics, and stakeholder feedback for continuous policy adaptation.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    title: 'Policy-Driven OODA',
                    content: 'Continuous policy monitoring and adaptation framework',
                    phase: 'Orient',
                    cycle: 'Policy-Focused',
                    policySource: sourceNode.data.title,
                    policyTracking: ['Regulatory changes', 'Compliance metrics', 'Stakeholder feedback'],
                    synthesis: `OODA loop optimized for ${sourceNode.data.title} monitoring and adaptation`,
                    lastUpdate: new Date().toISOString()
                };
            } else if (targetNode.type === 'ooda') {
                updateMessage = `"${sourceNode.data.title}" data integrated into OODA loop: Enhanced observation capabilities with ${sourceNode.type} insights for improved decision-making cycles.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    title: 'Enhanced OODA Loop',
                    content: `Feedback loop enhanced with ${sourceNode.data.title} insights`,
                    phase: 'Observe',
                    cycle: 'Enhanced',
                    inputs: [`${sourceNode.data.title} data`],
                    synthesis: `OODA enhanced with ${sourceNode.type} intelligence from ${sourceNode.data.title}`,
                    lastUpdate: new Date().toISOString()
                };
            } else if (targetNode.type === 'scenarioPlan') {
                updateMessage = `"${sourceNode.data.title}" integrated into scenario plan: Plan enhanced with ${sourceNode.type} analysis for more comprehensive strategic planning.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    title: 'Enhanced Scenario Plan',
                    content: `Comprehensive plan incorporating ${sourceNode.data.title} analysis`,
                    planStatus: 'Enhanced',
                    inputs: [`${sourceNode.data.title}`],
                    synthesis: `Plan enhanced with ${sourceNode.type} insights from ${sourceNode.data.title}`,
                    lastUpdated: new Date().toISOString()
                };
            } else {
                updateMessage = `"${sourceNode.data.title}" connected to "${targetNode.data.title}": Analyzing synergies and optimizing data flow between ${sourceNode.type} and ${targetNode.type} components.`;
                updatedTargetData = {
                    ...updatedTargetData,
                    synthesis: `Enhanced with ${sourceNode.type} data from ${sourceNode.data.title}`,
                    lastUpdate: new Date().toISOString()
                };
            }

            // Update the target node with new data
            setNodes((nds) => nds.map(node =>
                node.id === targetNode.id
                    ? { ...node, data: updatedTargetData }
                    : node
            ));

            // Add update to the status feed
            const newUpdate = {
                id: Date.now().toString(),
                message: updateMessage,
                timestamp: new Date(),
                type: 'success' as const
            };

            setConnectionUpdates(prev => [newUpdate, ...prev.slice(0, 4)]); // Keep last 5 updates

            // Generate intelligent synopsis for the dark card
            let synopsis = '';
            if (sourceNode.type === 'policyBrief' && targetNode.type === 'scenarioPath') {
                synopsis = `Policy integration complete: 3 scenarios generated with Policy-Aligned Growth leading at 40% probability. Strategic focus shifts to regulatory compliance pathways with high-impact potential.`;
            } else if (sourceNode.type === 'scenarioPath' && targetNode.type === 'bestOfN') {
                const topScenario = sourceNode.data.scenarios?.[0];
                synopsis = `Scenario analysis reveals Multi-Scenario Strategy as optimal (92% score) based on ${topScenario?.name} dominance. Risk-balanced approach recommended with 95% impact potential and minimal exposure.`;
            } else if (sourceNode.type === 'bestOfN' && targetNode.type === 'ooda') {
                const topStrategy = sourceNode.data.candidates?.[0];
                synopsis = `OODA loop activated for ${topStrategy?.name} monitoring. Continuous feedback cycle established with performance tracking, stakeholder analysis, and adaptive decision-making protocols.`;
            } else if (sourceNode.type === 'scenarioPath' && targetNode.type === 'scenarioPlan') {
                const scenarios = sourceNode.data.scenarios || [];
                synopsis = `Comprehensive plan generated from ${scenarios.length} scenarios. Priority focus on ${scenarios[0]?.name} with 12-24 month timeline and phased implementation strategy.`;
            } else if (sourceNode.type === 'bestOfN' && targetNode.type === 'scenarioPlan') {
                const topStrategy = sourceNode.data.candidates?.[0];
                synopsis = `Strategic plan optimized around ${topStrategy?.name} (${topStrategy?.score}% confidence). Implementation-ready framework with comprehensive risk mitigation and backup strategies activated.`;
            } else {
                synopsis = `Network synthesis: ${sourceNode.data.title} successfully integrated with ${targetNode.data.title}. Enhanced analytical capabilities and improved decision-making pathways established.`;
            }

            setLatestSynopsis(synopsis);

        } catch (error) {
            console.error('Connection processing failed:', error);
            const errorUpdate = {
                id: Date.now().toString(),
                message: 'Connection processing failed',
                timestamp: new Date(),
                type: 'warning' as const
            };
            setConnectionUpdates(prev => [errorUpdate, ...prev.slice(0, 4)]);
        } finally {
            setIsProcessingConnection(false);
        }
    }, [setNodes]);

    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge = addEdge(params, edges);
            setEdges(newEdge);

            // Find source and target nodes
            const sourceNode = nodes.find(n => n.id === params.source);
            const targetNode = nodes.find(n => n.id === params.target);

            if (sourceNode && targetNode) {
                processConnection(sourceNode, targetNode, params);
            }
        },
        [setEdges, edges, nodes, processConnection]
    );

    const addNode = useCallback((type: string, label: string, data: any = {}) => {
        const newNode: Node = {
            id: nodeId.toString(),
            type,
            position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
            data: {
                title: label,
                content: `New ${label.toLowerCase()} node`,
                ...data
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setNodeId((id) => id + 1);
    }, [nodeId, setNodes]);

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Only trigger if not typing in an input field
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (event.key.toLowerCase()) {
                case 'n':
                    event.preventDefault();
                    addNode('scenarioPath', 'New Scenario Path');
                    break;
                case 'b':
                    event.preventDefault();
                    addNode('bestOfN', 'Best of N Analysis');
                    break;
                case 'p':
                    event.preventDefault();
                    addNode('policyBrief', 'Policy Brief');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [addNode]);

    const generateAINode = useCallback(async (type: string) => {
        setIsGenerating(true);
        try {
            // Simulate AI generation - in real app, call your AI API
            await new Promise(resolve => setTimeout(resolve, 1500));

            let nodeData = {};
            let title = '';

            // Create diverse scenario templates
            const scenarioTemplates = [
                {
                    title: 'Climate Impact Scenarios',
                    scenarios: [
                        { id: '1', name: 'Green Transition Acceleration', probability: 40, impact: 'Very High' },
                        { id: '2', name: 'Climate Adaptation Focus', probability: 35, impact: 'High' },
                        { id: '3', name: 'Status Quo Continuation', probability: 25, impact: 'Medium' }
                    ]
                },
                {
                    title: 'Technology Disruption Paths',
                    scenarios: [
                        { id: '1', name: 'AI-Driven Automation Wave', probability: 50, impact: 'Very High' },
                        { id: '2', name: 'Gradual Digital Integration', probability: 30, impact: 'High' },
                        { id: '3', name: 'Tech Resistance Movement', probability: 20, impact: 'Medium' }
                    ]
                },
                {
                    title: 'Geopolitical Shift Analysis',
                    scenarios: [
                        { id: '1', name: 'Multipolar World Order', probability: 45, impact: 'High' },
                        { id: '2', name: 'Regional Bloc Formation', probability: 35, impact: 'Medium' },
                        { id: '3', name: 'Global Cooperation Revival', probability: 20, impact: 'Very High' }
                    ]
                },
                {
                    title: 'Economic Transformation Models',
                    scenarios: [
                        { id: '1', name: 'Circular Economy Adoption', probability: 40, impact: 'High' },
                        { id: '2', name: 'Digital Currency Dominance', probability: 35, impact: 'Very High' },
                        { id: '3', name: 'Hybrid Economic Systems', probability: 25, impact: 'Medium' }
                    ]
                },
                {
                    title: 'Social Evolution Pathways',
                    scenarios: [
                        { id: '1', name: 'Remote-First Society', probability: 55, impact: 'High' },
                        { id: '2', name: 'Community-Centric Living', probability: 25, impact: 'Medium' },
                        { id: '3', name: 'Urban Mega-Hub Concentration', probability: 20, impact: 'Very High' }
                    ]
                }
            ];

            const bestOfNTemplates = [
                {
                    title: 'Innovation Strategy Options',
                    candidates: [
                        { id: '1', name: 'Breakthrough R&D Focus', score: 91, criteria: { feasibility: 75, impact: 95, risk: 35 } },
                        { id: '2', name: 'Incremental Innovation', score: 84, criteria: { feasibility: 95, impact: 80, risk: 15 } },
                        { id: '3', name: 'Open Innovation Platform', score: 78, criteria: { feasibility: 85, impact: 85, risk: 25 } }
                    ]
                },
                {
                    title: 'Market Entry Strategies',
                    candidates: [
                        { id: '1', name: 'Direct Market Penetration', score: 87, criteria: { feasibility: 80, impact: 90, risk: 30 } },
                        { id: '2', name: 'Partnership-Based Entry', score: 82, criteria: { feasibility: 90, impact: 75, risk: 20 } },
                        { id: '3', name: 'Acquisition Strategy', score: 75, criteria: { feasibility: 70, impact: 85, risk: 40 } }
                    ]
                },
                {
                    title: 'Sustainability Approaches',
                    candidates: [
                        { id: '1', name: 'Carbon Neutral by 2030', score: 89, criteria: { feasibility: 70, impact: 95, risk: 25 } },
                        { id: '2', name: 'Circular Business Model', score: 85, criteria: { feasibility: 85, impact: 85, risk: 20 } },
                        { id: '3', name: 'Green Technology Investment', score: 79, criteria: { feasibility: 80, impact: 80, risk: 30 } }
                    ]
                },
                {
                    title: 'Digital Transformation Paths',
                    candidates: [
                        { id: '1', name: 'AI-First Architecture', score: 93, criteria: { feasibility: 75, impact: 98, risk: 35 } },
                        { id: '2', name: 'Cloud-Native Migration', score: 86, criteria: { feasibility: 90, impact: 85, risk: 20 } },
                        { id: '3', name: 'Hybrid Infrastructure', score: 81, criteria: { feasibility: 95, impact: 75, risk: 15 } }
                    ]
                },
                {
                    title: 'Workforce Evolution Models',
                    candidates: [
                        { id: '1', name: 'Skills-Based Organization', score: 88, criteria: { feasibility: 80, impact: 90, risk: 25 } },
                        { id: '2', name: 'Gig Economy Integration', score: 83, criteria: { feasibility: 85, impact: 80, risk: 30 } },
                        { id: '3', name: 'Human-AI Collaboration', score: 90, criteria: { feasibility: 70, impact: 95, risk: 35 } }
                    ]
                }
            ];

            const policyBriefTemplates = [
                {
                    title: 'Climate Policy Framework',
                    content: 'Comprehensive analysis of carbon pricing mechanisms, renewable energy incentives, and adaptation strategies for climate resilience.',
                    context: 'Based on IPCC recommendations and successful international climate policy implementations.'
                },
                {
                    title: 'Digital Rights & Privacy Policy',
                    content: 'Evaluation of data protection frameworks, AI governance principles, and digital equity measures for the modern economy.',
                    context: 'Incorporating GDPR learnings and emerging AI regulatory frameworks from leading jurisdictions.'
                },
                {
                    title: 'Healthcare System Reform',
                    content: 'Strategic assessment of universal healthcare models, preventive care integration, and health technology adoption pathways.',
                    context: 'Comparative analysis of successful healthcare systems and post-pandemic healthcare innovations.'
                },
                {
                    title: 'Education Modernization Policy',
                    content: 'Framework for integrating digital learning, skills-based curricula, and lifelong learning systems in educational policy.',
                    context: 'Evidence-based approach drawing from global education transformation success stories.'
                },
                {
                    title: 'Urban Development Strategy',
                    content: 'Policy framework for sustainable urban growth, smart city infrastructure, and inclusive community development.',
                    context: 'Synthesizing best practices from leading smart cities and sustainable urban development initiatives.'
                }
            ];

            switch (type) {
                case 'scenarioPath':
                    const scenarioTemplate = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)];
                    title = scenarioTemplate.title;
                    nodeData = {
                        scenarios: scenarioTemplate.scenarios
                    };
                    break;
                case 'bestOfN':
                    const bestOfNTemplate = bestOfNTemplates[Math.floor(Math.random() * bestOfNTemplates.length)];
                    title = bestOfNTemplate.title;
                    nodeData = {
                        candidates: bestOfNTemplate.candidates
                    };
                    break;
                case 'policyBrief':
                    const policyTemplate = policyBriefTemplates[Math.floor(Math.random() * policyBriefTemplates.length)];
                    title = policyTemplate.title;
                    nodeData = {
                        content: policyTemplate.content,
                        context: policyTemplate.context
                    };
                    break;
            }

            addNode(type, title, nodeData);

            // Add update to status feed
            const aiUpdate = {
                id: Date.now().toString(),
                message: `AI generated: ${title}`,
                timestamp: new Date(),
                type: 'info' as const
            };
            setConnectionUpdates(prev => [aiUpdate, ...prev.slice(0, 4)]);

        } catch (error) {
            console.error('Failed to generate AI node:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [addNode]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
                connectionLineType="straight"
                defaultEdgeOptions={{ type: 'straight' }}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

                <Panel position="top-left" className="space-y-2">
                    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-sm">Add Nodes</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addNode('policyBrief', 'Policy Brief')}
                                className="justify-start"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Policy Brief
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addNode('scenarioPath', 'Scenario Path')}
                                className="justify-start"
                            >
                                <GitBranch className="w-4 h-4 mr-2" />
                                Scenario Path
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addNode('bestOfN', 'Best of N')}
                                className="justify-start"
                            >
                                <Target className="w-4 h-4 mr-2" />
                                Best of N
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addNode('ooda', 'Feedback (OODA)')}
                                className="justify-start"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Feedback
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addNode('scenarioPlan', 'Scenario Plan')}
                                className="justify-start col-span-2"
                            >
                                <Map className="w-4 h-4 mr-2" />
                                Scenario Plan
                            </Button>
                        </div>
                    </div>
                </Panel>

                {/* Strategy Analysis Card */}
                {isStrategyCardVisible && (
                    <Panel position="top-right" className="space-y-2 ">
                        <div className="bg-white border rounded-lg p-4 w-96 max-h-80    overflow-y-auto   shadow-sm">
                            <div className="flex items-center  gap-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-emerald-600" />
                                <h3 className="font-semibold text-sm">Strategy Analysis</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsStrategyCardVisible(false)}
                                    className="ml-auto h-6 w-6 p-0"
                                >
                                    <EyeOff className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="space-y-3 ">
                                {/* Current Strategic Path */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-emerald-700">Current Strategic Path</div>
                                    {(() => {
                                        const bestOfNNodes = nodes.filter(n => n.type === 'bestOfN');
                                        const scenarioNodes = nodes.filter(n => n.type === 'scenarioPath');
                                        const policyNodes = nodes.filter(n => n.type === 'policyBrief');
                                        const oodaNodes = nodes.filter(n => n.type === 'ooda');
                                        const planNodes = nodes.filter(n => n.type === 'scenarioPlan');

                                        if (edges.length === 0) {
                                            return (
                                                <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                                                    <strong>Isolated Planning:</strong> You're in exploration mode with disconnected components. Connect nodes to activate strategic pathways and enable dynamic analysis.
                                                </div>
                                            );
                                        }

                                        // Analyze the strategic path based on connections
                                        const connectedPairs = edges.map(edge => {
                                            const source = nodes.find(n => n.id === edge.source);
                                            const target = nodes.find(n => n.id === edge.target);
                                            return { source: source?.type, target: target?.type };
                                        });

                                        let pathAnalysis = "";
                                        let pathType = "Basic";

                                        if (connectedPairs.some(p => p.source === 'policyBrief' && p.target === 'scenarioPath')) {
                                            pathAnalysis = "Policy-Driven Scenario Development: You're following a structured approach, grounding scenarios in policy context. ";
                                            pathType = "Structured";
                                        }

                                        if (connectedPairs.some(p => p.source === 'scenarioPath' && p.target === 'bestOfN')) {
                                            pathAnalysis += "Scenario-Informed Optimization: Your scenarios are feeding into strategic optimization, enabling evidence-based decision making. ";
                                            pathType = "Analytical";
                                        }

                                        if (connectedPairs.some(p => p.source === 'bestOfN' && p.target === 'ooda')) {
                                            pathAnalysis += "Adaptive Strategy Implementation: You've activated continuous feedback loops for strategy refinement and real-time adaptation. ";
                                            pathType = "Adaptive";
                                        }

                                        if (connectedPairs.some(p => p.target === 'scenarioPlan')) {
                                            pathAnalysis += "Comprehensive Planning Integration: Your analysis is being synthesized into actionable strategic plans. ";
                                            pathType = "Comprehensive";
                                        }

                                        if (!pathAnalysis) {
                                            pathAnalysis = "Custom Strategic Workflow: You're developing a unique analytical pathway. Consider connecting policy → scenarios → optimization → feedback for maximum strategic value.";
                                        }

                                        return (
                                            <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-emerald-800">{pathType} Strategic Path</span>
                                                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                                                        {edges.length} connections
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-emerald-700 leading-relaxed">
                                                    {pathAnalysis}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Strategic Implications */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-emerald-700">Strategic Implications</div>
                                    {(() => {
                                        const bestOfNNodes = nodes.filter(n => n.type === 'bestOfN');
                                        const scenarioNodes = nodes.filter(n => n.type === 'scenarioPath');
                                        const oodaNodes = nodes.filter(n => n.type === 'ooda');

                                        let implications = [];

                                        // Analyze based on current network state
                                        if (bestOfNNodes.length > 0) {
                                            const latestBestOfN = bestOfNNodes[bestOfNNodes.length - 1];
                                            const topCandidate = latestBestOfN.data.candidates?.[0];
                                            const riskLevel = topCandidate?.criteria?.risk || 25;

                                            if (riskLevel < 30) {
                                                implications.push(`Low-risk strategy (${riskLevel}%) suggests conservative approach with high probability of success but potentially limited breakthrough potential.`);
                                            } else if (riskLevel > 60) {
                                                implications.push(`High-risk strategy (${riskLevel}%) indicates aggressive approach with significant upside but requires robust contingency planning.`);
                                            } else {
                                                implications.push(`Balanced risk profile (${riskLevel}%) suggests optimal risk-reward ratio with manageable exposure levels.`);
                                            }
                                        }

                                        if (scenarioNodes.length > 0) {
                                            const totalScenarios = scenarioNodes.reduce((sum, node) => sum + (node.data.scenarios?.length || 0), 0);
                                            if (totalScenarios > 6) {
                                                implications.push(`High scenario diversity (${totalScenarios} scenarios) provides comprehensive future coverage but may require prioritization for focused execution.`);
                                            } else if (totalScenarios < 3) {
                                                implications.push(`Limited scenario coverage (${totalScenarios} scenarios) suggests focused approach but potential blind spots in future planning.`);
                                            }
                                        }

                                        if (oodaNodes.length > 0) {
                                            implications.push("Active feedback loops enable rapid adaptation to changing conditions and continuous strategy optimization.");
                                        } else if (bestOfNNodes.length > 0) {
                                            implications.push("Static optimization without feedback loops may miss emerging opportunities or threats requiring strategy adjustment.");
                                        }

                                        if (implications.length === 0) {
                                            implications.push("Build your strategic network to unlock deeper analytical insights and strategic implications.");
                                        }

                                        return implications.slice(0, 2).map((implication, index) => (
                                            <div key={index} className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-300 leading-relaxed">
                                                {implication}
                                            </div>
                                        ));
                                    })()}
                                </div>

                                {/* OODA Loop Intelligence */}
                                {(() => {
                                    const oodaNodes = nodes.filter(n => n.type === 'ooda');
                                    if (oodaNodes.length === 0) return null;

                                    return (
                                        <div className="space-y-2">
                                            <div className="text-xs font-medium text-emerald-700">OODA Loop Intelligence</div>
                                            {oodaNodes.map((oodaNode, index) => {
                                                const phase = oodaNode.data.phase || 'Observe';
                                                const monitoredStrategy = oodaNode.data.monitoredStrategy;
                                                const cycle = oodaNode.data.cycle || 'Active';

                                                let phaseInsight = "";
                                                switch (phase) {
                                                    case 'Observe':
                                                        phaseInsight = "Currently gathering intelligence and monitoring environmental changes.";
                                                        break;
                                                    case 'Orient':
                                                        phaseInsight = "Analyzing patterns and updating strategic understanding based on observations.";
                                                        break;
                                                    case 'Decide':
                                                        phaseInsight = "Evaluating options and selecting optimal course of action.";
                                                        break;
                                                    case 'Act':
                                                        phaseInsight = "Implementing decisions and executing strategic initiatives.";
                                                        break;
                                                    default:
                                                        phaseInsight = "Continuous cycle of observation, orientation, decision, and action.";
                                                }

                                                return (
                                                    <div key={index} className="bg-orange-50 p-2 rounded border border-orange-200">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-orange-800">
                                                                {phase} Phase {monitoredStrategy ? `• ${monitoredStrategy}` : ''}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                                                {cycle}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-orange-700">
                                                            {phaseInsight}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}

                            </div>
                        </div>
                    </Panel>
                )}

                {/* Toggle Strategy Card Button */}
                {!isStrategyCardVisible && (
                    <Panel position="top-right" className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsStrategyCardVisible(true)}
                            className="bg-white shadow-sm"
                        >
                            <Eye className="w-3 h-3 mr-1" />
                            Strategy
                        </Button>
                    </Panel>
                )}

                {/* Floating Status Card */}
                {isStatusCardVisible && (
                    <Panel position="bottom-right" className="space-y-2">
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-4 w-96 max-h-80 overflow-hidden">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <h3 className="font-semibold text-sm">Scenario Status</h3>
                                {isProcessingConnection && (
                                    <Badge variant="outline" className="text-xs">
                                        <Zap className="w-3 h-3 mr-1 animate-pulse" />
                                        Processing
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsStatusCardVisible(false)}
                                    className="ml-auto h-6 w-6 p-0"
                                >
                                    <EyeOff className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Total Nodes:</span>
                                    <Badge variant="outline" className="text-xs">{nodes.length}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Connections:</span>
                                    <Badge variant="outline" className="text-xs">{edges.length}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Network Status:</span>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${edges.length > 0 ? 'text-green-600 border-green-200' : 'text-gray-500'}`}
                                    >
                                        {edges.length > 0 ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Isolated
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </div>

                            {/* Current Network Status Sentence */}
                            <div className="border-t pt-3 mt-3">
                                <div className="text-xs text-muted-foreground">
                                    <div className="font-medium mb-1">Current Status:</div>
                                    <div className="text-xs leading-relaxed">
                                        {(() => {
                                            const nodeTypes = nodes.reduce((acc, node) => {
                                                acc[node.type] = (acc[node.type] || 0) + 1;
                                                return acc;
                                            }, {} as Record<string, number>);

                                            const hasPolicy = nodeTypes.policyBrief > 0;
                                            const hasScenarios = nodeTypes.scenarioPath > 0;
                                            const hasBestOfN = nodeTypes.bestOfN > 0;
                                            const hasOODA = nodeTypes.ooda > 0;
                                            const hasPlans = nodeTypes.scenarioPlan > 0;

                                            if (nodes.length === 1) {
                                                return "Starting with policy foundation - add scenarios and connect nodes to build your planning network.";
                                            } else if (edges.length === 0) {
                                                return `You have ${nodes.length} isolated nodes. Connect them to enable dynamic analysis and updates.`;
                                            } else if (hasPolicy && hasScenarios && edges.length > 0) {
                                                if (hasBestOfN && hasOODA) {
                                                    return "Comprehensive scenario planning network active with policy analysis, scenarios, optimization, and feedback loops.";
                                                } else if (hasBestOfN) {
                                                    return "Strong analytical network with policy context, scenarios, and optimization - consider adding feedback loops.";
                                                } else {
                                                    return "Good foundation with connected policy and scenarios - add Best of N analysis for optimization.";
                                                }
                                            } else if (edges.length > 0) {
                                                return "Network connections active - scenario planning workflow is processing and updating dynamically.";
                                            } else {
                                                return "Building scenario planning network - connect nodes to enable intelligent analysis and updates.";
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {connectionUpdates.length > 0 && (
                                <>
                                    <div className="border-t mt-3 pt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                            <span className="text-xs font-medium">Recent Updates</span>
                                        </div>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {connectionUpdates.map((update) => (
                                                <div key={update.id} className="text-xs p-2 rounded border-l-2 border-l-green-200 bg-green-50/50">
                                                    <div className="flex items-start gap-2">
                                                        {update.type === 'success' && <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />}
                                                        {update.type === 'warning' && <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />}
                                                        {update.type === 'info' && <Activity className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />}
                                                        <div className="flex-1">
                                                            <div className="text-xs">{update.message}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {update.timestamp.toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {connectionUpdates.length === 0 && (
                                <div className="border-t mt-3 pt-3">
                                    <div className="text-xs text-muted-foreground text-center py-4">
                                        Connect nodes to see dynamic updates
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>
                )}

                {/* Toggle Status Card Button */}
                {!isStatusCardVisible && (
                    <Panel position="bottom-right" className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsStatusCardVisible(true)}
                            className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
                        >
                            <Eye className="w-3 h-3 mr-1" />
                            Status
                        </Button>
                    </Panel>
                )}

                <Panel position="bottom-center" className="space-y-2">
                    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">N</Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addNode('scenarioPath', 'New Scenario Path')}
                                    className="text-xs h-7"
                                    disabled={isGenerating}
                                >
                                    New Card
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">B</Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addNode('bestOfN', 'Best of N Analysis')}
                                    className="text-xs h-7"
                                    disabled={isGenerating}
                                >
                                    Best N
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">P</Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addNode('policyBrief', 'Policy Brief')}
                                    className="text-xs h-7"
                                    disabled={isGenerating}
                                >
                                    Policy Brief
                                </Button>
                            </div>

                            <div className="border-l h-6 mx-2"></div>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    <Brain className="w-3 h-3 mr-1" />
                                    AI
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => generateAINode('scenarioPath')}
                                    className="text-xs h-7"
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            AI Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}