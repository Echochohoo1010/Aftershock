'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card"

interface CanvasEditorProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fileName: string;
    content: string;
    onContentChange: (content: string) => void;
    position: { x: number; y: number };
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
    isOpen,
    onClose,
    title,
    fileName,
    content,
    onContentChange,
    position
}) => {
    const [isEditMode, setIsEditMode] = useState(false);

    const renderMarkdown = (markdown: string) => {
        // Simple markdown rendering - you might want to use a proper markdown library like react-markdown
        return markdown
            .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mb-1">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold mb-1">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-base font-medium mb-1">$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
        // .replace(/\n/gim, '<br>');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className=" z-100 bg-white rounded-lg border border-gray-200 shadow-xl"
                    style={{
                        left: position.x,
                        // top: position.y,
                        width: '400px',
                        height: '500px'
                    }}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
                        <div>
                            <h3 className="font-semibold text-black text-sm">{title}</h3>
                            <p className="text-xs text-gray-500">{fileName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                                title={isEditMode ? "Preview" : "Edit"}
                            >
                                {isEditMode ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Editor/Preview */}
                    <div className="flex-1 p-2 h-full">
                        {isEditMode ? (
                            <textarea
                                value={content}
                                onChange={(e) => onContentChange(e.target.value)}
                                className="w-full h-full resize-none border border-gray-200 rounded-lg p-3 text-sm font-mono text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Write your markdown content here..."
                                style={{ height: 'calc(100% - 60px)' }}
                            />
                        ) : (
                            <div
                                className="w-full h-full overflow-auto border border-gray-200 rounded-lg p-3 text-sm text-black bg-white prose prose-sm max-w-none"
                                style={{ height: 'calc(100% - 60px)' }}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                            />
                        )}


                        {/* Footer */}
                        <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-between items-center">

                            <div className="text-xs text-gray-500">
                                {content.split('\n').length} lines • {content.length} characters • {isEditMode ? 'Edit' : 'Preview'} mode
                            </div>
                            <Button
                                size="sm"
                                onClick={onClose}
                                className="h-7 text-xs"
                            >
                                Done
                            </Button>
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};
