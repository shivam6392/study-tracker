import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TrackerState, TrackerContextType, TaskList } from '../types';
import { generateInitialState } from '../utils/dateUtils';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<TrackerState>(generateInitialState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // 1. On page load, ALWAYS fetch exclusively from the latest GitHub repo data/tracker.json
    const fetchFromGitHub = () => {
        setIsLoading(true);
        fetch(`/api/tracker?t=${Date.now()}`)
            .then(res => res.json())
            .then((data) => {
                if (data && typeof data === 'object' && !data.error) {
                    setState({ ...generateInitialState(), ...data });
                    setHasUnsavedChanges(false);
                }
            })
            .catch(err => console.error('[GitHub DB] Fetch error:', err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchFromGitHub();
    }, []);

    // 2. Toggle task ONLY modifies local UI state in memory and marks unsaved changes
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

    // 3. Manual save function triggered ONLY when user clicks Save button
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

    // 4. Reset progress
    const resetProgress = () => {
        const initialState = generateInitialState();
        setState(initialState);
        setHasUnsavedChanges(true);
    };

    return (
        <TrackerContext.Provider value={{ state, toggleTask, resetProgress, saveToGitHub, isSaving, hasUnsavedChanges }}>
            {isLoading ? (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-medium text-slate-300">Loading latest data from GitHub...</p>
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
