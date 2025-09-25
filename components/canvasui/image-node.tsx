'use client'
import React from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { ImageData } from './policy-nodes';

export const ImageNode = ({ data, selected }: NodeProps<ImageData>) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${selected ? 'border-blue-200 shadow-blue-100' : 'border-gray-100'
            } w-72`}>
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-300 border-white opacity-0 hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-300 border-white opacity-0 hover:opacity-100 transition-opacity" />

            <div className="p-4">
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
                    <div className="relative z-10 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-sm text-gray-600 font-medium">Visualization</div>
                    </div>
                </div>

                <div className="text-center">
                    {data.title && (
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{data.title}</h3>
                    )}
                    {data.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};