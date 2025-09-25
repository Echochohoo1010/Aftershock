'use client'
import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    MiniMap,
    Background,
    BackgroundVariant,
    Edge,
    Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PolicyCardNode, StickyNoteNode, MarkdownData } from './policy-nodes';
import { ScenarioNode } from './scenario-node';
import { MarkdownNode } from './markdown-node';
import { FolderNode } from './folder-node';
import { ImageNode } from './image-node';

// Node types mapping
const nodeTypes = {
    policyCard: PolicyCardNode,
    stickyNote: StickyNoteNode,
    scenario: ScenarioNode,
    image: ImageNode,
    markdown: MarkdownNode,
    folder: FolderNode,
};

export const PolicyExplorerCanvas = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [markdownEditorOpen, setMarkdownEditorOpen] = useState(false);
    const [selectedMarkdownNode, setSelectedMarkdownNode] = useState<{ nodeId: string, data: MarkdownData } | null>(null);
    const [folderViewerOpen, setFolderViewerOpen] = useState(false);
    const [selectedFolderNode, setSelectedFolderNode] = useState<{ nodeId: string, data: any } | null>(null);

    useEffect(() => {
        const handleOpenMarkdownEditor = (event: CustomEvent) => {
            setSelectedMarkdownNode(event.detail);
            setMarkdownEditorOpen(true);
            setFolderViewerOpen(false);
        };

        const handleOpenFolderViewer = (event: CustomEvent) => {
            setSelectedFolderNode(event.detail);
            setFolderViewerOpen(true);
            setMarkdownEditorOpen(false);
        };

        const handleGenerateAiScenarios = (event: CustomEvent) => {
            const { sourceNodeId, action, sourceTitle, scenarios } = event.detail;

            // Find the source node to position new nodes to its right
            const sourceNode = nodes.find(node => node.id === sourceNodeId);
            if (!sourceNode) return;

            // Create new scenario nodes positioned to the right of the source
            const newNodes = scenarios.map((scenario: any, index: number) => ({
                id: `ai-${action}-${Date.now()}-${index}`,
                type: 'scenario',
                position: {
                    x: sourceNode.position.x + 450 + (index * 20), // Offset each card slightly
                    y: sourceNode.position.y + (index * 60) // Stagger vertically
                },
                data: {
                    title: scenario.title,
                    description: scenario.description,
                    implications: scenario.implications,
                    metrics: scenario.metrics
                }
            }));

            // Add the new nodes to the canvas
            setNodes((nds) => [...nds, ...newNodes]);

            // Create edges connecting source to new nodes
            const newEdges = newNodes.map(node => ({
                id: `edge-${sourceNodeId}-${node.id}`,
                source: sourceNodeId,
                target: node.id,
                type: 'bezier',
                style: {
                    stroke: '#64748b',
                    strokeWidth: 2,
                    strokeDasharray: '5,5'
                }
            }));

            setEdges((eds) => [...eds, ...newEdges]);
        };

        window.addEventListener('openMarkdownEditor', handleOpenMarkdownEditor as EventListener);
        window.addEventListener('openFolderViewer', handleOpenFolderViewer as EventListener);
        window.addEventListener('generateAiScenarios', handleGenerateAiScenarios as EventListener);

        return () => {
            window.removeEventListener('openMarkdownEditor', handleOpenMarkdownEditor as EventListener);
            window.removeEventListener('openFolderViewer', handleOpenFolderViewer as EventListener);
            window.removeEventListener('generateAiScenarios', handleGenerateAiScenarios as EventListener);
        };
    }, []);

    const updateMarkdownContent = (content: string) => {
        if (selectedMarkdownNode) {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === selectedMarkdownNode.nodeId
                        ? { ...node, data: { ...node.data, content } }
                        : node
                )
            );
            setSelectedMarkdownNode({
                ...selectedMarkdownNode,
                data: { ...selectedMarkdownNode.data, content }
            });
        }
    };

    const [nodes, setNodes, onNodesChange] = useNodesState([
        {
            id: '1',
            type: 'policyCard',
            position: { x: 100, y: 100 },
            data: {
                title: 'Noise Resolution Policy',
                category: 'Community Standards',
                description: 'Comprehensive policy for managing and resolving noise complaints in residential areas...',
                fullDescription: 'This policy establishes clear procedures and standards for addressing noise disturbances, promoting peaceful coexistence in residential communities while balancing individual rights with collective well-being.',
                details: [
                    'Quiet hours enforcement (10 PM - 7 AM)',
                    'Decibel level limits for residential zones',
                    'Construction noise restrictions',
                    'Pet noise management protocols',
                    'Music and entertainment volume guidelines',
                    'Complaint filing procedures',
                    'Mediation services availability',
                    'Progressive enforcement measures',
                    'Emergency noise response protocols',
                    'Community education programs'
                ],
                tags: ['residential', 'community', 'enforcement', 'mediation']
            }
        },
        {
            id: '2',
            type: 'scenario',
            position: { x: 500, y: 50 },
            data: {
                title: 'Urban Housing Crisis Scenario',
                description: 'Exploring policy responses to affordable housing shortages in metropolitan areas.',
                implications: [
                    'Displacement of low-income families',
                    'Strain on public services',
                    'Economic inequality growth'
                ],
                metrics: [
                    'Housing affordability index',
                    'Homelessness reduction rate',
                    'Public housing availability',
                    'Community satisfaction score'
                ]
            }
        },
        {
            id: '3',
            type: 'stickyNote',
            position: { x: 200, y: 300 },
            data: {
                content: 'Key stakeholders:\n- Housing Authority\n- Community Groups\n- Local Government\n- Developers'
            }
        },
        {
            id: '4',
            type: 'markdown',
            position: { x: 600, y: 300 },
            data: {
                title: 'Policy Analysis Report',
                content: '# Policy Analysis Report\n\n## Executive Summary\nThis report analyzes the effectiveness of current housing policies.\n\n### Key Findings\n- 15% increase in affordable housing\n- Reduced wait times for public housing\n- Improved community satisfaction\n\n## Recommendations\n1. Expand affordable housing programs\n2. Streamline application processes\n3. Increase community engagement',
                fileName: 'policy-analysis.md'
            }
        },
        {
            id: '5',
            type: 'folder',
            position: { x: 100, y: 500 },
            data: {
                title: 'Housing Policies',
                scenarios: [
                    {
                        id: 'h1',
                        title: 'Affordable Housing Initiative',
                        description: 'Comprehensive affordable housing program',
                        status: 'active',
                        content: '# Affordable Housing Initiative\n\n## Overview\nA comprehensive program to increase affordable housing availability.\n\n### Goals\n- Increase affordable units by 25%\n- Reduce housing costs for low-income families\n- Improve housing quality standards'
                    },
                    {
                        id: 'h2',
                        title: 'Rent Control Measures',
                        description: 'Regulations on rental price increases',
                        status: 'pending',
                        content: '# Rent Control Measures\n\n## Purpose\nRegulate rental price increases to protect tenants.\n\n### Key Provisions\n- Maximum 3% annual rent increases\n- Tenant protection rights\n- Landlord compliance requirements'
                    }
                ]
            }
        }
    ]);

    const [edges, setEdges, onEdgesChange] = useEdgesState([
        {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'bezier',
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
                strokeDasharray: '5,5'
            }
        },
        {
            id: 'e2-3',
            source: '2',
            target: '3',
            type: 'bezier',
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
                strokeDasharray: '5,5'
            }
        }
    ]);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = {
                x: event.clientX - 250,
                y: event.clientY - 100,
            };

            let newNode;
            const id = `${Date.now()}`;

            switch (type) {
                case 'policyCard':
                    newNode = {
                        id,
                        type: 'policyCard',
                        position,
                        data: {
                            title: 'New Policy Card',
                            category: 'General',
                            description: 'Click to edit this policy description...',
                            fullDescription: 'This is a new policy card. Click the expand button to see more details and edit the content.',
                            details: ['Key point 1', 'Key point 2', 'Key point 3'],
                            tags: ['new', 'policy']
                        }
                    };
                    break;
                case 'scenario':
                    newNode = {
                        id,
                        type: 'scenario',
                        position,
                        data: {
                            title: 'New Scenario',
                            description: 'Describe your scenario here...',
                            implications: ['Implication 1', 'Implication 2'],
                            metrics: ['Metric 1', 'Metric 2']
                        }
                    };
                    break;
                case 'stickyNote':
                    newNode = {
                        id,
                        type: 'stickyNote',
                        position,
                        data: {
                            content: 'New sticky note...'
                        }
                    };
                    break;
                case 'markdown':
                    newNode = {
                        id,
                        type: 'markdown',
                        position,
                        data: {
                            title: 'New Document',
                            content: '# New Document\n\nStart writing your content here...',
                            fileName: 'new-document.md'
                        }
                    };
                    break;
                case 'folder':
                    newNode = {
                        id,
                        type: 'folder',
                        position,
                        data: {
                            title: 'New Folder',
                            scenarios: []
                        }
                    };
                    break;
                default:
                    return;
            }

            setNodes((nds) => nds.concat(newNode));
        },
        [setNodes]
    );

    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
                <div className="p-4 border-b border-gray-200">
                    <h2 className=" font-semibold text-gray-900">Policy Components</h2>
                    <p className="text-sm text-gray-600 mt-1">Drag components to the canvas</p>
                </div>

                <div className="p-2 space-y-2">
                    {/* Policy Card */}
                    <div
                        className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-grab hover:border-gray-400 transition-colors"
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', 'policyCard');
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Policy Card</div>
                                <div className="text-xs text-gray-500">Detailed policy information</div>
                            </div>
                        </div>
                    </div>

                    {/* Scenario */}
                    <div
                        className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-grab hover:border-gray-400 transition-colors"
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', 'scenario');
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Scenario</div>
                                <div className="text-xs text-gray-500">Policy scenario analysis</div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Note */}
                    <div
                        className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-grab hover:border-gray-400 transition-colors"
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', 'stickyNote');
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Sticky Note</div>
                                <div className="text-xs text-gray-500">Quick notes and ideas</div>
                            </div>
                        </div>
                    </div>

                    {/* Markdown Document */}
                    <div
                        className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-grab hover:border-gray-400 transition-colors"
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', 'markdown');
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Document</div>
                                <div className="text-xs text-gray-500">Markdown document</div>
                            </div>
                        </div>
                    </div>

                    {/* Folder */}
                    <div
                        className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-grab hover:border-gray-400 transition-colors"
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', 'folder');
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Folder</div>
                                <div className="text-xs text-gray-500">Document collection</div>
                            </div>
                        </div>
                    </div>

                    {/* Folder Browser Section */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Document Folders</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {/* Housing Policies Folder */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Housing Policies</div>
                                        <div className="text-xs text-gray-500">3 documents</div>
                                    </div>
                                </div>

                            </div>

                            {/* Transportation Folder */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Transportation</div>
                                        <div className="text-xs text-gray-500">2 documents</div>
                                    </div>
                                </div>

                            </div>

                            {/* Environment Folder */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Environment</div>
                                        <div className="text-xs text-gray-500">4 documents</div>
                                    </div>
                                </div>
                            </div>

                            {/* Research Folder */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">Research & Analysis</div>
                                        <div className="text-xs text-gray-500">3 documents</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
                {/* Canvas Controls */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* ReactFlow Canvas */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-50"
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
                    <Controls className="bg-white border border-gray-200 rounded-lg shadow-md" />
                    <MiniMap
                        className="bg-white border border-gray-200 rounded-lg shadow-md"
                        nodeColor="#64748b"
                        maskColor="rgba(0, 0, 0, 0.1)"
                    />
                </ReactFlow>

                {/* Markdown Editor Sidebar */}
                <AnimatePresence>
                    {markdownEditorOpen && selectedMarkdownNode && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-96 h-full bg-white border-l border-gray-200 shadow-2xl z-20 flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedMarkdownNode.data.title}</h3>
                                    <p className="text-sm text-gray-500">{selectedMarkdownNode.data.fileName}</p>
                                </div>
                                <button
                                    onClick={() => setMarkdownEditorOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 p-4">
                                <textarea
                                    value={selectedMarkdownNode.data.content}
                                    onChange={(e) => updateMarkdownContent(e.target.value)}
                                    className="w-full h-full resize-none border border-gray-200 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Write your markdown content here..."
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Folder Viewer Panel */}
                <AnimatePresence>
                    {folderViewerOpen && selectedFolderNode && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-[600px] h-full bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200/80 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-black">{selectedFolderNode.data.title}</h3>
                                        <p className="text-sm text-slate-500">{selectedFolderNode.data.scenarios?.length || 0} documents</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setFolderViewerOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedFolderNode.data.scenarios?.map((document: any, index: number) => (
                                        <motion.div
                                            key={document.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            onClick={() => {
                                                const markdownData = {
                                                    title: document.title,
                                                    content: document.content || `# ${document.title}\n\n${document.description}`,
                                                    fileName: `${document.title.toLowerCase().replace(/\s+/g, '-')}.md`
                                                };
                                                const event = new CustomEvent('openMarkdownEditor', {
                                                    detail: { nodeId: `doc-${document.id}`, data: markdownData }
                                                });
                                                window.dispatchEvent(event);
                                            }}
                                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-4 cursor-pointer transition-all duration-300 hover:shadow-xl h-64"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-black text-sm truncate">{document.title}</h4>
                                                    </div>
                                                </div>
                                                {document.status && (
                                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${document.status === 'active' ? 'bg-emerald-500' :
                                                        document.status === 'completed' ? 'bg-slate-500' : 'bg-amber-500'
                                                        }`} />
                                                )}
                                            </div>

                                            <div className="flex-1 overflow-hidden">
                                                <div className="space-y-3">
                                                    {document.content ? (
                                                        (() => {
                                                            const lines = document.content.split('\n');
                                                            const headings = lines.filter((line: string) => {
                                                                const trimmed = line.trim();
                                                                return trimmed.startsWith('#') && trimmed.length > 1;
                                                            }).slice(0, 4);

                                                            return headings.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {headings.map((line: string, lineIndex: number) => {
                                                                        const trimmedLine = line.trim();
                                                                        if (trimmedLine.startsWith('# ')) {
                                                                            return (
                                                                                <div key={lineIndex} className="font-bold text-black text-sm leading-tight">
                                                                                    {trimmedLine.replace(/^#\s*/, '')}
                                                                                </div>
                                                                            );
                                                                        } else if (trimmedLine.startsWith('## ')) {
                                                                            return (
                                                                                <div key={lineIndex} className="font-semibold text-gray-700 text-xs leading-tight pl-2">
                                                                                    {trimmedLine.replace(/^##\s*/, '')}
                                                                                </div>
                                                                            );
                                                                        } else if (trimmedLine.startsWith('### ')) {
                                                                            return (
                                                                                <div key={lineIndex} className="font-medium text-gray-600 text-xs leading-tight pl-4">
                                                                                    {trimmedLine.replace(/^###\s*/, '')}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="text-gray-500 text-xs italic">
                                                                    No headings found
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <div className="text-gray-500 text-xs">
                                                            {document.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {(!selectedFolderNode.data.scenarios || selectedFolderNode.data.scenarios.length === 0) && (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm">No documents in this folder</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Panel */}
                {!markdownEditorOpen && !folderViewerOpen && (
                    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-10">
                        <h3 className="font-bold text-lg mb-2">Policy Explorer</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Create and explore policy scenarios by adding cards, connecting related concepts, and documenting insights.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};