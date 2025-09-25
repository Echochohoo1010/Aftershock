'use client'
import React, { useState } from 'react';
import FolderScenarios from './folder-scenarios';
import { Card } from '@/components/ui/card';

const FolderDemo: React.FC = () => {
    const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({
        policy: false,
        scenarios: false,
        research: false
    });

    const toggleFolder = (folderId: string) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const policyScenarios = [
        {
            id: '1',
            title: 'Urban Housing Crisis',
            description: 'Analyzing the impact of affordable housing policies on metropolitan areas',
            status: 'active' as const
        },
        {
            id: '2',
            title: 'Transportation Reform',
            description: 'Evaluating sustainable transport solutions and their economic implications',
            status: 'pending' as const
        },
        {
            id: '3',
            title: 'Healthcare Access',
            description: 'Examining universal healthcare implementation across different demographics',
            status: 'completed' as const
        }
    ];

    const researchScenarios = [
        {
            id: '4',
            title: 'Climate Impact Assessment',
            description: 'Long-term environmental effects of current policy frameworks',
            status: 'active' as const
        },
        {
            id: '5',
            title: 'Economic Modeling',
            description: 'Predictive analysis of policy outcomes on local economies',
            status: 'pending' as const
        }
    ];

    const scenarioPlanning = [
        {
            id: '6',
            title: 'Best Case Scenario',
            description: 'Optimal outcomes with full policy implementation and stakeholder buy-in',
            status: 'completed' as const
        },
        {
            id: '7',
            title: 'Worst Case Scenario',
            description: 'Potential negative consequences and mitigation strategies',
            status: 'active' as const
        },
        {
            id: '8',
            title: 'Most Likely Scenario',
            description: 'Realistic expectations based on current trends and constraints',
            status: 'pending' as const
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Policy Analysis Folders</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FolderScenarios
                        title="Policy Analysis"
                        scenarios={policyScenarios}
                        isOpen={openFolders.policy}
                        onToggle={() => toggleFolder('policy')}
                    />

                    <FolderScenarios
                        title="Research Studies"
                        scenarios={researchScenarios}
                        isOpen={openFolders.research}
                        onToggle={() => toggleFolder('research')}
                    />

                    <FolderScenarios
                        title="Scenario Planning"
                        scenarios={scenarioPlanning}
                        isOpen={openFolders.scenarios}
                        onToggle={() => toggleFolder('scenarios')}
                    />
                </div>

                <div className="mt-12">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Usage Example</h2>
                    <div className="bg-white  h-full rounded-lg p-6 shadow-sm border border-gray-200">

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FolderDemo;