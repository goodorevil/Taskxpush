import React, { useState } from 'react';
import { 
  Inbox, 
  Layers, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  Plus, 
  CheckCircle2, 
  X,
  Circle
} from 'lucide-react';
import { ConnectedAccount, InboxTask } from '../types';

interface SidebarProps {
  tasks: InboxTask[];
  selectedStatusFilter: 'all' | 'active' | 'done';
  onSelectStatusFilter: (status: 'all' | 'active' | 'done') => void;
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
  selectedStatusFilter,
  onSelectStatusFilter,
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

  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => t.status !== 'done').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;

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
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-[#FAFAF7] border-r border-[#E7E7E4] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-[#E7E7E4] flex items-center justify-between min-h-[56px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C2542D] flex items-center justify-center text-white shadow-xs">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block">
                InboxFlow
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Email Action Engine
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2.5 rounded-lg text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Status Filters */}
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Task Status
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectStatusFilter('all');
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                  selectedStatusFilter === 'all'
                    ? 'bg-slate-200/80 text-slate-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>All Tasks</span>
                </div>
                <span className="text-xs text-slate-400 font-normal">{totalCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectStatusFilter('active');
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                  selectedStatusFilter === 'active'
                    ? 'bg-slate-200/80 text-slate-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 text-[#C2542D]" />
                  <span>Active</span>
                </div>
                <span className="text-xs text-slate-400 font-normal">{activeCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectStatusFilter('done');
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                  selectedStatusFilter === 'done'
                    ? 'bg-slate-200/80 text-slate-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Completed</span>
                </div>
                <span className="text-xs text-slate-400 font-normal">{completedCount}</span>
              </button>
            </div>
          </div>

          {/* Links Section */}
          <div className="pt-3 border-t border-[#E7E7E4] space-y-1">
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/50 min-h-[44px] transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Scanning Settings</span>
            </button>

            <button
              type="button"
              onClick={onOpenOAuthGuide}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/50 min-h-[44px] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>OAuth & Security</span>
            </button>
          </div>
        </div>

        {/* Bottom Account Dropdown */}
        <div className="p-3 border-t border-[#E7E7E4] relative">
          {activeAccount ? (
            <div className="relative">
              <button
                id="account-dropdown-toggle"
                type="button"
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-200/60 min-h-[44px] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-800 shrink-0">
                    {activeAccount.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                      {activeAccount.name}
                      {(activeAccount.isTestMode || activeAccount.provider === 'demo') && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#C2542D] bg-orange-100/80 border border-orange-200 rounded px-1.5 py-0.5 shrink-0">
                          Demo
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {activeAccount.isTestMode || activeAccount.provider === 'demo'
                        ? 'Sample data only'
                        : activeAccount.email}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>

              {/* Account Dropdown Menu */}
              {isAccountDropdownOpen && (
                <div
                  id="account-dropdown-menu"
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-[#E7E7E4] shadow-lg p-2 space-y-1 z-50 text-xs"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between min-h-[44px] ${
                        acc.id === activeAccount.id
                          ? 'bg-orange-50 text-[#C2542D] font-bold'
                          : 'hover:bg-slate-100 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="truncate">{acc.name} ({acc.email})</span>
                      {acc.id === activeAccount.id && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C2542D]" />}
                    </button>
                  ))}

                  <div className="border-t border-slate-100 pt-1 mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onConnectNew();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-[#C2542D] hover:bg-orange-50 flex items-center gap-2 font-semibold min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Connect another account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDisconnectAccount(activeAccount.id);
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
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
              className="w-full py-2.5 px-3 rounded-xl bg-[#C2542D] hover:bg-[#B14A27] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Account</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
