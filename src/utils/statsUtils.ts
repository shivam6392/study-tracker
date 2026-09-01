import type { TrackerState, DayData } from '../types';
import { formatDate, getActiveTaskKeys, getTotalTasksForDay } from './dateUtils';

export function calculateDailyScore(dayData: DayData): number {
    if (!dayData || !dayData.tasks) return 0;
    const activeKeys = getActiveTaskKeys(dayData.dayType);

    // Only count active tasks for the chosen dayType
    return activeKeys.filter(key => dayData.tasks[key]).length;
}

export function getStats(state: TrackerState, todayOverride = formatDate(new Date())) {
    let totalTasksCompleted = 0;
    let totalPossibleTasks = 0;
    let completedDays = 0;
    let partialDays = 0;
    let missedDays = 0;

    let bestDay = { date: '', scorePercent: -1 };
    let worstDay = { date: '', scorePercent: 999 };

    let currentStreak = 0;
    let longestStreak = 0;
    let todayScore = 0;
    let todayTotal = 0;

    const dates = Object.keys(state).sort();

    for (const date of dates) {
        const dayData = state[date];
        const score = calculateDailyScore(dayData);
        const dateTotal = getTotalTasksForDay(dayData.dayType);

        totalTasksCompleted += score;
        totalPossibleTasks += dateTotal;

        if (date === todayOverride) {
            todayScore = score;
            todayTotal = dateTotal;
        }

        const dailyPercent = dateTotal > 0 ? (score / dateTotal) * 100 : 0;

        if (score === dateTotal && dateTotal > 0) completedDays++;
        else if (score > 0) partialDays++;
        else missedDays++;

        if (dailyPercent > bestDay.scorePercent) bestDay = { date, scorePercent: dailyPercent };
        // Tie breaker for worst day: keep the first or just replace.
        if (dailyPercent < worstDay.scorePercent) worstDay = { date, scorePercent: dailyPercent };

        // Streak: days where everything is completed
        if (score === dateTotal && dateTotal > 0) {
            currentStreak++;
            if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else {
            currentStreak = 0;
        }
    }

    const overallCompletion = totalPossibleTasks > 0 ? (totalTasksCompleted / totalPossibleTasks) : 0;
    const todayCompletion = todayTotal > 0 ? (todayScore / todayTotal) : 0;

    return {
        totalTasksCompleted,
        totalTasksRemaining: totalPossibleTasks - totalTasksCompleted,
        overallCompletion: isNaN(overallCompletion) ? 0 : overallCompletion * 100,
        todayCompletion: isNaN(todayCompletion) ? 0 : todayCompletion * 100,
        completedDays,
        partialDays,
        missedDays,
        bestDay: bestDay.date ? `${bestDay.date} (${bestDay.scorePercent.toFixed(1)}%)` : 'N/A',
        worstDay: worstDay.date ? `${worstDay.date} (${worstDay.scorePercent.toFixed(1)}%)` : 'N/A',
        currentStreak,
        longestStreak,
    };
}
