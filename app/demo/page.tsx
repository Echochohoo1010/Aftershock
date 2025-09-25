'use client'
import React, { useState } from 'react';
import FolderDemo from '../../components/folder-demo';
import { PolicyExplorerCanvas as PolicyCanvas } from '../../components/canvasui/policy-canvas';

const DemoPage = () => {
    const [activeDemo, setActiveDemo] = useState<'folders' | 'canvas'>('folders');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Demo Selector */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="max-w-4xl mx-auto flex gap-4">
                    <button
                        onClick={() => setActiveDemo('folders')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDemo === 'folders'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Folder Scenarios
                    </button>
                    <button
                        onClick={() => setActiveDemo('canvas')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDemo === 'canvas'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Policy Canvas
                    </button>
                </div>
            </div>

            {/* Demo Content */}
            {activeDemo === 'folders' ? <FolderDemo /> : <PolicyCanvas />}
        </div>
    );
};

export default DemoPage;