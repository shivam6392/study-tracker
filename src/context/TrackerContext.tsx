import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TrackerState, TrackerContextType, TaskList } from '../types';
import { generateInitialState } from '../utils/dateUtils';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<TrackerState>(generateInitialState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch latest data from GitHub API (always fresh, no cache)
    const syncFromGitHub = () => {
        setIsSyncing(true);
        fetch(`/api/tracker?t=${Date.now()}`)
            .then(res => res.json())
            .then((data) => {
                const initial = generateInitialState();
                if (data && typeof data === 'object' && !data.error && !data.message) {
                    const cleanData: TrackerState = {};
                    Object.keys(data).forEach(key => {
                        if (key in initial) {
                            cleanData[key] = data[key];
                        }
                    });
                    setState({ ...initial, ...cleanData });
                    setHasUnsavedChanges(false);
                } else {
                    setState(initial);
                }
            })
            .catch(err => {
                console.error('[GitHub DB] Sync error:', err);
                setState(generateInitialState());
            })
            .finally(() => {
                setIsSyncing(false);
                setIsLoading(false);
            });
    };

    // On page load, fetch from GitHub
    useEffect(() => {
        syncFromGitHub();
    }, []);

    // Toggle task locally only
    const toggleTask = (dateString: string, taskKey: keyof TaskList) => {
        setState((prev) => {
            const currentDay = prev[dateString];
            if (!currentDay) return prev;
            return {
                ...prev,
                [dateString]: {
                    ...currentDay,
                    [taskKey]: !currentDay[taskKey],
                },
            };
        });
        setHasUnsavedChanges(true);
    };

    // Set score for a specific task
    const setScore = (dateString: string, taskKey: string, score: number) => {
        setState((prev) => {
            const currentDay = prev[dateString];
            if (!currentDay) return prev;

            const currentScores = currentDay.scores || {};
            return {
                ...prev,
                [dateString]: {
                    ...currentDay,
                    scores: {
                        ...currentScores,
                        [taskKey]: score,
                    },
                },
            };
        });
        setHasUnsavedChanges(true);
    };

    // Manual save to GitHub
    const saveToGitHub = async (): Promise<boolean> => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
            const data = await res.json();
            if (data.success) {
                setHasUnsavedChanges(false);
                return true;
            }
            return false;
        } catch (err) {
            console.error('[GitHub DB] Save error:', err);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // Reset progress and immediately push to GitHub
    const resetProgress = () => {
        const initialState = generateInitialState();
        setState(initialState);
        setHasUnsavedChanges(false);
        fetch('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialState)
        }).catch(console.error);
    };

    return (
        <TrackerContext.Provider value={{ state, toggleTask, setScore, resetProgress, saveToGitHub, syncFromGitHub, isSaving, isSyncing, hasUnsavedChanges }}>
            {isLoading ? (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-medium text-slate-300">Loading from GitHub...</p>
                </div>
            ) : (
                children
            )}
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
