import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
    value: number; // 0 to 100
    className?: string;
    indicatorClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className, indicatorClassName }) => {
    return (
        <div className={cn("relative w-full h-2.5 overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/50", className)}>
            <div
                className={cn("h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-in-out", indicatorClassName)}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
};
