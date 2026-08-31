import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxProps {
    checked: boolean;
    onChange: () => void;
    label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => {
    return (
        <label className="flex items-center space-x-4 cursor-pointer group p-3 rounded-xl hover:bg-slate-800/60 transition-colors w-full border border-transparent hover:border-slate-700/50">
            <div className={cn(
                "relative flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-300",
                checked ? "bg-primary border-primary" : "border-slate-500 group-hover:border-primary"
            )}>
                <Check
                    size={16}
                    className={cn(
                        "text-white transition-transform duration-300",
                        checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    )}
                />
                <input
                    type="checkbox"
                    className="absolute opacity-0 w-0 h-0"
                    checked={checked}
                    onChange={onChange}
                />
            </div>
            <span className={cn(
                "text-sm font-medium transition-all duration-300 select-none",
                checked ? "text-slate-500 line-through" : "text-slate-200 group-hover:text-white"
            )}>
                {label}
            </span>
        </label>
    );
};
