import React, { useEffect, useState } from 'react';
import { 
  Search, 
  RotateCw, 
  Plus, 
  Menu, 
  Inbox
} from 'lucide-react';
import { formatLastSynced } from '../utils/dateUtils';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isScanning: boolean;
  lastSyncedAt?: string;
  onOpenAddTask: () => void;
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isScanning,
  lastSyncedAt,
  onOpenAddTask,
  onOpenMobileSidebar,
}) => {
  const [syncTimeLabel, setSyncTimeLabel] = useState(formatLastSynced(lastSyncedAt));

  useEffect(() => {
    setSyncTimeLabel(formatLastSynced(lastSyncedAt));
    const interval = setInterval(() => {
      setSyncTimeLabel(formatLastSynced(lastSyncedAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  return (
    <header className="flex flex-col border-b border-[#E7E7E4] bg-[#FAFAF7] z-10">
      {/* Single Top Bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-3 min-h-[64px]">
        {/* Left Side: Mobile Hamburger & Search Input */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-200/70 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="global-task-search"
              type="text"
              placeholder="Search tasks, senders, or subjects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white border border-[#E7E7E4] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#C2542D]/40 min-h-[44px] font-medium"
            />
          </div>
        </div>

        {/* Right Side: Sync status, Refresh button & Add Task button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync indicator & Refresh */}
          <div className="flex items-center gap-2 bg-slate-100/80 border border-[#E7E7E4] rounded-xl px-3 py-1.5 min-h-[44px]">
            <span className="hidden sm:inline text-xs text-slate-600 font-medium">
              {isScanning ? 'synced scanning...' : syncTimeLabel}
            </span>
            <button
              id="refresh-sync-btn"
              type="button"
              disabled={isScanning}
              onClick={onRefresh}
              className={`p-2 rounded-lg text-slate-600 hover:text-[#C2542D] hover:bg-slate-200/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isScanning ? 'animate-spin text-[#C2542D]' : ''
              }`}
              title="Re-scan inbox for new emails"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* + Add Task Button */}
          <button
            id="navbar-add-task-btn"
            type="button"
            onClick={onOpenAddTask}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2542D] hover:bg-[#B14A27] text-white text-xs font-bold shadow-xs transition-colors shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
