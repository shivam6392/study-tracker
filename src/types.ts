export interface TaskList {
    sql_mcq: boolean;
    cloud_mcq: boolean;
    word_mcq: boolean;
    cn_mcq: boolean;
    cyber_mcq: boolean;
    sql_queries: boolean;
    dsa: boolean;
    html_css_js: boolean;
    scores?: Partial<Record<string, number>>;
}

export type TrackerState = Record<string, TaskList>;

export interface TrackerContextType {
    state: TrackerState;
    toggleTask: (dateString: string, taskKey: keyof TaskList) => void;
    setScore: (dateString: string, taskKey: string, score: number) => void;
    resetProgress: () => void;
    saveToGitHub: () => Promise<boolean>;
    syncFromGitHub: () => void;
    isSaving: boolean;
    isSyncing: boolean;
    hasUnsavedChanges: boolean;
}
