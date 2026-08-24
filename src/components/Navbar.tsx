import React, { useEffect, useState } from 'react';
import { 
  Search, 
  RotateCw, 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon,
  Plus, 
  Menu, 
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { TaskCategory, TaskPriority } from '../types';
import { formatLastSynced, getCategoryStyle } from '../utils/dateUtils';

interface NavbarProps {
  viewMode: 'kanban' | 'list' | 'calendar';
  onToggleViewMode: (mode: 'kanban' | 'list' | 'calendar') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: TaskCategory | 'all';
  onSelectCategory: (cat: TaskCategory | 'all') => void;
  selectedPriority: TaskPriority | 'all';
  onSelectPriority: (pri: TaskPriority | 'all') => void;
  onRefresh: () => void;
  isScanning: boolean;
  lastSyncedAt?: string;
  onOpenAddTask: () => void;
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  onRefresh,
  isScanning,
  lastSyncedAt,
  onOpenAddTask,
  onOpenMobileSidebar,
}) => {
  // Relative sync time timer ticker
  const [syncTimeLabel, setSyncTimeLabel] = useState(formatLastSynced(lastSyncedAt));

  useEffect(() => {
    setSyncTimeLabel(formatLastSynced(lastSyncedAt));
    const interval = setInterval(() => {
      setSyncTimeLabel(formatLastSynced(lastSyncedAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  const categories: TaskCategory[] = [
    'Meeting/Interview',
    'Job/Internship offer',
    'Event',
    'Deadline',
    'Reply Needed',
    'Opportunity',
    'General',
    'Spam',
  ];

  return (
    <header className="flex flex-col border-b border-[#E7E7E4] bg-[#FAFAF9] z-10">
      {/* Primary Top Bar */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200/70"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-task-search"
              type="text"
              placeholder="Search tasks, senders, or subjects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white border border-[#E7E7E4] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/50 shadow-2xs"
            />
          </div>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Last synced status & Refresh */}
          <div className="flex items-center gap-2 bg-slate-100 border border-[#E7E7E4] rounded-xl px-2.5 py-1 text-xs">
            <span className="hidden sm:inline text-[11px] text-slate-500">
              {isScanning ? 'Scanning...' : syncTimeLabel}
            </span>
            <button
              id="refresh-sync-btn"
              type="button"
              disabled={isScanning}
              onClick={onRefresh}
              className={`p-1 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-slate-200/60 transition-colors ${
                isScanning ? 'animate-spin text-orange-600' : ''
              }`}
              title="Re-scan inbox for new actionable emails"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle: Kanban vs List vs Calendar */}
          <div className="flex items-center bg-slate-100 border border-[#E7E7E4] rounded-xl p-0.5">
            <button
              id="view-toggle-kanban"
              type="button"
              onClick={() => onToggleViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              id="view-toggle-list"
              type="button"
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              id="view-toggle-calendar"
              type="button"
              onClick={() => onToggleViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Monthly Calendar View"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* + Add Task Button */}
          <button
            id="navbar-add-task-btn"
            type="button"
            onClick={onOpenAddTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Secondary Quick Filter Chips Bar */}
      <div className="flex items-center gap-1.5 px-4 lg:px-8 py-2 overflow-x-auto border-t border-[#E7E7E4] no-scrollbar">
        <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>

        {/* All Chip */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-800 text-white font-semibold'
              : 'bg-white text-slate-600 border border-[#E7E7E4] hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>

        {/* Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const style = getCategoryStyle(cat);

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 border ${
                isSelected
                  ? `${style.bg} ${style.text} ${style.border} font-semibold ring-1 ring-slate-400/30`
                  : 'bg-white text-slate-600 border-[#E7E7E4] hover:bg-slate-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
              <span>{cat}</span>
            </button>
          );
        })}

        {/* Priority Filter dropdown */}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <select
            id="navbar-priority-filter"
            value={selectedPriority}
            onChange={(e) => onSelectPriority(e.target.value as TaskPriority | 'all')}
            className="bg-white border border-[#E7E7E4] rounded-lg px-2 py-0.5 text-[11px] text-slate-600 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>
    </header>
  );
};
