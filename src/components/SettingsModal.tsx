import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Trash2, 
  ShieldCheck, 
  Info,
  Check
} from 'lucide-react';
import { ConnectedAccount, ScanConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScanConfig;
  onSaveConfig: (cfg: ScanConfig) => void;
  accounts: ConnectedAccount[];
  onDisconnectAccount: (accId: string) => void;
  onClearAllData: () => void;
  onOpenOAuthGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  accounts,
  onDisconnectAccount,
  onClearAllData,
  onOpenOAuthGuide,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'scanning' | 'accounts' | 'privacy'>('scanning');
  const [scanLimit, setScanLimit] = useState(config.scanLimit);
  const [scanRangeDays, setScanRangeDays] = useState(config.scanRangeDays);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [filterNewsletters, setFilterNewsletters] = useState(config.filterNewsletters);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveConfig({
      ...config,
      scanLimit,
      scanRangeDays,
      autoSync,
      filterNewsletters,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="settings-modal"
        className="w-full max-w-xl bg-white rounded-xl border border-[#E7E7E4] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E4] min-h-[64px]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Prioris Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E7E7E4] px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('scanning')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'scanning'
                ? 'border-[#C2542D] text-[#C2542D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Scanning Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'accounts'
                ? 'border-[#C2542D] text-[#C2542D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connected Accounts ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'privacy'
                ? 'border-[#C2542D] text-[#C2542D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy & Storage
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 font-medium">
          {activeTab === 'scanning' && (
            <div className="space-y-5">
              {/* Scan Range */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Email Scan History Range
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 14, 30, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setScanRangeDays(days)}
                      className={`py-2.5 text-center rounded-xl border font-bold min-h-[44px] ${
                        scanRangeDays === days
                          ? 'border-[#C2542D] bg-orange-50 text-[#C2542D]'
                          : 'border-[#E7E7E4] hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Last {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Emails */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Max Emails Per Sync
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setScanLimit(limit)}
                      className={`py-2.5 text-center rounded-xl border font-bold min-h-[44px] ${
                        scanLimit === limit
                          ? 'border-[#C2542D] bg-orange-50 text-[#C2542D]'
                          : 'border-[#E7E7E4] hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {limit} emails
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtering Toggles */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E7E7E4] space-y-3">
                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Filter Newsletters & Receipts
                    </span>
                    <span className="text-slate-500 text-[11px] font-normal">
                      Automatically reject marketing digests and confirmation receipts into Spam / General.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filterNewsletters}
                    onChange={(e) => setFilterNewsletters(e.target.checked)}
                    className="rounded border-slate-300 text-[#C2542D] focus:ring-[#C2542D] w-4 h-4"
                  />
                </label>

                <div className="border-t border-[#E7E7E4] pt-3">
                  <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Background Auto-Sync
                      </span>
                      <span className="text-slate-500 text-[11px] font-normal">
                        Periodically checks for new messages while app is open.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="rounded border-slate-300 text-[#C2542D] focus:ring-[#C2542D] w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800">
                  Active Connected Accounts
                </span>
                <button
                  type="button"
                  onClick={onOpenOAuthGuide}
                  className="text-xs text-[#C2542D] font-bold hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Setup Guide</span>
                </button>
              </div>

              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl border border-[#E7E7E4] bg-slate-50 flex items-center justify-between gap-3 min-h-[56px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {acc.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                        {acc.name}
                        {(acc.isTestMode || acc.provider === 'demo') && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#C2542D] bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {acc.isTestMode || acc.provider === 'demo' ? 'Sample demo data' : `${acc.email} · ${acc.provider.toUpperCase()}`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Disconnect ${acc.email}?`)) {
                        onDisconnectAccount(acc.id);
                      }
                    }}
                    className="px-3 py-2 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors min-h-[44px] flex items-center"
                  >
                    Disconnect
                  </button>
                </div>
              ))}

              {accounts.length === 0 && (
                <div className="text-center py-6 text-slate-400 font-medium">
                  No accounts currently connected.
                </div>
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E7E7E4] space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy & Storage Principles</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs font-medium">
                  • Prioris does not store your full raw email contents in external databases.<br/>
                  • Tokens are kept securely on client session or transient server memory.<br/>
                  • You can clear all cached tasks and wipe application storage in one click below.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently wipe all stored tasks, settings, and connected accounts?')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Stored Tasks & Reset App</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E7E4] bg-[#FAFAF7] flex items-center justify-between min-h-[64px]">
          <span className="text-[11px] text-slate-500 font-medium">
            {savedSuccess ? (
              <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            ) : (
              'Changes take effect on next sync'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#C2542D] hover:bg-[#B14A27] rounded-xl shadow-xs min-h-[44px]"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
