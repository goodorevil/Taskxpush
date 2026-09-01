import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Inbox, 
  Filter,
  Info
} from 'lucide-react';

interface LandingConnectProps {
  onConnectGmail: () => void;
  onConnectOutlook: () => void;
  onTryDemo: () => void;
  onOpenOAuthGuide: () => void;
  isConnecting: boolean;
}

export const LandingConnect: React.FC<LandingConnectProps> = ({
  onConnectGmail,
  onConnectOutlook,
  onTryDemo,
  onOpenOAuthGuide,
  isConnecting,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-slate-800 flex flex-col justify-between font-sans">
      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C2542D] flex items-center justify-center text-white shadow-xs">
            <Inbox className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Prioris
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenOAuthGuide}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors min-h-[44px] px-3"
        >
          <Info className="w-4 h-4" />
          <span>OAuth Setup Guide</span>
        </button>
      </header>

      {/* Main Hero & Value Proposition */}
      <main className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Scope pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-xs font-bold text-[#C2542D] mb-6">
          <Filter className="w-3.5 h-3.5" />
          <span>Email-to-Action Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 max-w-2xl leading-[1.15] mb-5">
          Turn your inbox into structured, actionable categories.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-8">
          Prioris sorts every message into eight clear categories, including engagements, deadlines / reply, opportunities, finance, and updates.
        </p>

        {/* Primary Connection Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center mb-6">
          {/* Gmail Button */}
          <button
            id="landing-connect-gmail-btn"
            type="button"
            disabled={isConnecting}
            onClick={onConnectGmail}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white text-slate-800 border border-[#E7E7E4] hover:bg-slate-50 font-bold text-xs shadow-xs transition-all min-h-[44px] disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.55 0 2.94.57 4.04 1.51L19 3.65C17.13 1.94 14.73 1 12 1 7.42 1 3.51 3.61 1.63 7.42l3.69 2.87C6.2 7.43 8.87 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.72-4.94 3.72-8.69z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.71c-.24-.72-.37-1.49-.37-2.28 0-.79.13-1.56.37-2.28L1.63 7.29C.59 9.36 0 11.62 0 14.07c0 2.45.59 4.71 1.63 6.78l3.69-2.87z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.73-2.47 1.16-4.23 1.16-3.13 0-5.8-2.43-6.68-5.71L1.63 15.54C3.51 19.39 7.42 23 12 23z"
              />
            </svg>
            <span>Connect Gmail</span>
          </button>

          {/* Outlook Button */}
          <button
            id="landing-connect-outlook-btn"
            type="button"
            disabled={isConnecting}
            onClick={onConnectOutlook}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white text-slate-800 border border-[#E7E7E4] hover:bg-slate-50 font-bold text-xs shadow-xs transition-all min-h-[44px] disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#0078D4" d="M1 4.5l10-2v19l-10-2z" />
              <path fill="#28A8EA" d="M11 2.5l12 2.5v14l-12 2.5z" />
              <path fill="#002050" d="M11 8.5h12v7H11z" />
            </svg>
            <span>Connect Outlook</span>
          </button>
        </div>

        {/* Instant Demo Sandbox option */}
        <div className="flex items-center gap-2 mb-10 min-h-[44px]">
          <span className="text-xs text-slate-500 font-medium">Or test with sample data:</span>
          <button
            id="landing-try-demo-btn"
            type="button"
            onClick={onTryDemo}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#C2542D] hover:underline"
          >
            <span>Explore Demo Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left max-w-3xl">
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E4] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Filter className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              8 Organizing Categories
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every email is sorted into Engagements, Deadlines / Reply, Opportunities, Experiences, Finance, Discover, Updates, or Spam.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E7E7E4] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#C2542D] flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Parsed Deadlines
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Relative dates like "by Friday at 5 PM" are converted to clear calendar deadlines on task cards.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E7E7E4] shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Read-Only & Secure
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Read-only permissions only. No email deletion, sending, or permanent raw storage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-[#E7E7E4] text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>Prioris · Email Action Engine</span>
        <span>Built with Google Gemini & OAuth 2.0</span>
      </footer>
    </div>
  );
};
