import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings as SettingsIcon, 
  Flag, 
  Download, 
  Eye, 
  Radio, 
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { StoreAuditResult, SecuritySettings, PhishingReport } from './types';
import { getCachedAudit, setCachedAudit, invalidateAuditCache } from './utils/auditCache';
import { BrowserSimulator } from './components/BrowserSimulator';
import { ReputationDashboard } from './components/ReputationDashboard';
import { SuspiciousAlertModal } from './components/SuspiciousAlertModal';
import { ReportPhishingModal } from './components/ReportPhishingModal';
import { SettingsModal } from './components/SettingsModal';
import { ExtensionDownloadModal } from './components/ExtensionDownloadModal';
import { CommunityFeedModal } from './components/CommunityFeedModal';

const PRESET_DOMAINS = [
  { label: 'eshopgs.com', url: 'https://eshopgs.com/lb/', score: 86, status: 'verified' },
  { label: 'patagonia.com', url: 'https://www.patagonia.com', score: 97, status: 'verified' },
  { label: 'gymshark.com', url: 'https://www.gymshark.com', score: 92, status: 'verified' },
  { label: 'trendy-boutique-direct.co', url: 'https://trendy-boutique-direct.co', score: 56, status: 'caution' },
  { label: 'nikes-flash-superoutlet.shop', url: 'https://nikes-flash-superoutlet.shop', score: 23, status: 'suspicious' },
  { label: 'lulu-clearance-sale.vip', url: 'https://lulu-clearance-sale.vip', score: 12, status: 'phishing' },
];

const DEFAULT_SETTINGS: SecuritySettings = {
  alertSensitivity: 'moderate',
  autoPopupOnSuspicious: true,
  blockUnsafeCheckout: true,
  minTrustScoreThreshold: 60,
  scanSocialsInRealtime: true,
  crossReferenceReviews: true,
  soundAlerts: false,
  trustedWhitelist: ['patagonia.com', 'allbirds.com', 'gymshark.com'],
  showOnPageBadge: true,
};

