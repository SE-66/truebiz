import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, Bell, Check, Trash2, Plus, Lock, Eye, AlertOctagon, Database, RotateCcw } from 'lucide-react';
import { SecuritySettings } from '../types';
import { getCacheStats, invalidateAuditCache } from '../utils/auditCache';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SecuritySettings;
  onUpdateSettings: (newSettings: SecuritySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [current, setCurrent] = useState<SecuritySettings>({ ...settings });
  const [newDomain, setNewDomain] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [cacheStats, setCacheStats] = useState(() => getCacheStats());

  useEffect(() => {
    if (isOpen) {
      setCacheStats(getCacheStats());
    }
  }, [isOpen]);

  const handleClearCache = () => {
    invalidateAuditCache();
    setCacheStats(getCacheStats());
  };

  const handleSave = () => {
    onUpdateSettings(current);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    if (clean && !current.trustedWhitelist.includes(clean)) {
      setCurrent({
        ...current,
        trustedWhitelist: [...current.trustedWhitelist, clean],
      });
      setNewDomain('');
    }
  };

  const handleRemoveWhitelist = (domain: string) => {
    setCurrent({
      ...current,
      trustedWhitelist: current.trustedWhitelist.filter((d) => d !== domain),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Extension Security Preferences</h2>
              <p className="text-xs text-slate-400">Configure real-time shopping defense & alert triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* Sensitivity Setting */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Alert Sensitivity Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'high',
                  name: 'Strict / High',
                  desc: 'Alert on any score < 75 or new domains',
                },
                {
                  id: 'moderate',
                  name: 'Balanced',
                  desc: 'Alert on scores < 60 (Recommended)',
                },
                {
                  id: 'relaxed',
                  name: 'Relaxed',
                  desc: 'Only block severe phishing < 35',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCurrent({ ...current, alertSensitivity: opt.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    current.alertSensitivity === opt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{opt.name}</span>
                    {current.alertSensitivity === opt.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Trust Score Slider */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Minimum Safe Trust Threshold</div>
                <div className="text-xs text-slate-400">Stores scoring below this will trigger instant alerts</div>
              </div>
              <div className="text-lg font-black font-mono text-indigo-400 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                {current.minTrustScoreThreshold}/100
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="85"
              step="5"
              value={current.minTrustScoreThreshold}
              onChange={(e) =>
                setCurrent({ ...current, minTrustScoreThreshold: parseInt(e.target.value, 10) })
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20 (Very Permissive)</span>
              <span>55 (Standard)</span>
              <span>85 (Ultra-Strict)</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Protective Automation Controls
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'autoPopupOnSuspicious',
                  title: 'Instant Pop-up Alert on Suspicious Stores',
                  desc: 'Displays prominent blocker banner when entering a suspicious domain',
                  icon: AlertOctagon,
                  val: current.autoPopupOnSuspicious,
                },
                {
                  id: 'blockUnsafeCheckout',
                  title: 'Highlight & Flag Unsafe Payment Gateways',
                  desc: 'Warn before submitting credit card information on non-tokenized processors',
                  icon: Lock,
                  val: current.blockUnsafeCheckout,
                },
                {
                  id: 'scanSocialsInRealtime',
                  title: 'Real-Time Social Media Cross-Check',
                  desc: 'Cross-verifies Instagram, TikTok, and Meta Ad Library authenticity',
                  icon: Eye,
                  val: current.scanSocialsInRealtime,
                },
                {
                  id: 'crossReferenceReviews',
                  title: 'Cross-Reference Review Aggregation',
                  desc: 'Scans Trustpilot, Google, BBB, and Reddit scam communities',
                  icon: Shield,
                  val: current.crossReferenceReviews,
                },
                {
                  id: 'soundAlerts',
                  title: 'Audio Alert on Critical Threat',
                  desc: 'Play a discreet warning chime when high-risk phishing is detected',
                  icon: Bell,
                  val: current.soundAlerts,
                },
                {
                  id: 'showOnPageBadge',
                  title: 'Display Floating Trust Badge on Shopping Pages',
                  desc: 'Pins a discrete trust score widget directly onto product and checkout pages',
                  icon: Shield,
                  val: current.showOnPageBadge,
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <label
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3 pr-3">
                      <div className="p-1.5 rounded-lg bg-slate-700/50 text-slate-300 mt-0.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) =>
                        setCurrent({ ...current, [item.id]: e.target.checked } as any)
                      }
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Trusted Whitelist */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trusted Domains Whitelist ({current.trustedWhitelist.length})
            </div>
            <p className="text-xs text-slate-400">
              Domains on this list will always be trusted and bypass pop-up warnings.
            </p>

            <form onSubmit={handleAddWhitelist} className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. yourfavoriteshop.com"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-800/30 rounded-xl border border-slate-800">
              {current.trustedWhitelist.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700"
                >
                  <span>{domain}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWhitelist(domain)}
                    className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Remove domain"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* LocalStorage Cache Management */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>LocalStorage Audit Cache</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Stores verified domain audits locally to eliminate redundant network roundtrips.
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {cacheStats.count} Cached
              </span>
            </div>

            {cacheStats.domains.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {cacheStats.domains.map((dom) => (
                    <span key={dom} className="text-[10px] font-mono text-slate-300 bg-slate-850 px-2 py-0.5 rounded border border-slate-750">
                      {dom}
                    </span>
                  ))}
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Cache auto-expires after 2 hours.
                  </span>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Cached Audits</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic">
                No store audits currently cached in localStorage.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur px-6 py-4 border-t border-slate-700 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-950/40 cursor-pointer transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
