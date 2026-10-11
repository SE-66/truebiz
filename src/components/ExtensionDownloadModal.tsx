import React, { useState } from 'react';
import { X, Download, Code, Check, Chrome, Folder, FileCode, Copy } from 'lucide-react';

interface ExtensionDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionDownloadModal: React.FC<ExtensionDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFile, setActiveFile] = useState<'manifest' | 'background' | 'content' | 'popup'>('manifest');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files = {
    manifest: `{
  "manifest_version": 3,
  "name": "VeriStore TrustGuard - Store Authenticity & Anti-Phishing Shield",
  "version": "1.0.0",
  "description": "Proves store identity via real-time social scanning, cross-references reviews, and alerts against fake shopping clones.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon48.png"
  },
  "permissions": [
    "activeTab",
    "storage",
    "notifications",
    "declarativeNetRequest"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_idle"
    }
  ]
}`,
    background: `// VeriStore Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("VeriStore TrustGuard Extension Installed");
});

// Listen for tab updates to perform background reputation check
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    const domain = new URL(tab.url).hostname.replace(/^www\\./, '');
    
    // Call VeriStore Real-Time Verification API
    try {
      const response = await fetch("https://api.veristore-trustguard.app/api/verify-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url, domain })
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const score = result.data.trustScore;
        const badgeColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
        
        // Update Extension Badge
        chrome.action.setBadgeText({ tabId, text: String(score) });
        chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColor });
        
        // Trigger alert banner if suspicious
        if (score < 60) {
          chrome.tabs.sendMessage(tabId, {
            type: "VERISTORE_SHOW_SUSPICIOUS_ALERT",
            data: result.data
          });
        }
      }
    } catch (err) {
      console.warn("VeriStore background check error:", err);
    }
  }
});`,
    content: `// VeriStore Content Script: Injected into shopping pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VERISTORE_SHOW_SUSPICIOUS_ALERT") {
    displaySuspiciousBanner(message.data);
  }
});

function displaySuspiciousBanner(audit) {
  if (document.getElementById("veristore-alert-banner")) return;
  
  const banner = document.createElement("div");
  banner.id = "veristore-alert-banner";
  banner.style.cssText = \`
    position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
    background: #881337; color: #fff; padding: 14px 20px;
    font-family: system-ui, sans-serif; display: flex;
    justify-content: space-between; align-items: center;
    border-bottom: 3px solid #f43f5e; box-shadow: 0 4px 20px rgba(0,0,0,0.6);
  \`;
  banner.innerHTML = \`
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:24px;">⚠️</span>
      <div>
        <strong style="font-size:15px; text-transform:uppercase;">VeriStore Shield: Suspicious Store Detected!</strong>
        <p style="margin:2px 0 0 0; font-size:12px; color:#fecdd3;">
          This site scores \${audit.trustScore}/100. Exercise caution before entering credit card numbers.
        </p>
      </div>
    </div>
    <div style="display:flex; gap:8px;">
      <button id="veristore-report-btn" style="background:#e11d48; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:bold;">Report Phishing</button>
      <button id="veristore-close-btn" style="background:#334155; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">Dismiss</button>
    </div>
  \`;
  document.body.prepend(banner);
  
  document.getElementById("veristore-close-btn").onclick = () => banner.remove();
  document.getElementById("veristore-report-btn").onclick = () => {
    window.open("https://api.veristore-trustguard.app/?report=" + encodeURIComponent(window.location.hostname), "_blank");
  };
}`,
    popup: `<!-- VeriStore Chrome Extension Popup -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="styles.css">
  <title>VeriStore TrustGuard</title>
</head>
<body style="width:360px; margin:0; background:#0f172a; color:#fff; font-family:system-ui;">
  <div style="padding:16px;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0; font-size:16px; color:#38bdf8;">VeriStore TrustGuard</h3>
      <span id="trust-badge" style="padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold;">...</span>
    </div>
    <div style="text-align:center; padding:18px 0;">
      <div id="score-display" style="font-size:38px; font-weight:900;">--</div>
      <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Real-Time Trust Score</div>
    </div>
    <button id="open-dashboard-btn" style="width:100%; padding:10px; border-radius:8px; background:#4f46e5; color:#fff; font-weight:bold; border:none; cursor:pointer;">
      Open Full Reputation Hub
    </button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(files[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/90 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Browser Extension Integration (Manifest V3)</h2>
              <p className="text-xs text-slate-400">Production-ready source files to load in Chrome or Edge</p>
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
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <span>How to install into Google Chrome / Edge:</span>
            </div>
            <p className="text-indigo-300">
              1. Open <code className="px-1 py-0.5 rounded bg-indigo-900 font-mono text-white">chrome://extensions</code> in your browser.<br />
              2. Toggle on <strong>Developer Mode</strong> in the top-right corner.<br />
              3. Click <strong>Load Unpacked</strong> and select your extension directory with the files below.
            </p>
          </div>

          {/* File Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex space-x-2">
              {[
                { id: 'manifest', name: 'manifest.json' },
                { id: 'background', name: 'background.js' },
                { id: 'content', name: 'content.js' },
                { id: 'popup', name: 'popup.html' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    activeFile === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-72 select-all">
            {files[activeFile]}
          </pre>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/90 px-6 py-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
