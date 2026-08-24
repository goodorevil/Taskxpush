import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Sliders, 
  Mail, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { ScanConfig } from '../types';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScanConfig;
  onSaveConfig: (cfg: ScanConfig) => void;
  onStartFirstScan: () => void;
  userEmail?: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onStartFirstScan,
  userEmail,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scanLimit, setScanLimit] = useState(config.scanLimit);
  const [scanRangeDays, setScanRangeDays] = useState(config.scanRangeDays);
  const [filterNewsletters, setFilterNewsletters] = useState(config.filterNewsletters);

  const handleNext = () => {
    if (step === 2) {
      onSaveConfig({
        ...config,
        scanLimit,
        scanRangeDays,
        filterNewsletters,
      });
    }
    if (step < 3) {
      setStep((step + 1) as 2 | 3);
    } else {
      onStartFirstScan();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="onboarding-modal"
        className="w-full max-w-lg bg-white rounded-xl border border-[#E7E7E4] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Step Indicator Top Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#E7E7E4]">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step === s
                      ? 'bg-orange-600 text-white ring-2 ring-orange-500/30'
                      : step > s
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 3 && <div className="w-6 h-0.5 bg-slate-200" />}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-slate-700"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Welcome to InboxFlow
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                InboxFlow connects with your inbox to automatically isolate action items, contract reviews, deadlines, and replies owed so you never drop an important commitment.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E7E7E4] space-y-2 text-xs">
                <div className="font-semibold text-slate-800">
                  Privacy & Data Safety:
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Read-only scope — InboxFlow cannot delete or send emails.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Zero email storage — only extracted task titles and dates are saved.</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Configure Your First Scan
              </h2>
              <p className="text-xs text-slate-600">
                Set how far back and how deep you want the initial AI pass to scan.
              </p>

              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Scan Date Range
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setScanRangeDays(days)}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                          scanRangeDays === days
                            ? 'border-orange-600 bg-orange-50 text-orange-700 font-semibold'
                            : 'border-[#E7E7E4] hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Last {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Max Email Count
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 100].map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => setScanLimit(limit)}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                          scanLimit === limit
                            ? 'border-orange-600 bg-orange-50 text-orange-700 font-semibold'
                            : 'border-[#E7E7E4] hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {limit} Emails
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterNewsletters}
                      onChange={(e) => setFilterNewsletters(e.target.checked)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span>Automatically skip marketing newsletters and receipts</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                You're Ready to Flow
              </h2>
              <p className="text-xs text-slate-600">
                Here's a quick preview of what you can do on the task dashboard:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E7E7E4] flex items-center gap-2.5">
                  <div className="p-1 rounded bg-orange-100 text-orange-600">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Kanban & List views</span>
                    <p className="text-slate-500 text-[11px]">Drag tasks between To Do, In Progress, and Done.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E7E7E4] flex items-center gap-2.5">
                  <div className="p-1 rounded bg-amber-100 text-amber-600">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Deep Link to Emails</span>
                    <p className="text-slate-500 text-[11px]">Click any card to read original message context or jump to thread.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 border-t border-[#E7E7E4] bg-slate-50/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            id="onboarding-next-btn"
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all"
          >
            <span>{step === 3 ? 'Start Initial Scan' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
