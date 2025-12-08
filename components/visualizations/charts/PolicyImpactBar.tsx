import React from 'react';

interface PolicyImpactBarProps {
    label: string;
    baseVal: number;
    taxVal: number;
    isTaxed: boolean;
    formatVal: (v: number) => string;
    taxColor?: string;
    taxTextColor?: string;
}

export const PolicyImpactBar: React.FC<PolicyImpactBarProps> = ({
    label,
    baseVal,
    taxVal,
    isTaxed,
    formatVal,
    taxColor = "bg-rose-500",
    taxTextColor = "text-rose-500"
}) => {
    // Use fixed scale with 30% headroom for potential tax increases
    const maxScale = baseVal * 1.3;
    const baseWidth = (baseVal / maxScale) * 100;
    const taxWidth = (taxVal / maxScale) * 100;

    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                <span className="text-xs font-mono text-gray-500 transition-all">
                    {formatVal(isTaxed ? baseVal + taxVal : baseVal)}
                </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full flex overflow-hidden relative">
                <div
                    className="h-full bg-gray-400 transition-all duration-300"
                    style={{ width: `${baseWidth}%` }}
                />
                <div
                    className={`h-full ${taxColor} transition-all duration-500 ease-out`}
                    style={{
                        width: isTaxed ? `${taxWidth}%` : '0%',
                        opacity: isTaxed ? 1 : 0
                    }}
                />
            </div>
            <div className="flex justify-between mt-1 h-3">
                 <span className="text-[9px] text-gray-400">Base Price {formatVal(baseVal)}</span>
                 <span className={`text-[9px] font-bold ${taxTextColor} transition-all duration-300 ${isTaxed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                     + {formatVal(taxVal)} Tax
                 </span>
            </div>
        </div>
    );
};
