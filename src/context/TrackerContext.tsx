import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TrackerState, TrackerContextType, TaskList } from '../types';
import { generateInitialState } from '../utils/dateUtils';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Always initialize with clean default state - NO localStorage cache
    const [state, setState] = useState<TrackerState>(generateInitialState);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch initial state directly from GitHub JSON endpoint with cache-busting timestamp
    const fetchFromGitHub = () => {
        fetch(`/api/tracker?t=${Date.now()}`)
            .then(res => res.json())
            .then((data) => {
                if (data && typeof data === 'object' && !data.error) {
                    setState({ ...generateInitialState(), ...data });
                }
            })
            .catch(err => console.error('[GitHub DB] Fetch error:', err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchFromGitHub();
    }, []);

    // 2. Direct toggle: updates React state and sends commit to GitHub JSON database
    const toggleTask = (dateString: string, taskKey: keyof TaskList) => {
        setState((prev) => {
            const currentDay = prev[dateString];
            if (!currentDay) return prev;

            const updatedState = {
                ...prev,
                [dateString]: {
                    ...currentDay,
                    [taskKey]: !currentDay[taskKey],
                },
            };

            // Push change directly to GitHub repository database
            fetch('/api/tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedState)
            })
                .then(res => res.json())
                .then(resData => {
                    if (resData.warning) {
                        console.warn('[GitHub DB] Warning:', resData.warning);
                    } else if (resData.success) {
                        console.log('[GitHub DB] Successfully committed to data/tracker.json');
                    }
                })
                .catch(err => console.error('[GitHub DB] Save error:', err));

            return updatedState;
        });
    };

    // 3. Reset progress across GitHub repo
    const resetProgress = () => {
        const initialState = generateInitialState();
        setState(initialState);

        fetch('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialState)
        }).catch(console.error);
    };

    return (
        <TrackerContext.Provider value={{ state, toggleTask, resetProgress }}>
            {isLoading ? (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-medium text-slate-300">Syncing with GitHub database...</p>
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
