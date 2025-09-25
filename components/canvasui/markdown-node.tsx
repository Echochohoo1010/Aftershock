'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Popover } from './preview';
import { CanvasEditor } from './canvas-editor';
import { MarkdownData } from './policy-nodes';

export const MarkdownNode = ({ data, selected, id }: NodeProps<MarkdownData> & { id: string }) => {
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });

    const handleEdit = (e?: React.MouseEvent) => {
        if (e) {
            // Position editor to the right of the click
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setEditorPosition({
                x: rect.right + 20,
                y: rect.top
            });
        }
        setEditorOpen(true);
    };

    const handleContentChange = (newContent: string) => {
        // Update the node data
        const event = new CustomEvent('updateNodeContent', {
            detail: { nodeId: id, content: newContent }
        });
        window.dispatchEvent(event);
    };

    const popoverContent = (
        <div className="space-y-3 w-80">
            <div className="space-y-1 border-b border-gray-100 pb-3">
                <h4 className="font-semibold text-black text-sm">{data.title}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{data.fileName}</p>
            </div>

            {/* Full Preview Content - Titles and Subtitles Only */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.content ? (
                    (() => {
                        const lines = data.content.split('\n');
                        const headings = lines.filter(line => {
                            const trimmed = line.trim();
                            return trimmed.startsWith('#') && trimmed.length > 1;
                        }).slice(0, 12);

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
                                            <div key={lineIndex} className="font-semibold text-gray-700 text-xs leading-tight pl-3 border-l-2 border-gray-200">
                                                {trimmedLine.replace(/^##\s*/, '')}
                                            </div>
                                        );
                                    } else if (trimmedLine.startsWith('### ')) {
                                        return (
                                            <div key={lineIndex} className="font-medium text-gray-600 text-xs leading-tight pl-6 border-l border-gray-100">
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
                        Click to add content...
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 pt-3">
                <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(e);
                    }}
                >
                    Edit Document
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Popover content={popoverContent} side="right" align="start">
                <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-br from-slate-50/90 to-slate-100/90 backdrop-blur-sm rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer ${selected ? 'border-slate-300 shadow-slate-200' : 'border-slate-200'
                        } w-80`}
                >
                    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-300 border-white opacity-0 hover:opacity-100 transition-opacity" />
                    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-300 border-white opacity-0 hover:opacity-100 transition-opacity" />

                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <motion.div
                                whileHover={{ rotate: 5 }}
                                className="w-12 h-12 bg-slate-200/80 rounded-xl flex items-center justify-center"
                            >
                                <svg className="w-7 h-7 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </motion.div>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl text-black leading-tight">{data.title}</h3>
                                <div className="text-sm text-slate-500 mt-1">{data.fileName}</div>
                            </div>
                        </div>

                        {/* Content Preview - Titles and Subtitles Only */}
                        <div className="space-y-3 max-h-48 overflow-hidden">
                            {data.content ? (
                                data.content.split('\n').slice(0, 8).map((line: string, index: number) => {
                                    const trimmedLine = line.trim();
                                    if (trimmedLine.startsWith('# ')) {
                                        return (
                                            <div key={index} className="font-bold text-black text-base leading-tight">
                                                {trimmedLine.replace(/^#\s*/, '')}
                                            </div>
                                        );
                                    } else if (trimmedLine.startsWith('## ')) {
                                        return (
                                            <div key={index} className="font-semibold text-slate-700 text-sm leading-tight mt-2">
                                                {trimmedLine.replace(/^##\s*/, '')}
                                            </div>
                                        );
                                    } else if (trimmedLine.startsWith('### ')) {
                                        return (
                                            <div key={index} className="font-medium text-slate-600 text-xs leading-tight mt-1">
                                                {trimmedLine.replace(/^###\s*/, '')}
                                            </div>
                                        );
                                    } else if (trimmedLine) {
                                        return (
                                            <div key={index} className="text-slate-600 text-xs leading-relaxed">
                                                {trimmedLine.length > 50 ? trimmedLine.substring(0, 50) + '...' : trimmedLine}
                                            </div>
                                        );
                                    }
                                    return null;
                                })
                            ) : (
                                <div className="text-slate-400 italic text-sm">Empty document</div>
                            )}
                            {data.content && data.content.split('\n').length > 8 && (
                                <div className="text-slate-400 text-xs italic">Hover to preview...</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </Popover>

            <CanvasEditor
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                title={data.title}
                fileName={data.fileName}
                content={data.content}
                onContentChange={handleContentChange}
                position={editorPosition}
            />
        </>
    );
};