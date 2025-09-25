'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { ScenarioData } from './policy-nodes';
import { Feather, FeatherIcon, RadarIcon } from 'lucide-react';

export const ScenarioNode = ({ data, selected, id }: NodeProps<ScenarioData> & { id: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAiAction = async (action: 'branch' | 'forward' | 'backward') => {
        setIsProcessing(true);
        setAiDropdownOpen(false);

        try {
            // Call the AI API to generate scenarios
            const response = await fetch('/api/generate-scenarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sourceTitle: data.title,
                    sourceDescription: data.description,
                    action,
                    implications: data.implications,
                    metrics: data.metrics
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate scenarios');
            }

            const { scenarios } = await response.json();

            // Generate new scenario cards with AI-generated content
            const event = new CustomEvent('generateAiScenarios', {
                detail: {
                    sourceNodeId: id,
                    action,
                    sourceTitle: data.title,
                    scenarios
                }
            });
            window.dispatchEvent(event);

        } catch (error) {
            console.error('Error generating AI scenarios:', error);

            // Fallback to basic scenarios if AI fails
            const fallbackScenarios = [
                {
                    title: `${action === 'branch' ? 'Alternative' : action === 'forward' ? 'Future' : 'Root Cause'} Scenario 1`,
                    description: `Generated ${action} analysis based on "${data.title}"`,
                    implications: [`Key implication 1 for ${action}`, `Key implication 2 for ${action}`],
                    metrics: [`${action} metric 1`, `${action} metric 2`]
                },
                {
                    title: `${action === 'branch' ? 'Alternative' : action === 'forward' ? 'Future' : 'Root Cause'} Scenario 2`,
                    description: `Alternative ${action} approach for "${data.title}"`,
                    implications: [`Alternative implication 1`, `Alternative implication 2`],
                    metrics: [`Alternative metric 1`, `Alternative metric 2`]
                }
            ];

            const event = new CustomEvent('generateAiScenarios', {
                detail: {
                    sourceNodeId: id,
                    action,
                    sourceTitle: data.title,
                    scenarios: fallbackScenarios
                }
            });
            window.dispatchEvent(event);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-xl border transition-all duration-300 relative ${selected ? 'border-blue-300 shadow-blue-200' : 'border-slate-700'
                } ${isExpanded ? 'w-[420px]' : 'w-80'}`}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-300 border-white opacity-0 hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-300 border-white opacity-0 hover:opacity-100 transition-opacity" />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-xl leading-tight mb-2">{data.title}</h3>
                        <div className="text-slate-300 text-sm leading-relaxed">
                            {data.description}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <motion.svg
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                    </motion.button>
                </div>

                {/* AI Explore Section */}
                <div className="mb-4">
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                            disabled={isProcessing}
                            className={`w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-600/20 to-gray-600/20 backdrop-blur-sm border border-gray-400/30 rounded-xl text-sm font-medium transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:from-gray-600/30 hover:to-gray-600/30'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {isProcessing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4"
                                    >
                                        <RadarIcon className="w-4 h-4" />
                                    </motion.div>
                                ) : (
                                    <RadarIcon className="w-4 h-4" />
                                )}
                                <span className="text-blue-200">
                                    {isProcessing ? 'AI Generating Scenarios...' : 'Explore with AI'}
                                </span>
                            </div>
                            {!isProcessing && (
                                <motion.svg
                                    animate={{ rotate: aiDropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-4 h-4 text-blue-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                            )}
                        </motion.button>

                        {/* AI Actions Dropdown */}
                        <AnimatePresence>
                            {aiDropdownOpen && !isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden"
                                >
                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                        onClick={() => handleAiAction('branch')}
                                        className="w-full flex items-center gap-3 p-3 text-left text-sm hover:bg-blue-600/10 transition-colors border-b border-slate-700"
                                    >
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Branch</div>
                                            <div className="text-xs text-slate-400">Create alternative scenarios</div>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                        onClick={() => handleAiAction('forward')}
                                        className="w-full flex items-center gap-3 p-3 text-left text-sm hover:bg-blue-600/10 transition-colors border-b border-slate-700"
                                    >
                                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Forward</div>
                                            <div className="text-xs text-slate-400">Explore future implications</div>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                        onClick={() => handleAiAction('backward')}
                                        className="w-full flex items-center gap-3 p-3 text-left text-sm hover:bg-blue-600/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Backward</div>
                                            <div className="text-xs text-slate-400">Analyze root causes</div>
                                        </div>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {data.implications && (
                                <div>
                                    <h4 className="font-semibold mb-3 text-slate-200">Key Implications:</h4>
                                    <div className="space-y-2">
                                        {data.implications.map((item: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-start text-sm text-slate-300"
                                            >
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                <span>{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.metrics && (
                                <div>
                                    <h4 className="font-semibold mb-3 text-slate-200">Success Metrics:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {data.metrics.map((metric: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-xs font-medium"
                                            >
                                                {metric}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};