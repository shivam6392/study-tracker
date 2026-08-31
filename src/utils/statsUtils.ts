import type { TrackerState, TaskList } from '../types';
import { formatDate, TOTAL_TASKS_PER_DAY } from './dateUtils';

export function calculateDailyScore(tasks: TaskList): number {
    if (!tasks) return 0;
    return Object.values(tasks).filter(Boolean).length;
}

export function getStats(state: TrackerState, todayOverride = formatDate(new Date())) {
    let totalTasksCompleted = 0;
    let totalTasksRemaining = 0;
    let completedDays = 0;
    let partialDays = 0;
    let missedDays = 0;

    let bestDay = { date: '', score: -1 };
    let worstDay = { date: '', score: 999 };

    let currentStreak = 0;
    let longestStreak = 0;
    let todayScore = 0;

    const dates = Object.keys(state).sort();

    for (const date of dates) {
        const tasks = state[date];
        const score = calculateDailyScore(tasks);
        const dateTotal = TOTAL_TASKS_PER_DAY;

        totalTasksCompleted += score;
        totalTasksRemaining += (dateTotal - score);

        if (date === todayOverride) {
            todayScore = score;
        }

        if (score === dateTotal) completedDays++;
        else if (score > 0) partialDays++;
        else missedDays++;

        if (score > bestDay.score) bestDay = { date, score };
        // Tie breaker for worst day: keep the first or just replace.
        if (score < worstDay.score) worstDay = { date, score };

        // Streak: days where everything is completed
        if (score === dateTotal) {
            currentStreak++;
            if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else {
            currentStreak = 0;
        }
    }

    const overallCompletion = totalTasksCompleted / (dates.length * TOTAL_TASKS_PER_DAY);
    const todayCompletion = todayScore / TOTAL_TASKS_PER_DAY;

    return {
        totalTasksCompleted,
        totalTasksRemaining,
        overallCompletion: isNaN(overallCompletion) ? 0 : overallCompletion * 100,
        todayCompletion: isNaN(todayCompletion) ? 0 : todayCompletion * 100,
        completedDays,
        partialDays,
        missedDays,
        bestDay: bestDay.date ? `${bestDay.date} (${((bestDay.score / TOTAL_TASKS_PER_DAY) * 100).toFixed(1)}%)` : 'N/A',
        worstDay: worstDay.date ? `${worstDay.date} (${((worstDay.score / TOTAL_TASKS_PER_DAY) * 100).toFixed(1)}%)` : 'N/A',
        currentStreak,
        longestStreak,
    };
}
