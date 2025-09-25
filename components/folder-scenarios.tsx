'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';

interface Scenario {
    id: string;
    title: string;
    description: string;
    status?: 'active' | 'completed' | 'pending';
}

interface FolderScenariosProps {
    title: string;
    scenarios: Scenario[];
    isOpen?: boolean;
    onToggle?: () => void;
}

const FolderScenarios: React.FC<FolderScenariosProps> = ({
    title,
    scenarios,
    isOpen = false,
    onToggle
}) => {
    const [internalOpen, setInternalOpen] = useState(isOpen);

    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalOpen(!internalOpen);
        }
    };

    const isExpanded = onToggle ? isOpen : internalOpen;

    return (
        <div className="w-full max-w-md  bg-white border border-gray-300 rounded-lg shadow-sm">
            {/* Folder Header */}
            <div
                className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleToggle}
            >
                <div className="flex items-center flex-1">
                    {isExpanded ? (
                        <FolderOpen className="w-5 h-5 text-gray-500 mr-2" />
                    ) : (
                        <Folder className="w-5 h-5 text-gray-500 mr-2" />
                    )}
                    <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
            </div>

            {/* Scenarios List */}
            {isExpanded && (
                <div className="border-t border-gray-200">
                    {scenarios.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No scenarios available
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {scenarios.map((scenario) => (
                                <div
                                    key={scenario.id}
                                    className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-gray-700 font-medium text-sm mb-1">
                                                {scenario.title}
                                            </h4>
                                            <p className="text-gray-500 text-xs leading-relaxed">
                                                {/* {scenario.description} */}
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FolderScenarios;