export default function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('https://nikes-flash-superoutlet.shop');
  const [audit, setAudit] = useState<StoreAuditResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'simulator' | 'dashboard'>('simulator');

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isExtensionCodeModalOpen, setIsExtensionCodeModalOpen] = useState<boolean>(false);
  const [isCommunityFeedModalOpen, setIsCommunityFeedModalOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<SecuritySettings>(() => {
    try {
      const saved = localStorage.getItem('veristore_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleUpdateSettings = (newSettings: SecuritySettings) => {
    setSettings(newSettings);
    localStorage.setItem('veristore_settings', JSON.stringify(newSettings));
  };

  const [cacheSource, setCacheSource] = useState<{ fromCache: boolean; cachedAt: number | null }>({ fromCache: false, cachedAt: null });

  // Perform store audit with localStorage caching
  const performAudit = async (urlToAudit: string, forceAi = false) => {
    // 1. Check client-side localStorage cache first if not forced
    if (!forceAi) {
      const cached = getCachedAudit(urlToAudit);
      if (cached) {
        setAudit(cached.data);
        setLoading(false);
        setCacheSource({ fromCache: true, cachedAt: cached.cachedAt });

        // Check if we should pop up warning alert
        const isWhitelisted = settings.trustedWhitelist.some((domain) =>
          cached.data.domain.toLowerCase().includes(domain.toLowerCase())
        );

        if (!isWhitelisted && settings.autoPopupOnSuspicious) {
          const threshold = settings.minTrustScoreThreshold;
          if (cached.data.trustScore < threshold || cached.data.status === 'suspicious' || cached.data.status === 'phishing') {
            setIsAlertModalOpen(true);
          }
        }
        return;
      }
    } else {
      // Invalidate existing cache entry on explicit rescan
      invalidateAuditCache(urlToAudit);
    }

    setLoading(true);
    try {
      const res = await fetch('/api/verify-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToAudit, forceAi }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAudit(data.data);
        setCacheSource({ fromCache: false, cachedAt: Date.now() });

        // Save successfully verified store to localStorage cache
        setCachedAudit(urlToAudit, data.data);

        // Check if we should pop up warning alert
        const isWhitelisted = settings.trustedWhitelist.some((domain) =>
          data.data.domain.toLowerCase().includes(domain.toLowerCase())
        );

        if (!isWhitelisted && settings.autoPopupOnSuspicious) {
          const threshold = settings.minTrustScoreThreshold;
          if (data.data.trustScore < threshold || data.data.status === 'suspicious' || data.data.status === 'phishing') {
            setIsAlertModalOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performAudit(currentUrl);
  }, [currentUrl]);

  const handleNavigate = (newUrl: string) => {
    setCurrentUrl(newUrl);
  };

  const handleSafeExit = () => {
    setIsAlertModalOpen(false);
    setCurrentUrl('https://www.patagonia.com');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Bar following strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center space-x-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <a href="/" className="text-base font-bold tracking-tight text-white">
            VeriStore TrustGuard
          </a>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveView('simulator')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeView === 'simulator' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Browser Shield
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeView === 'dashboard' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Reputation Audit Hub
          </button>
          <button
            onClick={() => setIsCommunityFeedModalOpen(true)}
            className="whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Threat Radar</span>
          </button>
          <button
            onClick={() => setIsExtensionCodeModalOpen(true)}
            className="whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Extension Code (V3)
          </button>
        </nav>

        {/* Zone 3: Primary action + Settings */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Phishing</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Extension Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {loading && !audit ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 animate-spin">
              <Shield className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-white">Verifying store legitimacy...</h3>
              <p className="text-xs text-slate-400 mt-1">Cross-referencing reviews, social platforms, and TLS data</p>
            </div>
          </div>
        ) : audit ? (
          <>
            {activeView === 'simulator' ? (
              <div className="space-y-4">
                {/* Secondary navigation & guidance row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-semibold">Active Extension Viewport</span>
                    <span aria-hidden="true">·</span>
                    {cacheSource.fromCache ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <span>⚡ Instant from LocalStorage Cache</span>
                        {cacheSource.cachedAt && (
                          <span className="text-slate-500">
                            ({new Date(cacheSource.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-indigo-400 flex items-center gap-1 font-mono">
                        <span>✨ Live Real-Time Analysis</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {cacheSource.fromCache && (
                      <button
                        onClick={() => performAudit(currentUrl, true)}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                        title="Bypass cache and force real-time Gemini AI audit"
                      >
                        Force Live Re-scan
                      </button>
                    )}
                    <button
                      onClick={() => setActiveView('dashboard')}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Full Security Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <BrowserSimulator
                  currentUrl={currentUrl}
                  onNavigate={handleNavigate}
                  audit={audit}
                  loading={loading}
                  onRefreshScan={() => performAudit(currentUrl, true)}
                  onOpenDashboard={() => setActiveView('dashboard')}
                  onOpenReport={() => setIsReportModalOpen(true)}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  settings={settings}
                  presetDomains={PRESET_DOMAINS}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveView('simulator')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Return to Browser Simulation</span>
                  </button>
                  <span className="text-slate-400 font-mono">
                    Auditing: {audit.domain}
                  </span>
                </div>

                <ReputationDashboard
                  audit={audit}
                  loading={loading}
                  onRefreshScan={() => performAudit(currentUrl, true)}
                  onOpenReport={() => setIsReportModalOpen(true)}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  settings={settings}
                />
              </div>
            )}
          </>
        ) : null}
      </main>

      {/* Global Modals */}
      {audit && (
        <SuspiciousAlertModal
          audit={audit}
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenDashboard={() => setActiveView('dashboard')}
          onSafeExit={handleSafeExit}
        />
      )}

      <ReportPhishingModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialDomain={audit?.domain}
        initialUrl={audit?.url}
        onReportSuccess={(rep) => {
          if (audit && rep.domain === audit.domain) {
            performAudit(currentUrl, true);
          }
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <ExtensionDownloadModal
        isOpen={isExtensionCodeModalOpen}
        onClose={() => setIsExtensionCodeModalOpen(false)}
      />

      <CommunityFeedModal
        isOpen={isCommunityFeedModalOpen}
        onClose={() => setIsCommunityFeedModalOpen(false)}
        onSelectDomain={(dom) => {
          handleNavigate(`https://${dom}`);
        }}
      />

      {/* Clean footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-4 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            VeriStore TrustGuard · Real-Time E-Commerce Legitimacy & Phishing Protection
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <button onClick={() => setIsSettingsModalOpen(true)} className="hover:text-slate-200 cursor-pointer">
              Settings
            </button>
            <button onClick={() => setIsCommunityFeedModalOpen(true)} className="hover:text-slate-200 cursor-pointer">
              Threat Blacklist
            </button>
            <button onClick={() => setIsExtensionCodeModalOpen(true)} className="hover:text-slate-200 cursor-pointer">
              Manifest V3 Source
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
