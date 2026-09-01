import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { getTaskLabel, getTotalTasksForDay, getActiveTaskKeys } from '../utils/dateUtils';
import { calculateDailyScore } from '../utils/statsUtils';
import { Checkbox } from './ui/Checkbox';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Map, BookOpen, PenTool } from 'lucide-react';


interface DailyViewProps {
    selectedDate: string;
}

export const DailyView: React.FC<DailyViewProps> = ({ selectedDate }) => {
    const { state, toggleTask, changeDayType } = useTracker();

    const dayData = state[selectedDate];
    if (!dayData) return null;

    const tasks = dayData.tasks;
    const score = calculateDailyScore(dayData);
    const dateTotal = getTotalTasksForDay(dayData.dayType);
    const percentage = dateTotal > 0 ? ((score / dateTotal) * 100).toFixed(1) : "0.0";

    let status = 'Not Started';
    let statusColor = 'text-slate-400';
    if (score === dateTotal && dateTotal > 0) {
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

    const activeKeys = getActiveTaskKeys(dayData.dayType);

    // Grouping Tasks
    const class10Tasks = activeKeys.filter(k => k === 'math10' || k === 'science10');
    const class11Lec1Tasks = activeKeys.filter(k => k.includes('c11_lec1') || k === 'dpp1');
    const class11Lec2Tasks = activeKeys.filter(k => k.includes('c11_lec2') || k === 'dpp2');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks List */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <CardTitle>Daily Schedule</CardTitle>
                    <div className="flex bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-700/50">
                        <button
                            onClick={() => changeDayType(selectedDate, 'normal')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${dayData.dayType === 'normal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Normal Day
                        </button>
                        <button
                            onClick={() => changeDayType(selectedDate, 'school')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${dayData.dayType === 'school' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            School Day
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Class 10th Group */}
                        {class10Tasks.length > 0 && (
                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
                                <h3 className="flex items-center text-lg font-bold text-white mb-4">
                                    <Map className="w-5 h-5 mr-2 text-blue-400" /> Class 10th
                                </h3>
                                <div className="space-y-2 pl-2">
                                    {class10Tasks.map((key) => (
                                        <Checkbox
                                            key={key}
                                            label={getTaskLabel(key, dayData.dayType)}
                                            checked={tasks[key]}
                                            onChange={() => toggleTask(selectedDate, key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Class 11th - Lecture 1 Group */}
                        {class11Lec1Tasks.length > 0 && (
                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
                                <h3 className="flex items-center text-lg font-bold text-white mb-4">
                                    <BookOpen className="w-5 h-5 mr-2 text-indigo-400" /> Class 11th (1st Lecture)
                                </h3>
                                <div className="space-y-2 pl-2">
                                    {class11Lec1Tasks.map((key) => (
                                        <Checkbox
                                            key={key}
                                            label={getTaskLabel(key, dayData.dayType)}
                                            checked={tasks[key]}
                                            onChange={() => toggleTask(selectedDate, key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Class 11th - Lecture 2 Group */}
                        {class11Lec2Tasks.length > 0 && (
                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 animate-in fade-in zoom-in duration-300">
                                <h3 className="flex items-center text-lg font-bold text-white mb-4">
                                    <PenTool className="w-5 h-5 mr-2 text-emerald-400" /> Class 11th (2nd Lecture)
                                </h3>
                                <div className="space-y-2 pl-2">
                                    {class11Lec2Tasks.map((key) => (
                                        <Checkbox
                                            key={key}
                                            label={getTaskLabel(key, dayData.dayType)}
                                            checked={tasks[key]}
                                            onChange={() => toggleTask(selectedDate, key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
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
                                    stroke={score === dateTotal && dateTotal > 0 ? "#10b981" : "#3b82f6"}
                                    strokeWidth="3.5"
                                    strokeDasharray={`${(score / dateTotal) * 100}, 100`}
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
                                <span className="text-white font-semibold">{score} / {dateTotal}</span>
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
