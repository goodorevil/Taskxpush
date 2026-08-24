import React, { useState } from 'react';
import { 
  Inbox, 
  Layers, 
  Calendar as CalendarIcon, 
  Clock, 
  MessageSquare, 
  Tag, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  LayoutGrid,
  List,
  Shield,
  X
} from 'lucide-react';
import { ConnectedAccount, InboxTask, TaskCategory } from '../types';
import { getCategoryStyle } from '../utils/dateUtils';

interface SidebarProps {
  tasks: InboxTask[];
  selectedCategory: TaskCategory | 'all';
  onSelectCategory: (category: TaskCategory | 'all') => void;
  selectedStatusFilter: 'all' | 'active' | 'done';
  onSelectStatusFilter: (status: 'all' | 'active' | 'done') => void;
  viewMode?: 'kanban' | 'list' | 'calendar';
  onSelectViewMode?: (mode: 'kanban' | 'list' | 'calendar') => void;
  accounts: ConnectedAccount[];
  activeAccount: ConnectedAccount | null;
  onSelectAccount: (acc: ConnectedAccount) => void;
  onConnectNew: () => void;
  onDisconnectAccount: (accId: string) => void;
  onOpenSettings: () => void;
  onOpenOAuthGuide: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  selectedCategory,
  onSelectCategory,
  selectedStatusFilter,
  onSelectStatusFilter,
  viewMode = 'kanban',
  onSelectViewMode,
  accounts,
  activeAccount,
  onSelectAccount,
  onConnectNew,
  onDisconnectAccount,
  onOpenSettings,
  onOpenOAuthGuide,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const categories: { label: TaskCategory; icon: any }[] = [
    { label: 'Meeting/Interview', icon: CalendarIcon },
    { label: 'Job/Internship offer', icon: Tag },
    { label: 'Event', icon: Layers },
    { label: 'Deadline', icon: Clock },
    { label: 'Reply Needed', icon: MessageSquare },
    { label: 'Opportunity', icon: Tag },
    { label: 'General', icon: Layers },
    { label: 'Spam', icon: Layers },
  ];

  const getCategoryCount = (cat: TaskCategory) => {
    return tasks.filter((t) => t.category === cat && (selectedStatusFilter === 'all' || (selectedStatusFilter === 'active' ? t.status !== 'done' : t.status === 'done'))).length;
  };

  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const scheduledCount = tasks.filter((t) => Boolean(t.dueDate)).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-[#FAFAF9] border-r border-[#E7E7E4] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-[#E7E7E4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/25">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block">
                InboxFlow
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5 block">
                Email to Action Engine
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Perspectives / Views */}
          {onSelectViewMode && (
            <div>
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Perspective
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectViewMode('kanban');
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-orange-600" />
                    <span>Kanban Board</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectViewMode('list');
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <List className="w-3.5 h-3.5 text-orange-600" />
                    <span>Compact List</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectViewMode('calendar');
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-slate-200/80 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-orange-600" />
                    <span>Monthly Calendar</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{scheduledCount}</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Task Status Filters */}
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Task Filters
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onSelectStatusFilter('all');
                  onSelectCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === 'all' && selectedStatusFilter === 'all'
                    ? 'bg-slate-200/80 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Tasks</span>
                </div>
                <span className="text-[11px] text-slate-400">{tasks.length}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectStatusFilter('active')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedStatusFilter === 'active' && selectedCategory === 'all'
                    ? 'bg-slate-200/80 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Active To-Dos</span>
                </div>
                <span className="text-[11px] text-slate-400">{activeCount}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectStatusFilter('done')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedStatusFilter === 'done'
                    ? 'bg-slate-200/80 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Completed</span>
                </div>
                <span className="text-[11px] text-slate-400">{completedCount}</span>
              </button>
            </div>
          </div>

          {/* Smart Categories */}
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Categories</span>
            </div>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const count = getCategoryCount(cat.label);
                const isSelected = selectedCategory === cat.label;
                const catStyle = getCategoryStyle(cat.label);

                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => onSelectCategory(isSelected ? 'all' : cat.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-slate-200/80 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${catStyle.dotColor}`} />
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings & Guide links */}
          <div className="pt-2 border-t border-[#E7E7E4] space-y-0.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Scanning Settings</span>
            </button>

            <button
              type="button"
              onClick={onOpenOAuthGuide}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>OAuth & Verification</span>
            </button>
          </div>
        </div>

        {/* Bottom Connected Account Dropdown */}
        <div className="p-3 border-t border-[#E7E7E4] relative">
          {activeAccount ? (
            <div className="relative">
              <button
                id="account-dropdown-toggle"
                type="button"
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-800 shrink-0">
                    {activeAccount.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                      {activeAccount.name}
                      {activeAccount.isTestMode && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-100 rounded px-1 py-0.5 shrink-0">
                          Demo
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {activeAccount.isTestMode ? 'Sample data, not your real inbox' : activeAccount.email}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Account Dropdown Menu */}
              {isAccountDropdownOpen && (
                <div
                  id="account-dropdown-menu"
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-[#E7E7E4] shadow-lg p-2 space-y-1 z-50 text-xs"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Account
                  </div>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        onSelectAccount(acc);
                        setIsAccountDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                        acc.id === activeAccount.id
                          ? 'bg-orange-50 text-orange-700 font-medium'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{acc.email}</span>
                      {acc.id === activeAccount.id && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                    </button>
                  ))}

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onConnectNew();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-orange-600 hover:bg-orange-50 flex items-center gap-1.5 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Connect another account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDisconnectAccount(activeAccount.id);
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnectNew}
              className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Account</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
