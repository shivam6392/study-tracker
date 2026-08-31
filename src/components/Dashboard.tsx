import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { getStats } from '../utils/statsUtils';
import { Card, CardContent } from './ui/Card';
import { Trophy, Zap, FileX, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from './ui/ProgressBar';

export const Dashboard: React.FC = () => {
    const { state } = useTracker();
    const stats = getStats(state);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Overall Progress */}
            <Card className="col-span-2 md:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Progress</p>
                                <h3 className="text-3xl font-bold mt-1 text-white">{stats.overallCompletion.toFixed(1)}%</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-400">Tasks Completed</p>
                                <p className="text-xl font-bold text-blue-400">{stats.totalTasksCompleted} / {stats.totalTasksCompleted + stats.totalTasksRemaining}</p>
                            </div>
                        </div>
                        <ProgressBar value={stats.overallCompletion} className="h-4" />
                    </div>
                </CardContent>
            </Card>

            {/* Stat Cards */}
            <StatCard title="Completed Days" value={stats.completedDays} icon={<CheckCircle2 className="text-emerald-500" />} />
            <StatCard title="Current Streak" value={`${stats.currentStreak} days`} icon={<Zap className="text-amber-500" />} />
            <StatCard title="Missed Days" value={stats.missedDays} icon={<FileX className="text-red-500" />} />
            <StatCard title="Best Day" value={stats.bestDay} icon={<Trophy className="text-blue-500" />} />
        </div>
    );
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="p-4 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="text-xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className="p-2 bg-slate-900/50 rounded-lg shadow-inner">
                {icon}
            </div>
        </CardContent>
    </Card>
);
