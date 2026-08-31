import { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Dashboard } from './components/Dashboard';
import { CalendarNavigation } from './components/CalendarNavigation';
import { DailyView } from './components/DailyView';
import { ProgressGraph } from './components/ProgressGraph';
import { START_DATE, formatDate } from './utils/dateUtils';
import { RotateCcw, Save, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

const TrackerApp = () => {
  const { state, resetProgress, saveToGitHub, syncFromGitHub, isSaving, isSyncing, hasUnsavedChanges } = useTracker();

  const today = formatDate(new Date());
  const initialDate = state[today] ? today : START_DATE;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    const ok = await saveToGitHub();
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Mission 25: Study Tracker
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Sept 1, 2026 — Sept 25, 2026</p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Sync from GitHub Button */}
            <button
              onClick={() => syncFromGitHub()}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 shadow-sm"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              <span className="text-sm font-semibold">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Save to GitHub Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                  : hasUnsavedChanges
                    ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse shadow-blue-900/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-red-950/40 hover:text-red-400 text-slate-300 rounded-xl transition-all border border-slate-800 hover:border-red-500/50 shadow-sm"
            >
              <RotateCcw size={16} />
              <span className="text-sm font-semibold">Reset</span>
            </button>
          </div>
        </header>

        <Dashboard />

        <div className="mt-8 mb-4">
          <ProgressGraph />
        </div>

        <div className="my-10">
          <CalendarNavigation selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        <DailyView selectedDate={selectedDate} />

        {/* Reset Confirmation Modal */}
        {showConfirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-white mb-2">Reset all progress?</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                This will reset all checkboxes and immediately update GitHub.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetProgress();
                    setShowConfirmReset(false);
                    setSelectedDate(initialDate);
                  }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  Yes, reset
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default function App() {
  return (
    <TrackerProvider>
      <TrackerApp />
    </TrackerProvider>
  );
}
