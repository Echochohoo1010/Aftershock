import React from 'react';

interface SimpleLineChartProps {
    data: number[];
    color: string;
    height?: number;
    label?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, color, height = 200, label }) => {
    // Use zoomed scaling for better visual impact
    const dataMax = Math.max(...data, 1);
    const dataMin = Math.min(...data, 0);

    // More aggressive scaling - use actual min as baseline
    const max = dataMax * 1.05; // Small padding at top
    const min = dataMin; // No padding at bottom - data starts at baseline

    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / (max - min)) * 80 - 10}`).join(' ');

    return (
        <div className="w-full relative bg-white rounded-lg border border-gray-100 p-4" style={{ height }}>
            {label && <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</h4>}
            <div className="relative h-full w-full pb-6">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <polyline points={`0,100 ${points} 100,100`} fill={color} fillOpacity="0.1" stroke="none" />
                 </svg>
            </div>

            {/* Time axis labels */}
            <div className="absolute bottom-2 left-4 text-xs text-gray-400">T-0</div>
            <div className="absolute bottom-2 right-4 text-xs text-gray-400">T-10Y</div>
        </div>
    );
};
