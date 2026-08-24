import React from 'react';
import { Sparkles, Mail, CheckCircle, Ban, Loader2, AlertCircle } from 'lucide-react';
import { ScanProgress } from '../types';

interface ScanningModalProps {
  progress: ScanProgress;
  onCancel?: () => void;
}

export const ScanningModal: React.FC<ScanningModalProps> = ({ progress, onCancel }) => {
  if (!progress.isScanning) return null;

  const percent = progress.totalEmails > 0 
    ? Math.round((progress.processedEmails / progress.totalEmails) * 100) 
    : 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="scanning-progress-modal"
        className="w-full max-w-md bg-white rounded-xl border border-[#E7E7E4] shadow-2xl p-6 overflow-hidden"
      >
        {/* Top visual indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <Sparkles className="w-3 h-3 absolute top-1 right-1 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              InboxFlow AI is Scanning Emails
            </h3>
            <p className="text-xs text-slate-500">
              Analyzing subject lines & bodies for action items...
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>
              Scanning {progress.processedEmails} of {progress.totalEmails || '...'} emails
            </span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Live email subject ticker */}
        {progress.currentSubject && (
          <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-[#E7E7E4] text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>Current Message</span>
            </div>
            <p className="text-slate-800 font-medium truncate">
              {progress.currentSubject}
            </p>
          </div>
        )}

        {/* Real-time counters */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-base">
              <CheckCircle className="w-4 h-4" />
              <span>{progress.tasksFound}</span>
            </div>
            <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
              Action Items Extracted
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 border border-[#E7E7E4] text-center">
            <div className="flex items-center justify-center gap-1 text-slate-700 font-bold text-base">
              <Ban className="w-4 h-4" />
              <span>{progress.skippedEmails}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Newsletters & Receipts Filtered
            </div>
          </div>
        </div>

        {/* Safety & privacy notice */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Gemini extracts only action items with zero permanent storage of your raw email text on third-party servers.
        </p>
      </div>
    </div>
  );
};
