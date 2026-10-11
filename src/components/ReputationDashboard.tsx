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
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Users, 
  MessageSquare, 
  Globe, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Download, 
  Award, 
  Building, 
  FileText, 
  Info,
  Clock,
  ArrowUpRight,
  Sparkles,
  Lock,
  ThumbsUp,
  Shield
} from 'lucide-react';
import { StoreAuditResult, SecuritySettings } from '../types';
import { getStatusColor, formatNumber, getScoreGrade } from '../utils/formatters';

interface ReputationDashboardProps {
  audit: StoreAuditResult;
  loading: boolean;
  onRefreshScan: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  settings: SecuritySettings;
}

export const ReputationDashboard: React.FC<ReputationDashboardProps> = ({
  audit,
  loading,
  onRefreshScan,
  onOpenReport,
  onOpenSettings,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'socials' | 'reviews' | 'infrastructure' | 'history'>('overview');

  const statusInfo = getStatusColor(audit.status);
  const gradeInfo = getScoreGrade(audit.trustScore);

  const handleExportReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(audit, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `veristore-audit-${audit.domain}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-200 animate-in fade-in duration-150">
      {/* 1. Executive Summary Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Unboxed metadata separated by bullets */}
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <span className={`font-semibold ${statusInfo.text}`}>{statusInfo.label}</span>
              <span aria-hidden="true">·</span>
              <span>{audit.category || 'Retail Store'}</span>
              <span aria-hidden="true">·</span>
              <span>Domain: {audit.domain}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {audit.storeName}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {audit.summary}
            </p>
          </div>

          {/* Right Trust Grade & Score Card */}
          <div className="flex items-center gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800/80 shrink-0">
            <div className="text-center pr-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Grade
              </div>
              <div className={`text-4xl font-black ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{gradeInfo.desc}</div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="text-center pl-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Trust Score
              </div>
              <div className="text-4xl font-bold font-mono tabular-nums text-white">
                {audit.trustScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Multi-Factor Index</div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'socials', name: 'Social Proof' },
              { id: 'reviews', name: 'Customer Reviews' },
              { id: 'infrastructure', name: 'Infrastructure & SSL' },
              { id: 'history', name: 'Reputation History' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshScan}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Live Rescan'}</span>
            </button>

            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-rose-400" />
              <span>Report Phishing</span>
            </button>

            <button
              onClick={handleExportReport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download JSON Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Social Footprint',
                key: 'socialFootprint',
                data: audit.scoreBreakdown.socialFootprint,
                icon: Users,
              },
              {
                title: 'Review Authenticity',
                key: 'reviewAuthenticity',
                data: audit.scoreBreakdown.reviewAuthenticity,
                icon: MessageSquare,
              },
              {
                title: 'Infrastructure Trust',
                key: 'infrastructureTrust',
                data: audit.scoreBreakdown.infrastructureTrust,
                icon: Globe,
              },
              {
                title: 'Payment Gateway Safety',
                key: 'phishingPaymentSafety',
                data: audit.scoreBreakdown.phishingPaymentSafety,
                icon: CreditCard,
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.key}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span>{pillar.title}</span>
                    </span>
                    <span className="text-xs font-mono font-semibold tabular-nums text-slate-300">
                      {pillar.data.score}/{pillar.data.max}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pillar.data.details}
                  </p>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pillar.data.status === 'pass'
                          ? 'bg-emerald-500'
                          : pillar.data.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${(pillar.data.score / pillar.data.max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk Flags & Warnings (if any) */}
          {audit.riskFlags.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Security Red Flags & Threat Signals ({audit.riskFlags.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {audit.riskFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="font-semibold text-rose-300">
                      {flag.message}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {flag.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Specifications Table */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Identity Verification Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850">
                <div className="text-[11px] text-slate-400">Instagram Handle</div>
                <div className="font-mono text-slate-200 mt-1">{audit.socialMediaProfiles.instagram.handle}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850">
                <div className="text-[11px] text-slate-400">Domain Registration</div>
                <div className="font-mono text-slate-200 mt-1">{(audit.domainInfrastructure.domainAgeMonths / 12).toFixed(1)} years old</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850">
                <div className="text-[11px] text-slate-400">Aggregated Reviews</div>
                <div className="font-mono text-slate-200 mt-1">★ {audit.reviewsAnalysis.averageRating.toFixed(1)} ({formatNumber(audit.reviewsAnalysis.totalAggregatedReviews)})</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850">
                <div className="text-[11px] text-slate-400">Checkout Protection</div>
                <div className="text-slate-200 mt-1 truncate">{audit.domainInfrastructure.checkoutGateways[0]}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL PROOF TAB */}
      {activeTab === 'socials' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Social Media Identity Verification</h3>
            <p className="text-xs text-slate-400 mt-1">
              Cross-referenced profiles, follower authenticity ratios, and official domain link synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram Profile */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Instagram</div>
                  <div className="text-[11px] text-slate-400 font-mono">{audit.socialMediaProfiles.instagram.handle}</div>
                </div>
                <span className={audit.socialMediaProfiles.instagram.verified ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {audit.socialMediaProfiles.instagram.verified ? 'Verified Entity' : 'Unverified'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded bg-slate-900">
                  <div className="text-[10px] text-slate-400">Followers</div>
                  <div className="text-white font-semibold mt-0.5">{formatNumber(audit.socialMediaProfiles.instagram.followers)}</div>
                </div>
                <div className="p-2 rounded bg-slate-900">
                  <div className="text-[10px] text-slate-400">Bot Ratio</div>
                  <div className={(audit.socialMediaProfiles.instagram.botFollowerRatio || 0) > 30 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {audit.socialMediaProfiles.instagram.botFollowerRatio || 0}%
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900">
                  <div className="text-[10px] text-slate-400">Engagement</div>
                  <div className="text-white font-semibold mt-0.5">{audit.socialMediaProfiles.instagram.engagementRate || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* TikTok Profile */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">TikTok</div>
                  <div className="text-[11px] text-slate-400 font-mono">{audit.socialMediaProfiles.tiktok.handle}</div>
                </div>
                <span className={audit.socialMediaProfiles.tiktok.verified ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {audit.socialMediaProfiles.tiktok.verified ? 'Verified Entity' : 'Unverified'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono">
                <div className="p-2 rounded bg-slate-900">
                  <div className="text-[10px] text-slate-400">Audience</div>
                  <div className="text-white font-semibold mt-0.5">{formatNumber(audit.socialMediaProfiles.tiktok.followers)}</div>
                </div>
                <div className="p-2 rounded bg-slate-900">
                  <div className="text-[10px] text-slate-400">Status</div>
                  <div className="text-white font-semibold mt-0.5">{audit.socialMediaProfiles.tiktok.matchStatus}</div>
                </div>
              </div>
            </div>

            {/* Meta Page Transparency */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <div className="font-semibold text-white">Meta Business Page Transparency</div>
              <p className="text-slate-300 leading-relaxed">
                {audit.socialMediaProfiles.facebook.pageTransparency || 'No registered transparency record available.'}
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                Active Ad Library Campaigns: <span className="font-mono text-white">{audit.socialMediaProfiles.facebook.adLibraryActiveAds || 0}</span>
              </div>
            </div>

            {/* X / Twitter */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">X / Twitter</span>
                <span className="font-mono text-slate-400">{audit.socialMediaProfiles.twitter.handle}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {audit.socialMediaProfiles.socialSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Cross-Referenced Customer Review Intelligence</h3>
            <p className="text-xs text-slate-400 mt-1">
              Comparing independent customer feedback across Trustpilot, Google Reviews, Reddit r/Scams, and the BBB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <div className="font-semibold text-white">Trustpilot</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{audit.reviewsAnalysis.trustpilot.rating.toFixed(1)}</span>
                <span className="text-slate-400">({formatNumber(audit.reviewsAnalysis.trustpilot.count)} reviews)</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Fake review risk: <span className="text-slate-200 font-mono font-semibold">{audit.reviewsAnalysis.trustpilot.flaggedFakeReviewsPct || 0}%</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <div className="font-semibold text-white">Google Business Reviews</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{audit.reviewsAnalysis.googleReviews.rating.toFixed(1)}</span>
                <span className="text-slate-400">({formatNumber(audit.reviewsAnalysis.googleReviews.count)} reviews)</span>
              </div>
              <div className="text-[11px] text-slate-400">Aggregated merchant profile</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2 text-xs">
              <div className="font-semibold text-white">Better Business Bureau</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{audit.reviewsAnalysis.bbbRating}</span>
                <span className="text-slate-400">Rating</span>
              </div>
              <div className="text-[11px] text-slate-400">Dispute resolution grade</div>
            </div>
          </div>

          {/* Reddit Community Discussions */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 text-xs">
            <div className="font-semibold text-white">
              Reddit Consumer Protection Signal ({audit.reviewsAnalysis.redditSentiment.mentionsCount} mentions)
            </div>
            <div className="space-y-2">
              {audit.reviewsAnalysis.redditSentiment.sampleDiscussions.map((disc, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-900 text-slate-300 italic">
                  "{disc}"
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INFRASTRUCTURE TAB */}
      {activeTab === 'infrastructure' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Domain & Security Infrastructure</h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspection of WHOIS registration, TLS certificates, server locations, and tokenized payment handlers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2.5">
              <div className="font-semibold text-white">Domain WHOIS Data</div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Registration Date</span>
                  <span className="font-mono text-white">{audit.domainInfrastructure.registeredDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Registrar</span>
                  <span className="text-white">{audit.domainInfrastructure.registrar}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Hosting Geolocation</span>
                  <span className="text-white">{audit.domainInfrastructure.serverLocation}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2.5">
              <div className="font-semibold text-white">SSL & Payment Protocols</div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Certificate Issuer</span>
                  <span className="text-white truncate max-w-[200px]">{audit.domainInfrastructure.sslIssuer}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">TLS Encryption</span>
                  <span className="text-emerald-400 font-semibold">Active & Valid</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Detected Gateways</span>
                  <span className="text-white truncate max-w-[200px]">{audit.domainInfrastructure.checkoutGateways.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Historical Reputation Trajectory</h3>
            <p className="text-xs text-slate-400 mt-1">
              Score evolution over past 6 months and maintenance log.
            </p>
          </div>

          {/* Trajectory Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
            {audit.historicalReputation.timeline.map((point, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-center space-y-2">
                <div className="text-[11px] text-slate-400 font-mono">{point.date}</div>
                <div className="font-mono font-bold text-sm text-white">{point.score}</div>
                <div className="h-10 flex items-end justify-center">
                  <div
                    className={`w-6 rounded-t ${
                      point.score >= 80 ? 'bg-emerald-500' : point.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ height: `${Math.max(15, point.score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Incident Log */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-white">Audited Maintenance & Incident Log</div>
            {audit.historicalReputation.incidentLog.map((inc, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{inc.title}</div>
                  <div className="text-slate-400 mt-0.5">{inc.description}</div>
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-4">{inc.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
