import type { TaskList, TrackerState, DayType } from '../types';

export const START_DATE = '2026-09-01';
export const END_DATE = '2026-09-25';

// Format Date object to YYYY-MM-DD
export function formatDate(date: Date): string {
    const d = new Date(date);
    // use local timezone
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

export function generateInitialState(): TrackerState {
    const state: TrackerState = {};
    const start = new Date(START_DATE + 'T00:00:00');
    const end = new Date(END_DATE + 'T00:00:00');

    const current = new Date(start);
    while (current <= end) {
        state[formatDate(current)] = {
            dayType: 'normal',
            tasks: {
                math10: false,
                science10: false,
                c11_lec1_phy: false,
                c11_lec1_chem: false,
                c11_lec1_math: false,
                dpp1: false,
                c11_lec2_phy: false,
                c11_lec2_chem: false,
                c11_lec2_math: false,
                dpp2: false,
            }
        };
        current.setDate(current.getDate() + 1);
    }

    return state;
}

export function getTaskLabel(taskKey: keyof TaskList, dayType: DayType): string {
    if (taskKey === 'math10') return dayType === 'normal' ? 'Mathematics — Class 10th (1.5 hours)' : 'Mathematics — Class 10th (45 mins)';
    if (taskKey === 'science10') return dayType === 'normal' ? 'Science — Class 10th (1 hour)' : 'Science — Class 10th (30 mins)';

    const labels: Record<string, string> = {
        c11_lec1_phy: 'Physics — Lecture 1 + Notes',
        c11_lec1_chem: 'Chemistry — Lecture 1 + Notes',
        c11_lec1_math: 'Mathematics — Lecture 1 + Notes',
        dpp1: 'Daily Practice Problems (DPP 1)',
        c11_lec2_phy: 'Physics — Lecture 2 + Notes',
        c11_lec2_chem: 'Chemistry — Lecture 2 + Notes',
        c11_lec2_math: 'Mathematics — Lecture 2 + Notes',
        dpp2: 'Daily Practice Problems (DPP 2)',
    };

    return labels[taskKey as string] || taskKey;
}

export function getActiveTaskKeys(dayType: DayType): (keyof TaskList)[] {
    const commonKeys: (keyof TaskList)[] = [
        'math10', 'science10',
        'c11_lec1_phy', 'c11_lec1_chem', 'c11_lec1_math', 'dpp1'
    ];

    if (dayType === 'school') {
        return commonKeys;
    }

    return [
        ...commonKeys,
        'c11_lec2_phy', 'c11_lec2_chem', 'c11_lec2_math', 'dpp2'
    ];
}

export function getTotalTasksForDay(dayType: DayType): number {
    return getActiveTaskKeys(dayType).length;
}
