import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Flag, 
  Settings, 
  Share2, 
  Lock, 
  Users, 
  MessageSquare, 
  Globe, 
  CreditCard,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { StoreAuditResult, SecuritySettings } from '../types';
import { getStatusColor, formatNumber } from '../utils/formatters';

interface ExtensionPopupProps {
  audit: StoreAuditResult;
  loading: boolean;
  onRefreshScan: () => void;
  onOpenDashboard: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  settings: SecuritySettings;
}

export const ExtensionPopup: React.FC<ExtensionPopupProps> = ({
  audit,
  loading,
  onRefreshScan,
  onOpenDashboard,
  onOpenReport,
  onOpenSettings,
  settings,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const statusInfo = getStatusColor(audit.status);
  const isSuspicious = audit.status === 'suspicious' || audit.status === 'phishing';

  // SVG Gauge calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (audit.trustScore / 100) * circumference;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <div className="w-[370px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-150">
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight flex items-center space-x-1.5">
              <span>VeriStore</span>
              <span className="text-[10px] text-slate-500 font-mono">v3.4</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]" title={audit.domain}>
              {audit.domain}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onRefreshScan}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Re-verify domain intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Security Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Primary Score Card */}
      <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between">
        <div className="space-y-1 pr-2">
          <div className="text-xs font-bold text-white leading-tight">
            {audit.storeName}
          </div>
          {/* Clean unboxed metadata with bullet separators */}
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <span className={statusInfo.text}>{statusInfo.label}</span>
            <span aria-hidden="true">·</span>
            <span>{audit.category || 'Online Store'}</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-0.5 leading-snug">
            {statusInfo.sublabel}
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ${
                audit.trustScore >= 80
                  ? 'text-emerald-500'
                  : audit.trustScore >= 60
                  ? 'text-amber-500'
                  : audit.trustScore >= 35
                  ? 'text-orange-500'
                  : 'text-rose-500'
              }`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold font-mono tabular-nums leading-none text-white">
              {audit.trustScore}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
              SCORE
            </span>
          </div>
        </div>
      </div>

      {/* 3. Threat Alert Ribbon if Suspicious */}
      {isSuspicious && (
        <div className="bg-rose-950/60 border-b border-rose-900/60 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">High fraud risk: review discrepancies & domain anomalies</span>
          </div>
          <button
            onClick={onOpenReport}
            className="text-[11px] font-semibold text-rose-200 hover:text-white underline shrink-0 ml-2 cursor-pointer"
          >
            Report
          </button>
        </div>
      )}

      {/* 4. Four Pillar Rows */}
      <div className="p-3.5 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 px-1">
          Identity Pillars
        </div>

        <div className="space-y-1.5">
          {/* Social Media Check */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200 text-xs">Social Presence</div>
                <div className="text-[11px] text-slate-400">
                  {audit.socialMediaProfiles.instagram.verified ? (
                    <span>Verified ({formatNumber(audit.socialMediaProfiles.instagram.followers)} IG)</span>
                  ) : audit.socialMediaProfiles.instagram.matchStatus === 'impersonation_risk' ? (
                    <span className="text-rose-400">Impersonation Risk</span>
                  ) : (
                    <span>{audit.socialMediaProfiles.instagram.botFollowerRatio || 0}% bot profile risk</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-300">
              {audit.scoreBreakdown.socialFootprint.score}/25
            </span>
          </div>

          {/* Customer Reviews */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200 text-xs">Review Authenticity</div>
                <div className="text-[11px] text-slate-400">
                  {audit.reviewsAnalysis.fakeReviewDetectionPct > 25 ? (
                    <span className="text-rose-400">{audit.reviewsAnalysis.fakeReviewDetectionPct}% synthetic reviews</span>
                  ) : (
                    <span>★ {audit.reviewsAnalysis.averageRating.toFixed(1)} ({formatNumber(audit.reviewsAnalysis.totalAggregatedReviews)} reviews)</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-300">
              {audit.scoreBreakdown.reviewAuthenticity.score}/25
            </span>
          </div>

          {/* Domain Age & Infrastructure */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200 text-xs">Domain & Infrastructure</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {audit.domainInfrastructure.domainAgeMonths >= 12 ? (
                    <span>{(audit.domainInfrastructure.domainAgeMonths / 12).toFixed(1)} years old · EV SSL</span>
                  ) : (
                    <span className={audit.domainInfrastructure.domainAgeMonths < 1 ? 'text-rose-400' : 'text-amber-400'}>
                      Registered {audit.domainInfrastructure.domainAgeMonths} mos ago
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-300">
              {audit.scoreBreakdown.infrastructureTrust.score}/25
            </span>
          </div>

          {/* Payment Gateway */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-slate-200 text-xs">Payment Processing</div>
                <div className="text-[11px] text-slate-400 truncate max-w-[190px]">
                  {audit.domainInfrastructure.checkoutGateways[0] || 'Unknown processor'}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-300">
              {audit.scoreBreakdown.phishingPaymentSafety.score}/25
            </span>
          </div>
        </div>
      </div>

      {/* 5. Footer Actions */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenDashboard}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <span>Open Full Reputation Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReport}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-rose-200 border border-slate-700/80 text-xs font-medium flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Phishing</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-xs font-medium flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            title="Copy audit link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
