import React from 'react';

interface AreaChartProps {
    data: Array<{ points: string }>;
    colors: string[];
    height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, colors, height = 200 }) => {
    return (
        <div className="w-full relative bg-gray-50 rounded-lg border border-gray-100 overflow-hidden" style={{ height }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                {data.map((layer, i) => (
                    <polygon
                        key={i}
                        points={`0,100 ${layer.points} 100,100`}
                        fill={colors[i]}
                        opacity="0.8"
                    />
                ))}
            </svg>
            <div className="absolute inset-0 border-t border-b border-gray-200 opacity-20 pointer-events-none flex flex-col justify-between">
                <div className="border-b border-gray-300 w-full h-0"></div>
                <div className="border-b border-gray-300 w-full h-0"></div>
                <div className="border-b border-gray-300 w-full h-0"></div>
            </div>
        </div>
    );
};
