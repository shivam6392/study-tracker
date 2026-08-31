import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TrackerState, TrackerContextType, TaskList } from '../types';
import { generateInitialState } from '../utils/dateUtils';

const STORAGE_KEY = 'study_tracker_data_2026';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<TrackerState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...generateInitialState(), ...parsed };
            } catch (e) {
                console.error("Failed to parse stored data", e);
            }
        }
        return generateInitialState();
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const toggleTask = (dateString: string, taskKey: keyof TaskList) => {
        setState((prev) => {
            const dayTasks = prev[dateString];
            if (!dayTasks) return prev;
            return {
                ...prev,
                [dateString]: {
                    ...dayTasks,
                    [taskKey]: !dayTasks[taskKey],
                },
            };
        });
    };

    const resetProgress = () => {
        setState(generateInitialState());
    };

    return (
        <TrackerContext.Provider value={{ state, toggleTask, resetProgress }}>
            {children}
        </TrackerContext.Provider>
    );
};

export const useTracker = () => {
    const context = useContext(TrackerContext);
    if (!context) {
        throw new Error('useTracker must be used within a TrackerProvider');
    }
    return context;
};
