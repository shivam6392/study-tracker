import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TrackerState, TrackerContextType, TaskList } from '../types';
import { generateInitialState } from '../utils/dateUtils';

const STORAGE_KEY = 'study_tracker_data_2026';

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<TrackerState>(() => {
        // Try synchronous local storage first for immediate UI
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...generateInitialState(), ...parsed };
            } catch (e) {
                console.error("Failed to parse local stored data", e);
            }
        }
        return generateInitialState();
    });

    const [isSyncing, setIsSyncing] = useState(true);

    // Initial load from cloud backend
    useEffect(() => {
        fetch('/api/tracker')
            .then(res => {
                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                return res.json();
            })
            .then((raw) => {
                // Handle double-encoded JSON strings from Redis
                let data = raw;
                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch (_) { /* leave as-is */ }
                }

                if (data && typeof data === 'object' && Object.keys(data).length > 0 && !data.error && !data.warning) {
                    const merged = { ...generateInitialState(), ...data };
                    setState(merged);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                    console.log('[Tracker] Loaded from cloud:', Object.keys(data).length, 'days');
                } else {
                    console.log('[Tracker] No cloud data found, using local');
                }
            })
            .catch((err) => console.error('[Tracker] Fetch error:', err))
            .finally(() => {
                setIsSyncing(false);
            });
    }, []);

    // Save to cloud backend when state changes
    useEffect(() => {
        if (isSyncing) return; // Don't write during initial load

        // Optimistic local update
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        // Sync to cloud
        fetch('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        }).catch(console.error);

    }, [state, isSyncing]);

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
