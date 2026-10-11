import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Clock, 
  Flame, 
  Tag, 
  Sparkles,
  ChevronDown,
  Info,
  Shield,
  Loader2,
  Users,
  MessageSquare,
  Globe
} from 'lucide-react';
import { StoreAuditResult, SecuritySettings } from '../types';
import { ExtensionPopup } from './ExtensionPopup';
import { getStatusColor, formatNumber } from '../utils/formatters';

interface BrowserSimulatorProps {
  currentUrl: string;
  onNavigate: (newUrl: string) => void;
  audit: StoreAuditResult;
  loading: boolean;
  onRefreshScan: () => void;
  onOpenDashboard: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  settings: SecuritySettings;
  presetDomains: { label: string; url: string; score: number; status: string }[];
}

export const BrowserSimulator: React.FC<BrowserSimulatorProps> = ({
  currentUrl,
  onNavigate,
  audit,
  loading,
  onRefreshScan,
  onOpenDashboard,
  onOpenReport,
  onOpenSettings,
  settings,
  presetDomains,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isExtensionPopupOpen, setIsExtensionPopupOpen] = useState(false);
  const [fakeCartCount, setFakeCartCount] = useState(1);
  const [showSimulatedCheckoutWarning, setShowSimulatedCheckoutWarning] = useState(false);
  const [showSecurityDropdown, setShowSecurityDropdown] = useState(false);
  const [scanStep, setScanStep] = useState(1);

  useEffect(() => {
    setInputUrl(currentUrl);
  }, [currentUrl]);

  // Simulate scanning radar step progression when loading is active
  useEffect(() => {
    if (loading) {
      setScanStep(1);
      const timer1 = setTimeout(() => setScanStep(2), 700);
      const timer2 = setTimeout(() => setScanStep(3), 1500);
      const timer3 = setTimeout(() => setScanStep(4), 2300);
      const timer4 = setTimeout(() => setScanStep(5), 3100);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [loading]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    onNavigate(target);
  };

  const statusColor = getStatusColor(audit.status);
  const isSuspicious = audit.status === 'suspicious' || audit.status === 'phishing';

  // Domain-specific branding helpers
  const isPatagonia = audit.domain.includes('patagonia');
  const isGymshark = audit.domain.includes('gymshark');
  const isEshopGS = audit.domain.includes('eshopgs');

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* 1. Chrome Tab Strip */}
      <div className="bg-slate-900/90 px-4 pt-3 pb-1.5 border-b border-slate-800 flex items-center justify-between select-none">
        {/* Left Mac Window Controls & Tab */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
          </div>

          {/* Active Tab */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-t-lg bg-slate-950 border-t border-x border-slate-800 text-xs font-medium text-slate-200 max-w-sm shadow-sm">
            {loading ? (
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
            ) : (
              <span
                className={`w-2 h-2 rounded-full ${
                  audit.trustScore >= 80 ? 'bg-emerald-500' : audit.trustScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
            )}
            <span className="truncate max-w-[170px]">{loading ? 'Scanning URL...' : audit.storeName}</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({loading ? inputUrl.replace(/^https?:\/\//i, '').split('/')[0] : audit.domain})
            </span>
          </div>
        </div>

        {/* Preset Store Quick Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[11px] text-slate-400 hidden xl:inline">
            Quick Demos:
          </span>
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 overflow-x-auto">
            {presetDomains.map((preset) => {
              const active = currentUrl.toLowerCase().includes(preset.label.toLowerCase()) || audit.domain === preset.label;
              return (
                <button
                  key={preset.label}
                  onClick={() => onNavigate(preset.url)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`${preset.label} (Score: ${preset.score})`}
                >
                  <span className="mr-1">
                    {preset.score >= 80 ? '🟢' : preset.score >= 55 ? '🟡' : '🔴'}
                  </span>
                  <span>{preset.label.split('.')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Chrome Address Bar & Extension Toolbar */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3 relative z-30">
        {/* Navigation Arrows */}
        <div className="flex items-center space-x-1 text-slate-400">
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRefreshScan}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Reload & Force AI Re-scan"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Omnibox / Address Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 max-w-3xl flex items-center">
          <div className="w-full flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus-within:border-indigo-500 transition-colors">
            {/* Padlock button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSecurityDropdown(!showSecurityDropdown)}
                className="flex items-center space-x-1 mr-2 text-slate-400 hover:text-white cursor-pointer"
                title="View TLS certificate details"
              >
                <Lock className={`w-3.5 h-3.5 ${audit.domainInfrastructure.sslValid ? 'text-emerald-400' : 'text-rose-400'}`} />
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {/* Security info dropdown */}
              {showSecurityDropdown && (
                <div className="absolute left-0 top-7 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-3 text-xs text-slate-300 z-50 space-y-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Connection is Secure (TLS 1.3)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Certificate: <span className="text-slate-200 font-mono">{audit.domainInfrastructure.sslIssuer}</span></div>
                    <div>Domain Age: <span className="text-slate-200 font-mono">{(audit.domainInfrastructure.domainAgeMonths / 12).toFixed(1)} years</span></div>
                    <div>Registrar: <span className="text-slate-200">{audit.domainInfrastructure.registrar}</span></div>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowSecurityDropdown(false)}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Close details
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste any store URL (e.g. https://eshopgs.com/lb/)..."
              className="flex-1 bg-transparent border-none text-slate-100 font-mono focus:outline-none px-1 text-xs"
            />

            <button
              type="submit"
              disabled={loading}
              className="ml-2 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-[11px] shrink-0 transition-colors cursor-pointer flex items-center gap-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <span>Scan Store</span>
              )}
            </button>
          </div>
        </form>

        {/* Extension Toolbar Strip on the right */}
        <div className="flex items-center space-x-2">
          {/* THE BROWSER EXTENSION TOOLBAR ICON */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExtensionPopupOpen(!isExtensionPopupOpen)}
              className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                isExtensionPopupOpen
                  ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
              }`}
              title="VeriStore TrustGuard Extension - Click to inspect identity & trust"
            >
              <Shield className="w-4 h-4 text-indigo-400" />

              {/* Dynamic Overlay Trust Badge */}
              <span
                className={`absolute -top-1 -right-1 px-1 py-0.2 rounded-md text-[9px] font-bold font-mono text-white ${
                  audit.trustScore >= 80
                    ? 'bg-emerald-600'
                    : audit.trustScore >= 60
                    ? 'bg-amber-600'
                    : audit.trustScore >= 35
                    ? 'bg-orange-600'
                    : 'bg-rose-600'
                }`}
              >
                {audit.trustScore}
              </span>
            </button>

            {/* Pinned Extension Popup anchored right under the toolbar icon */}
            {isExtensionPopupOpen && (
              <div className="absolute right-0 top-11 z-50">
                <ExtensionPopup
                  audit={audit}
                  loading={loading}
                  onRefreshScan={onRefreshScan}
                  onOpenDashboard={() => {
                    setIsExtensionPopupOpen(false);
                    onOpenDashboard();
                  }}
                  onOpenReport={() => {
                    setIsExtensionPopupOpen(false);
                    onOpenReport();
                  }}
                  onOpenSettings={() => {
                    setIsExtensionPopupOpen(false);
                    onOpenSettings();
                  }}
                  settings={settings}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Simulated Webpage Content Area */}
      <div className="relative bg-slate-950 min-h-[600px] flex flex-col justify-between overflow-y-auto">
        {/* LIVE REAL-TIME SCANNING HUD OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in duration-150">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-xl">
                <Shield className="w-8 h-8 animate-pulse" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <span>Real-Time Store Legitimacy Audit</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Scanning target: <span className="text-indigo-400 font-bold">{inputUrl}</span>
              </p>
            </div>

            {/* 5-step live scanning checklist */}
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. WHOIS registry & SSL TLS verification</span>
                </span>
                <span className={scanStep >= 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {scanStep > 1 ? '✓ Verified' : 'Checking...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Scanning social media footprints & bot ratios</span>
                </span>
                <span className={scanStep >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {scanStep > 2 ? '✓ Analyzed' : scanStep === 2 ? 'Scanning...' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3. Cross-referencing Trustpilot, Google & Reddit</span>
                </span>
                <span className={scanStep >= 3 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {scanStep > 3 ? '✓ Cross-checked' : scanStep === 3 ? 'Scanning...' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>4. Checkout gateway & phishing vector security</span>
                </span>
                <span className={scanStep >= 4 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {scanStep > 4 ? '✓ Audited' : scanStep === 4 ? 'Evaluating...' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="flex items-center gap-2 text-indigo-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>5. Gemini 3.8 Flash multi-factor synthesis</span>
                </span>
                <span className={scanStep >= 5 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
                  {scanStep >= 5 ? 'Synthesizing...' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* On-Page Suspicious Warning Banner (if high risk) */}
        {!loading && isSuspicious && (
          <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-200 z-10">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wide text-white">
                  VeriStore Security Intercept:
                </span>{' '}
                <span className="text-xs text-rose-200">
                  {audit.status === 'phishing' ? 'Active credential theft & fake payment clone detected.' : 'Unverified dropshipper with high consumer dispute volume.'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onOpenReport}
                className="py-1 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Report Phishing
              </button>
              <button
                onClick={onOpenDashboard}
                className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                View Audit
              </button>
            </div>
          </div>
        )}

        {/* STOREFRONT PREVIEW */}
        <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Store Brand Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <div className="font-bold text-lg text-white tracking-tight">{audit.storeName}</div>
              <div className="text-xs text-slate-400 flex items-center space-x-2">
                <span>{audit.domain}</span>
                <span aria-hidden="true">·</span>
                <span>{audit.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400">{audit.url}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="hidden md:inline hover:text-white cursor-pointer">Catalog</span>
              <span className="hidden md:inline hover:text-white cursor-pointer">About</span>
              <span className="hidden md:inline hover:text-white cursor-pointer">Returns</span>
              <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium cursor-pointer">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xs">{fakeCartCount}</span>
              </div>
            </div>
          </div>

          {/* STORE PRODUCTS AND BANNER */}
          {audit.status === 'verified' || audit.status === 'caution' ? (
            /* VERIFIED OR CAUTION STORE DISPLAY */
            <div className="space-y-6">
              {/* Hero Banner with Store Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 items-center">
                <div className="space-y-3">
                  <div className={`text-xs font-semibold flex items-center gap-1.5 ${audit.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {audit.status === 'verified' ? 'Verified Store Identity · Real-Time Confirmed' : 'Exercise Caution · Unverified Social Presence'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {audit.storeName}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {audit.summary}
                  </p>

                  <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                    <span>Gateways:</span>
                    {audit.domainInfrastructure.checkoutGateways.map((gw, i) => (
                      <span key={i} className="font-mono text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">
                        {gw}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setFakeCartCount(fakeCartCount + 1)}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer text-white ${
                        audit.status === 'verified' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      Shop Featured Catalog
                    </button>
                    <span className="text-xs text-slate-400">Trust Score: {audit.trustScore}/100</span>
                  </div>
                </div>

                {/* Studio product image */}
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-[4/3] bg-slate-950 flex items-center justify-center">
                  {isPatagonia ? (
                    <img
                      src="/src/assets/images/patagonia_jacket_photo_1791701320355.jpg"
                      alt="Verified Product Asset"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : isGymshark ? (
                    <img
                      src="/src/assets/images/athletic_performance_apparel_1791701337516.jpg"
                      alt="Gymshark Performance Apparel"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : isEshopGS ? (
                    <div className="p-6 text-center space-y-2 bg-gradient-to-br from-slate-900 to-slate-950 w-full h-full flex flex-col items-center justify-center">
                      <div className="text-2xl font-black text-white tracking-wider">GS STORES</div>
                      <div className="text-xs text-emerald-400 font-semibold">Verified Retail Chain (Lebanon)</div>
                      <div className="text-[11px] text-slate-400 max-w-xs">
                        Official Multi-Brand Online Boutique by HST Co. SAL
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono pt-1">
                        Areeba Verified Checkout · Cash on Delivery Supported
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-2 bg-slate-900 w-full h-full flex flex-col items-center justify-center">
                      <div className="text-lg font-bold text-white">{audit.storeName}</div>
                      <div className="text-xs text-slate-400">{audit.category}</div>
                      <div className="text-[11px] text-indigo-400 font-mono">Real-Time Inspected Storefront</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    name: isEshopGS ? 'Timberland Classic Oxford Lace-up' : isPatagonia ? 'EcoShell Alpine Jacket' : 'Signature Seasonal Item', 
                    price: isEshopGS ? '$140.00' : '$249.00', 
                    rating: '4.8 (Verified Buyer Reviews)' 
                  },
                  { 
                    name: isEshopGS ? 'Geox Breathable Leather Sneaker' : isPatagonia ? 'Seamless Performance Tee' : 'Premium Essential Wear', 
                    price: isEshopGS ? '$120.00' : '$48.00', 
                    rating: '4.6 (Customer Authenticated)' 
                  },
                  { 
                    name: isEshopGS ? 'Springfield Mediterranean Casual Shirt' : isPatagonia ? 'Merino Wool Trail Knit' : 'Everyday Performance Knit', 
                    price: isEshopGS ? '$45.00' : '$115.00', 
                    rating: '4.9 (Local Store Reviews)' 
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="h-32 rounded-lg bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs font-mono p-2 text-center">
                      <div className="font-semibold text-slate-300">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Verified In-Stock SKU</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.rating}</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-1">{item.price}</div>
                    </div>
                    <button
                      onClick={() => setFakeCartCount(fakeCartCount + 1)}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* SUSPICIOUS / SCAM STORE DISPLAY */
            <div className="space-y-6">
              {/* Urgency Bait Banner */}
              <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Unrealistic 90% Clearance Promotion</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Emergency Liquidation Sale — Today Only!
                  </h3>
                  <p className="text-xs text-rose-200">
                    High-pressure countdown tactics commonly utilized by fraudulent pop-up stores.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-rose-800/60 text-center shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Offer Expires In</div>
                  <div className="text-xl font-bold font-mono text-rose-400">03:41.12</div>
                </div>
              </div>

              {/* Suspicious Mock Products */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 items-center">
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-[4/3] bg-slate-950">
                  <img
                    src="/src/assets/images/scam_counterfeit_sneakers_1791701352793.jpg"
                    alt="Counterfeit Product Item"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Counterfeit Impersonation Risk</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Air Limited Edition Sneaker (91% OFF)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold font-mono text-rose-400">$29.99</span>
                    <span className="text-xs text-slate-500 line-through">$320.00</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Warning: Price discrepancy exceeds safe retail margins. Independent forums report non-delivery and credit card skimming from this domain.
                  </p>
                  <button
                    onClick={() => setShowSimulatedCheckoutWarning(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
                  >
                    Simulate Checkout (Test VeriStore Shield)
                  </button>
                </div>
              </div>

              {/* Checkout Warning Intercept Card */}
              {showSimulatedCheckoutWarning && (
                <div className="p-5 rounded-2xl bg-slate-900 border-2 border-rose-600 text-slate-200 space-y-3 animate-in zoom-in-95 duration-150 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-sm text-white">
                      <ShieldX className="w-5 h-5 text-rose-400" />
                      <span>VeriStore Checkout Shield: Unauthorized Card Capture Blocked</span>
                    </div>
                    <button
                      onClick={() => setShowSimulatedCheckoutWarning(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This website does not use standard tokenized payment processors (Stripe, Apple Pay, PayPal). Payment form intercepts credit card CVV and billing address directly into an unverified offshore server.
                  </p>
                  <div className="pt-1 flex items-center space-x-2">
                    <button
                      onClick={onOpenReport}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Report Fraudulent Form
                    </button>
                    <button
                      onClick={onOpenDashboard}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                    >
                      Inspect Evidence
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. FLOATING ON-PAGE EXTENSION WIDGET */}
        {settings.showOnPageBadge && (
          <div className="sticky bottom-4 right-4 self-end z-20 m-4">
            <button
              onClick={() => setIsExtensionPopupOpen(true)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl shadow-xl border backdrop-blur-md transition-all cursor-pointer ${
                audit.trustScore >= 80
                  ? 'bg-slate-900/95 text-slate-200 border-emerald-500/40 hover:border-emerald-400'
                  : audit.trustScore >= 60
                  ? 'bg-slate-900/95 text-slate-200 border-amber-500/40 hover:border-amber-400'
                  : 'bg-slate-900/95 text-rose-300 border-rose-500/60 hover:border-rose-400'
              }`}
              title="VeriStore Active Page Protection"
            >
              <div
                className={`w-6 h-6 rounded-lg text-white flex items-center justify-center ${
                  audit.trustScore >= 80 ? 'bg-emerald-600' : audit.trustScore >= 60 ? 'bg-amber-600' : 'bg-rose-600'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="text-left pr-1">
                <div className="text-[10px] text-slate-400 font-semibold">
                  VeriStore Shield
                </div>
                <div className="text-xs font-mono font-bold flex items-center space-x-1">
                  <span>Score: {audit.trustScore}/100</span>
                  <span className="text-[10px] font-sans font-normal opacity-70">({statusColor.label})</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
