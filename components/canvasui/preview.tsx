'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CanvasPopoverProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'right' | 'left';
    offset?: number;
}

export const Popover: React.FC<CanvasPopoverProps> = ({
    children,
    content,
    side = 'right',
    offset = 20
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {children}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: side === 'right' ? -10 : 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: side === 'right' ? -10 : 10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-0 z-50`}
                        style={{
                            left: side === 'right' ? `calc(100% + ${offset}px)` : undefined,
                            right: side === 'left' ? `calc(100% + ${offset}px)` : undefined,
                        }}
                        onMouseEnter={() => setIsOpen(true)}
                        onMouseLeave={() => setIsOpen(false)}
                    >
                        <div className="bg-white rounded-lg border border-gray-200 shadow-lg shadow-black/10 p-4 max-w-sm">
                            {/* Arrow */}
                            <div
                                className={`absolute top-4 w-2 h-2 bg-white border rotate-45 ${side === 'right' ? '-left-1 border-r-0 border-b-0' : '-right-1 border-l-0 border-t-0'
                                    }`}
                            />
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};