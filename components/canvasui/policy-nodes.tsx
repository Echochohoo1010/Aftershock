'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Type definitions for node data
export interface PolicyCardData {
    title: string;
    category: string;
    description: string;
    fullDescription: string;
    details: string[];
    tags: string[];
}

export interface ScenarioData {
    title: string;
    description: string;
    implications: string[];
    metrics: string[];
}

export interface StickyNoteData {
    content: string;
}

export interface ImageData {
    title: string;
    description: string;
}

export interface MarkdownData {
    title: string;
    content: string;
    fileName: string;
}

export const PolicyCardNode = ({ data, selected }: NodeProps<PolicyCardData>) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 ${selected ? 'border-slate-300 shadow-slate-200' : 'border-slate-200'
                } ${isExpanded ? 'w-[420px]' : 'w-80'}`}
        >
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-300 border-white opacity-0 hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-300 border-white opacity-0 hover:opacity-100 transition-opacity" />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-xl text-black leading-tight mb-2">{data.title}</h3>
                        {data.category && (
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                                {data.category}
                            </span>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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

                <div className="text-slate-600 text-sm leading-relaxed mb-4">
                    {isExpanded ? data.fullDescription : data.description}
                </div>

                <AnimatePresence>
                    {isExpanded && data.details && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3 mb-4"
                        >
                            <h4 className="font-semibold text-slate-800 text-sm">Key Details:</h4>
                            {data.details.map((detail: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start text-sm text-slate-700"
                                >
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>{detail}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {data.tags && (
                    <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag: string, index: number) => (
                            <span key={index} className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const StickyNoteNode = ({ data, selected }: NodeProps<StickyNoteData>) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(data.content || '');

    const colors = [
        'bg-amber-50 border-amber-200',
        'bg-rose-50 border-rose-200',
        'bg-sky-50 border-sky-200',
        'bg-emerald-50 border-emerald-200',
        'bg-violet-50 border-violet-200'
    ];
    const colorClass = colors[Math.floor(Math.random() * colors.length)];

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${colorClass} rounded-2xl shadow-lg border transition-all duration-300 ${selected ? 'ring-2 ring-slate-300' : ''
                } w-64 min-h-44`}>
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-300 border-white opacity-0 hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-300 border-white opacity-0 hover:opacity-100 transition-opacity" />

            <div className="p-5">
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && e.shiftKey && setIsEditing(false)}
                        className="w-full h-28 bg-transparent resize-none outline-none text-sm text-slate-800 leading-relaxed"
                        autoFocus
                        placeholder="Write your note here..."
                    />
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="min-h-28 text-sm cursor-text text-slate-700 whitespace-pre-wrap leading-relaxed"
                    >
                        {content || (
                            <span className="text-slate-500 italic">Click to add note...</span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};