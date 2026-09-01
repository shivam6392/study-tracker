export type DayType = 'normal' | 'school';

export interface TaskList {
    // Common
    math10: boolean;
    science10: boolean;

    // Class 11th - 1st Lecture
    c11_lec1_phy: boolean;
    c11_lec1_chem: boolean;
    c11_lec1_math: boolean;
    dpp1: boolean;

    // Class 11th - 2nd Lecture (Normal Day Only)
    c11_lec2_phy: boolean;
    c11_lec2_chem: boolean;
    c11_lec2_math: boolean;
    dpp2: boolean;
}

export interface DayData {
    dayType: DayType;
    tasks: TaskList;
}

export type TrackerState = Record<string, DayData>;

export interface TrackerContextType {
    state: TrackerState;
    toggleTask: (dateString: string, taskKey: keyof TaskList) => void;
    changeDayType: (dateString: string, dayType: DayType) => void;
    resetProgress: () => void;
    saveToGitHub: () => Promise<boolean>;
    syncFromGitHub: () => void;
    isSaving: boolean;
    isSyncing: boolean;
    hasUnsavedChanges: boolean;
}
