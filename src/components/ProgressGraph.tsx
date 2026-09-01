import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTracker } from '../context/TrackerContext';
import { calculateDailyScore } from '../utils/statsUtils';
import { TOTAL_TASKS_PER_DAY, MCQ_KEYS } from '../utils/dateUtils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

export const ProgressGraph: React.FC = () => {
    const { state } = useTracker();

    const data = Object.keys(state).sort().map(date => {
        const score = calculateDailyScore(state[date]);

        // Calculate Total MCQ Scores for the day
        const scores = state[date].scores || {};
        let totalMcqScore = 0;
        MCQ_KEYS.forEach(key => {
            totalMcqScore += scores[key] || 0;
        });

        return {
            date: date.substring(5), // MM-DD
            percentage: Number(((score / TOTAL_TASKS_PER_DAY) * 100).toFixed(1)),
            totalMcqScore,
            tooltipDate: date
        };
    });

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Daily Completion Percentage</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val}%`}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                                formatter={(value: any) => [`${value}%`, 'Completion']}
                                labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipDate || label}
                            />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>

            <CardHeader className="mt-4 border-t border-slate-800 pt-6">
                <CardTitle>Total MCQ Marks Scored</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${val}`}
                                domain={[0, 250]} // 5 MCQs * 50 marks = 250
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#10b981', fontWeight: 600 }} // emerald-500
                                labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                                formatter={(value: any) => [`${value} / 250`, 'Marks Scored']}
                                labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipDate || label}
                            />
                            <Line
                                type="monotone"
                                dataKey="totalMcqScore"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
