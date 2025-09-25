'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Plus, FileText } from 'lucide-react';

interface Scenario {
    id: string;
    title: string;
    description: string;
    status?: 'active' | 'completed' | 'pending';
}

interface EnhancedFolderScenariosProps {
    title: string;
    scenarios: Scenario[];
    isOpen?: boolean;
    onToggle?: () => void;
    onAddFile?: (fileName: string) => void;
    onDragStart?: (scenario: Scenario) => void;
}

const EnhancedFolderScenarios: React.FC<EnhancedFolderScenariosProps> = ({
    title,
    scenarios,
    isOpen = false,
    onToggle,
    onAddFile,
    onDragStart
}) => {
    const [internalOpen, setInternalOpen] = useState(isOpen);
    const [showAddInput, setShowAddInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalOpen(!internalOpen);
        }
    };

    const isExpanded = onToggle ? isOpen : internalOpen;

    const handleAddFile = () => {
        if (newFileName.trim() && onAddFile) {
            onAddFile(newFileName.trim());
            setNewFileName('');
            setShowAddInput(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddFile();
        } else if (e.key === 'Escape') {
            setShowAddInput(false);
            setNewFileName('');
        }
    };

    const handleDragStart = (e: React.DragEvent, scenario: Scenario) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'file',
            data: scenario
        }));
        if (onDragStart) {
            onDragStart(scenario);
        }
    };

    const handleFolderDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'folder',
            data: {
                title,
                scenarios,
                folderType: 'collection'
            }
        }));
    };

    return (
        <div
            className="w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-sm"
            draggable
            onDragStart={handleFolderDragStart}
        >
            {/* Folder Header */}
            <div className="flex items-center p-3 border-b border-gray-200">
                <div
                    className="flex items-center flex-1 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 py-1 -mx-2"
                    onClick={handleToggle}
                >
                    {isExpanded ? (
                        <FolderOpen className="w-5 h-5 text-gray-500 mr-2" />
                    ) : (
                        <Folder className="w-5 h-5 text-gray-500 mr-2" />
                    )}
                    <h3 className="text-gray-600 font-medium text-sm flex-1">{title}</h3>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                </div>

                {isExpanded && (
                    <button
                        onClick={() => setShowAddInput(true)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Add new file"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Files List */}
            {isExpanded && (
                <div className="p-2">
                    {/* Add new file input */}
                    {showAddInput && (
                        <div className="mb-2 p-2 border border-gray-200 rounded bg-gray-50">
                            <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onKeyDown={handleKeyPress}
                                onBlur={() => {
                                    if (!newFileName.trim()) {
                                        setShowAddInput(false);
                                    }
                                }}
                                placeholder="Enter file name..."
                                className="w-full text-sm bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-gray-500"
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleAddFile}
                                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddInput(false);
                                        setNewFileName('');
                                    }}
                                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {scenarios.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No files yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {scenarios.map((scenario) => (
                                <div
                                    key={scenario.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, scenario)}
                                    className="flex items-center p-2 hover:bg-gray-50 transition-colors cursor-move rounded group"
                                >
                                    <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />


                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-gray-700 font-medium text-sm truncate">
                                            {scenario.title}
                                        </h4>
                                        <p className="text-gray-500 text-xs truncate">
                                            {scenario.description}
                                        </p>
                                    </div>
                                    {scenario.status && (
                                        <div className="ml-2 flex-shrink-0">
                                            <span className={`
                        inline-block w-2 h-2 rounded-full
                        ${scenario.status === 'active' ? 'bg-gray-600' : ''}
                        ${scenario.status === 'completed' ? 'bg-gray-400' : ''}
                        ${scenario.status === 'pending' ? 'bg-gray-300' : ''}
                      `} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EnhancedFolderScenarios;