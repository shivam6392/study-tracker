import React, { useRef, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { cn } from '../lib/utils';
import { formatDate, getTotalTasksForDay } from '../utils/dateUtils';
import { calculateDailyScore } from '../utils/statsUtils';

interface CalendarNavigationProps {
    selectedDate: string;
    onSelectDate: (date: string) => void;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({ selectedDate, onSelectDate }) => {
    const { state } = useTracker();
    const dates = Object.keys(state).sort();
    const containerRef = useRef<HTMLDivElement>(null);

    const actualToday = formatDate(new Date());

    useEffect(() => {
        if (containerRef.current) {
            const selectedEl = containerRef.current.querySelector('[data-selected="true"]');
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedDate]);

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">25-Day Journey</h2>
                <button
                    onClick={() => {
                        if (dates.includes(actualToday)) {
                            onSelectDate(actualToday);
                        }
                    }}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Go to Today
                </button>
            </div>

            <div
                ref={containerRef}
                className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {dates.map((date, index) => {
                    const dayData = state[date];
                    if (!dayData) return null;

                    const score = calculateDailyScore(dayData);
                    const dateTotal = getTotalTasksForDay(dayData.dayType);

                    const isCompleted = score === dateTotal && dateTotal > 0;
                    const isPartially = score > 0 && score < dateTotal;

                    let statusColor = "bg-slate-800/60 border-slate-700/50 text-slate-400";
                    if (isCompleted) statusColor = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400";
                    if (isPartially) statusColor = "bg-amber-500/10 border-amber-500/50 text-amber-500";

                    const isSelected = selectedDate === date;
                    const isToday = date === actualToday;

                    // Parse day number (e.g. Sept 1 -> 1)
                    const dayNumber = parseInt(date.split('-')[2], 10);

                    return (
                        <button
                            key={date}
                            data-selected={isSelected}
                            onClick={() => onSelectDate(date)}
                            className={cn(
                                "snap-start flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[84px] rounded-2xl border transition-all duration-300 relative group",
                                statusColor,
                                isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0f172a] border-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-slate-800" : "hover:border-slate-500 cursor-pointer hover:bg-slate-800/80 hover:scale-105"
                            )}
                        >
                            <span className="text-[10px] font-semibold mb-1 uppercase tracking-wider opacity-80">
                                Day {index + 1}
                            </span>
                            <span className={cn("text-2xl font-bold", isSelected && "text-white")}>
                                {dayNumber}
                            </span>

                            {/* Today Indicator */}
                            {isToday && (
                                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-[#0f172a] shadow-sm z-10" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
