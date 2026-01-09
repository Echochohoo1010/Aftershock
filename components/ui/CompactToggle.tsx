import React from 'react';

interface CompactToggleProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;  // NEW: Support disabled state
}

export const CompactToggle: React.FC<CompactToggleProps> = ({ active, onClick, icon, label, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 border text-[11px] font-medium
            ${disabled
                ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                : active
                ? 'bg-gray-800 border-gray-800 text-white shadow-sm'
                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'}
        `}
    >
        {icon}
        <span>{label}</span>
    </button>
);
