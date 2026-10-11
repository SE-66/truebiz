import React from 'react';
import { AlertTriangle, ShieldAlert, X, ArrowLeft, ExternalLink, Flag } from 'lucide-react';
import { StoreAuditResult } from '../types';

interface SuspiciousAlertModalProps {
  audit: StoreAuditResult;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport: () => void;
  onOpenDashboard: () => void;
  onSafeExit: () => void;
}

export const SuspiciousAlertModal: React.FC<SuspiciousAlertModalProps> = ({
  audit,
  isOpen,
  onClose,
  onOpenReport,
  onOpenDashboard,
  onSafeExit,
}) => {
  if (!isOpen) return null;

  const isPhishing = audit.status === 'phishing';
  const criticalFlags = audit.riskFlags.filter((f) => f.severity === 'critical');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl text-slate-200">
        {/* Warning Header */}
        <div className="bg-rose-950/80 px-6 py-4 border-b border-rose-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-300">
                VeriStore Real-Time Defense
              </div>
              <h2 className="text-base font-bold text-white">
                {isPhishing ? 'Malicious Phishing Store Detected' : 'High-Risk Store Warning'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/50 transition-colors cursor-pointer"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          {/* Domain & Score Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Domain Under Inspection</div>
              <div className="text-sm font-bold font-mono text-white mt-0.5">{audit.domain}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Trust Score</div>
              <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
                {audit.trustScore}/100 ({audit.status})
              </div>
            </div>
          </div>

          {/* Core Danger Reason */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Why VeriStore recommends caution:</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-5">
              {audit.summary}
            </p>
          </div>

          {/* Key Red Flags */}
          {criticalFlags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Critical Anomaly Indicators
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {criticalFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="font-semibold text-rose-300">{flag.message}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{flag.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={onSafeExit}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Safely Return to Verified Store</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenReport();
              }}
              className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Phishing</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDashboard();
              }}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Audit</span>
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-300 underline cursor-pointer"
            >
              Dismiss warning and stay on this page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
