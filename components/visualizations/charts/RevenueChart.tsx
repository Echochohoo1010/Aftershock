import React from 'react';

interface RevenueChartProps {
    revenue: number[];
    subsidies: number[];
    height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ revenue, subsidies, height = 200 }) => {
    return (
        <div className="w-full bg-white rounded-lg border border-gray-100 p-4" style={{ height }}>
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gov. Net Cash Flow</h4>
             <div className="flex items-center justify-center h-full pb-6 gap-1">
                {revenue.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-center items-center h-full relative group">
                        <div className="absolute top-1/2 w-full border-t border-gray-200"></div>
                        <div
                            className="bg-emerald-500 w-2/3 rounded-t-sm transition-all hover:bg-emerald-600"
                            style={{ height: `${val}%`, marginBottom: '50%' }}
                        ></div>
                         <div
                            className="absolute bg-rose-400 w-2/3 rounded-b-sm transition-all hover:bg-rose-500"
                            style={{ height: `${subsidies[i]}%`, top: '50%' }}
                        ></div>
                    </div>
                ))}
             </div>
        </div>
    );
};
