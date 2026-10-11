import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ThumbsUp, Search, ExternalLink, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { PhishingReport } from '../types';

interface CommunityFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDomain: (domain: string) => void;
}

export const CommunityFeedModal: React.FC<CommunityFeedModalProps> = ({
  isOpen,
  onClose,
  onSelectDomain,
}) => {
  const [reports, setReports] = useState<PhishingReport[]>([]);
  const [stats, setStats] = useState<{ totalBlockedToday: number; activeThreatsIndexed: number; verifiedLegitimateStores: number }>({
    totalBlockedToday: 1420,
    activeThreatsIndexed: 48920,
    verifiedLegitimateStores: 184500,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.reports) setReports(data.reports);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/report-phishing/${id}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.report) {
        setReports(reports.map((r) => (r.id === id ? data.report : r)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filtered = reports.filter(
    (r) =>
      r.domain.toLowerCase().includes(search.toLowerCase()) ||
      r.phishingType.toLowerCase().includes(search.toLowerCase()) ||
      r.evidence.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/90 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Global Anti-Phishing Blacklist & Threat Feed</h2>
              <p className="text-xs text-slate-400">Crowdsourced consumer security radar & active scam alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 bg-slate-850 border-b border-slate-800 py-3 px-6 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Threats Blocked Today</div>
            <div className="text-base font-black text-rose-400 font-mono mt-0.5">
              {stats.totalBlockedToday.toLocaleString()}
            </div>
          </div>
          <div className="border-x border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Active Blacklisted Sites</div>
            <div className="text-base font-black text-amber-400 font-mono mt-0.5">
              {stats.activeThreatsIndexed.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Verified Safe Stores</div>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
              {stats.verifiedLegitimateStores.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blacklisted domain, scam type, or keywords..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading threat intelligence feed...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No matching phishing reports found.</div>
          ) : (
            filtered.map((rep) => (
              <div
                key={rep.id}
                onClick={() => {
                  onSelectDomain(rep.domain);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono font-bold text-white text-sm">{rep.domain}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase font-bold">
                      {rep.phishingType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleUpvote(rep.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Confirm / Upvote this threat report"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-rose-400" />
                      <span>{rep.upvotes}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rep.reportedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-4">
                  "{rep.evidence}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 pl-4">
                  <span className="text-rose-400 font-medium">Status: Confirmed Threat Vector</span>
                  <span className="text-indigo-400 hover:underline flex items-center gap-1">
                    <span>Inspect In Browser</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
