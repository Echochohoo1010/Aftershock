'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import { Popover } from './preview';
import { CanvasEditor } from './canvas-editor';

export const FolderNode = ({ data, selected, id }: NodeProps<any> & { id: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
    const [selectedDocument, setSelectedDocument] = useState<any>(null);

    const handleDocumentClick = (document: any, e?: React.MouseEvent) => {
        setSelectedDocument(document);
        if (e) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setEditorPosition({
                x: rect.right + 20,
                y: rect.top
            });
        }
        setEditorOpen(true);
    };

    const handleContentChange = (newContent: string) => {
        if (selectedDocument) {
            // Update the document content in the folder data
            const event = new CustomEvent('updateDocumentContent', {
                detail: {
                    folderId: id,
                    documentId: selectedDocument.id,
                    content: newContent
                }
            });
            window.dispatchEvent(event);
        }
    };

    const popoverContent = (
        <div className="space-y-3 w-96">
            <div className="space-y-1 border-b border-gray-100 pb-3">
                <h4 className="font-semibold text-black text-sm">{data.title}</h4>
                <p className="text-xs text-slate-500">{data.scenarios?.length || 0} documents</p>
            </div>

            {/* Documents Grid */}
            <div className="space-y-2 max-h-80 text-xs  overflow-y-auto">
                {data.scenarios && data.scenarios.length > 0 ? (
                    data.scenarios.map((document: any, index: number) => (
                        <motion.div
                            key={document.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                            onClick={(e) => handleDocumentClick(document, e)}
                            className="flex items-center gap-3 p-3 bg-slate-50/80 backdrop-blur-sm rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer border border-slate-200/50"
                        >

                            <div className="flex-1 min-w-0 max-w-32">
                                <div className="font-semibold text-black text-sm truncate">{document.title}</div>
                                <div className="text-slate-500 text-xs truncate mt-1">{document.description}</div>
                            </div>

                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No documents in this folder</p>
                    </div>
                )}
            </div>

            {data.scenarios && data.scenarios.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                    <Button
                        size="sm"
                        className="w-24 mx-auto h-8 text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Could add functionality to create new document
                        }}
                    >
                        Add Document
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Popover content={popoverContent} side="right" offset={20}>
                <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gradient-to-br from-slate-50/90 to-slate-100/90 backdrop-blur-sm rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer ${selected ? 'border-slate-300 shadow-slate-200' : 'border-slate-200'
                        } ${isExpanded ? 'w-[420px]' : 'w-80'}`}
                >
                    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-300 border-white opacity-0 hover:opacity-100 transition-opacity" />
                    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-300 border-white opacity-0 hover:opacity-100 transition-opacity" />

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 5 }}
                                    className="w-12 h-12 bg-slate-200/80 rounded-xl flex items-center justify-center"
                                >
                                    <svg className="w-7 h-7 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-xl text-black leading-tight">{data.title}</h3>
                                    <div className="text-sm text-slate-500 mt-1">
                                        {data.scenarios?.length || 0} documents
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-xl transition-colors"
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

                        {/* Compact preview of documents */}
                        <div className="space-y-2">
                            {data.scenarios && data.scenarios.length > 0 ? (
                                <>
                                    {data.scenarios.slice(0, 3).map((scenario: any, index: number) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                                            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-black text-xs truncate">{scenario.title}</div>
                                            </div>
                                            {scenario.status && (
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${scenario.status === 'active' ? 'bg-emerald-500' :
                                                    scenario.status === 'completed' ? 'bg-slate-500' : 'bg-amber-500'
                                                    }`} />
                                            )}
                                        </div>
                                    ))}
                                    {data.scenarios.length > 3 && (
                                        <div className="text-center text-slate-400 text-xs py-1">
                                            +{data.scenarios.length - 3} more documents
                                        </div>
                                    )}
                                    <div className="text-center text-slate-400 text-xs italic pt-2">
                                        Hover to explore...
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-slate-400 text-sm py-4">
                                    Empty folder
                                </div>
                            )}
                        </div>

                        <AnimatePresence>
                            {isExpanded && data.scenarios && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-3 max-h-64 overflow-y-auto mt-4 pt-4 border-t border-slate-200"
                                >
                                    {data.scenarios.slice(0, 8).map((scenario: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDocumentClick(scenario);
                                            }}
                                            className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-black text-sm truncate">{scenario.title}</div>
                                                <div className="text-slate-500 text-xs truncate mt-1">{scenario.description}</div>
                                            </div>
                                            {scenario.status && (
                                                <div className="flex-shrink-0">
                                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${scenario.status === 'active' ? 'bg-emerald-500' :
                                                        scenario.status === 'completed' ? 'bg-slate-500' : 'bg-slate-300'
                                                        }`} />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    {data.scenarios.length > 8 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center text-slate-500 text-sm py-2"
                                        >
                                            +{data.scenarios.length - 8} more documents
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </Popover>

            {
                selectedDocument && (
                    <CanvasEditor
                        isOpen={editorOpen}
                        onClose={() => {
                            setEditorOpen(false);
                            setSelectedDocument(null);
                        }}
                        title={selectedDocument.title}
                        fileName={`${selectedDocument.title.toLowerCase().replace(/\s+/g, '-')}.md`}
                        content={selectedDocument.content || `# ${selectedDocument.title}\n\n${selectedDocument.description}`}
                        onContentChange={handleContentChange}
                        position={editorPosition}
                    />
                )
            }
        </>);
};