import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { TASK_LABELS, TOTAL_TASKS_PER_DAY } from '../utils/dateUtils';
import { calculateDailyScore } from '../utils/statsUtils';
import { Checkbox } from './ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import type { TaskList } from '../types';

interface DailyViewProps {
    selectedDate: string;
}

export const DailyView: React.FC<DailyViewProps> = ({ selectedDate }) => {
    const { state, toggleTask } = useTracker();

    const tasks = state[selectedDate];
    if (!tasks) return null;

    const score = calculateDailyScore(tasks);
    const percentage = ((score / TOTAL_TASKS_PER_DAY) * 100).toFixed(1);

    let status = 'Not Started';
    let statusColor = 'text-slate-400';
    if (score === TOTAL_TASKS_PER_DAY) {
        status = 'Completed';
        statusColor = 'text-emerald-400';
    } else if (score > 0) {
        status = 'Partially Completed';
        statusColor = 'text-amber-400';
    }

    // Proper date parsing to display without timezone shift
    const [y, m, d] = selectedDate.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const formattedDateString = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks List */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>Daily Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-2">
                        {(Object.keys(TASK_LABELS) as Array<keyof TaskList>).map((key) => (
                            <Checkbox
                                key={key}
                                label={TASK_LABELS[key]}
                                checked={tasks[key]}
                                onChange={() => toggleTask(selectedDate, key)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Daily Summary */}
            <Card className="lg:col-span-1 h-fit sticky top-6 bg-slate-800/40 border-slate-700/50">
                <CardHeader>
                    <CardTitle>Daily Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">{formattedDateString}</h3>

                        <div className="relative w-36 h-36 my-6 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#1e293b" /* slate-800 */
                                    strokeWidth="3.5"
                                />
                                <path
                                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={score === TOTAL_TASKS_PER_DAY ? "#10b981" : "#3b82f6"}
                                    strokeWidth="3.5"
                                    strokeDasharray={`${(score / TOTAL_TASKS_PER_DAY) * 100}, 100`}
                                    strokeLinecap="round"
                                    className="transition-all duration-700 ease-in-out"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">{percentage}%</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3 bg-slate-900/60 p-4 rounded-xl text-left border border-slate-700/50 shadow-inner">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Tasks completed:</span>
                                <span className="text-white font-semibold">{score} / {TOTAL_TASKS_PER_DAY}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Status:</span>
                                <span className={`font-semibold text-sm ${statusColor}`}>{status}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
