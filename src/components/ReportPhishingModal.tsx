import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle, ShieldAlert, Upload, Send } from 'lucide-react';
import { PhishingReport } from '../types';

interface ReportPhishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
  initialUrl?: string;
  onReportSuccess: (report: PhishingReport) => void;
}

export const ReportPhishingModal: React.FC<ReportPhishingModalProps> = ({
  isOpen,
  onClose,
  initialDomain = '',
  initialUrl = '',
  onReportSuccess,
}) => {
  const [domain, setDomain] = useState(initialDomain);
  const [url, setUrl] = useState(initialUrl);
  const [phishingType, setPhishingType] = useState('fake_payment_gateway');
  const [evidence, setEvidence] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setErrorMessage('Please provide the domain name.');
      return;
    }
    if (!evidence.trim()) {
      setErrorMessage('Please provide details or evidence of the suspicious activity.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/report-phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          url: url.trim() || `https://${domain.trim()}`,
          phishingType,
          evidence: evidence.trim(),
          reporterEmail: reporterEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setSubmitted(true);
        onReportSuccess(data.report);
      } else {
        setErrorMessage(data.error || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/90 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Report Phishing & Scam Store</h2>
              <p className="text-xs text-slate-400">Directly flag dangerous sites to protect online shoppers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-white">Report Filed Successfully!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Thank you for contributing to community safety. Your report on <span className="font-mono text-rose-300 font-semibold">{domain}</span> has been broadcast to the global anti-phishing registry and real-time defense feed.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Suspicious Domain <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. nikes-flash-superoutlet.shop"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Exact Page URL (Optional)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Threat Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={phishingType}
                onChange={(e) => setPhishingType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="fake_payment_gateway">Fake Payment Gateway (Card Skimming / Theft)</option>
                <option value="counterfeit_brand">Brand Impersonation / Typosquatting Clone</option>
                <option value="credential_theft">Credential Harvesting (Fake Login / OTP Theft)</option>
                <option value="non_delivery">Non-Delivery Fraud / Fake Tracking Numbers</option>
                <option value="other_scam">Other E-Commerce Fraud</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Evidence & Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Describe what occurred: e.g. 'Redirected to suspicious checkout asking for CVV twice, fake social media links in footer, Reddit users complaining about non-delivery.'"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Email (Optional, for investigation updates)
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="shopper@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold flex items-center space-x-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting Threat Report...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Threat Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
