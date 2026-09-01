import type { TaskList } from '../types';

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

export function generateInitialState(): Record<string, TaskList> {
    const state: Record<string, TaskList> = {};
    const start = new Date(START_DATE + 'T00:00:00');
    const end = new Date(END_DATE + 'T00:00:00');

    const current = new Date(start);
    while (current <= end) {
        state[formatDate(current)] = {
            sql_mcq: false,
            cloud_mcq: false,
            word_mcq: false,
            cn_mcq: false,
            cyber_mcq: false,
            sql_queries: false,
            dsa: false,
            html_css_js: false,
        };
        current.setDate(current.getDate() + 1);
    }

    return state;
}

export const TASK_LABELS: Record<keyof TaskList, string> = {
    sql_mcq: '50 SQL MCQs',
    cloud_mcq: '50 Cloud Computing MCQs',
    word_mcq: '50 MS Word / MS Office MCQs',
    cn_mcq: '50 Computer Networks (CN) MCQs',
    cyber_mcq: '50 Cybersecurity MCQs',
    sql_queries: '10 SQL Queries',
    dsa: '5 DSA Questions',
    html_css_js: '3 Hours of HTML, CSS & JavaScript practice',
};

export const TOTAL_TASKS_PER_DAY = Object.keys(TASK_LABELS).length;
