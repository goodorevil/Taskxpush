import React from 'react';
import { X, ExternalLink, ShieldCheck, Key, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface OAuthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OAuthGuideModal: React.FC<OAuthGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="oauth-guide-modal"
        className="w-full max-w-2xl bg-white rounded-xl border border-[#E7E7E4] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E4] bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              OAuth 2.0 & Verification Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Important Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-center gap-2 font-semibold text-xs mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Production Verification vs. Developer Testing Mode</span>
            </div>
            <p>
              Google and Microsoft require formal app verification before an email reading app can be used publicly by arbitrary end-users. In testing mode, only approved test accounts added in your developer console can connect.
            </p>
          </div>

          {/* Google Gmail Setup */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>1. Google Cloud Console (Gmail API)</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>
                Navigate to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> and enable the <strong>Gmail API</strong>.
              </li>
              <li>
                Under <strong>OAuth Consent Screen</strong>, set Publishing Status to <em>Testing</em> and add your email to <strong>Test Users</strong>.
              </li>
              <li>
                Under <strong>Credentials</strong>, create an <strong>OAuth Client ID (Web Application)</strong>.
              </li>
              <li>
                Add the app URL (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{typeof window !== 'undefined' ? window.location.origin : 'https://your-app.run.app'}</code>) to <strong>Authorized JavaScript Origins</strong>.
              </li>
              <li>
                Set the Client ID in your <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> as <code className="bg-slate-100 px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code>.
              </li>
            </ol>
          </div>

          {/* Microsoft Outlook Setup */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>2. Microsoft Entra ID (Outlook / Graph API)</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>
                Visit <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-0.5">Azure App Registrations <ExternalLink className="w-2.5 h-2.5" /></a>.
              </li>
              <li>
                Register an app with Supported Account Types: <em>Accounts in any organizational directory and personal Microsoft accounts</em>.
              </li>
              <li>
                Add delegated permission: <code className="bg-slate-100 px-1 py-0.5 rounded">Mail.Read</code>.
              </li>
              <li>
                Under Authentication, add a Single-page application (SPA) Redirect URI matching your domain origin.
              </li>
              <li>
                Add the Client ID as <code className="bg-slate-100 px-1 py-0.5 rounded">VITE_MICROSOFT_CLIENT_ID</code> in <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code>.
              </li>
            </ol>
          </div>

          {/* Architecture & AI Extraction Call Flow */}
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E7E7E4] space-y-2">
            <h4 className="font-semibold text-slate-800">
              Architecture & Security Model
            </h4>
            <p>
              • <strong>Client-side:</strong> User initiates standard OAuth 2.0 popup to obtain temporary read-only token.<br/>
              • <strong>Backend Server:</strong> Express proxy uses GoogleGenAI (<code className="bg-slate-200 px-1 rounded">gemini-2.5-flash</code>) with a structured JSON schema to categorize items with zero third-party persistence.<br/>
              • <strong>Deduplication:</strong> Stored locally by email <code className="bg-slate-200 px-1 rounded">threadId</code> so re-syncing never duplicates tasks.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E7E4] bg-slate-50/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
