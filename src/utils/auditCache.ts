import { StoreAuditResult } from '../types';

const CACHE_STORAGE_KEY = 'veristore_audit_cache_v1';
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface CachedAuditItem {
  domain: string;
  data: StoreAuditResult;
  cachedAt: number;
  expiresAt: number;
}

export function cleanDomain(inputUrl: string): string {
  try {
    let clean = inputUrl.trim().toLowerCase();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    let hostname = parsed.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return inputUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim().toLowerCase();
  }
}

/**
 * Retrieve all cache records from localStorage
 */
function getAllCacheRecords(): Record<string, CachedAuditItem> {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse audit cache from localStorage:', err);
    return {};
  }
}

/**
 * Save all cache records to localStorage safely
 */
function saveAllCacheRecords(records: Record<string, CachedAuditItem>): boolean {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (err: any) {
    // If QuotaExceededError, prune older entries and retry
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      const keys = Object.keys(records);
      if (keys.length > 5) {
        // Sort by cachedAt ascending and remove oldest half
        const sorted = keys.sort((a, b) => records[a].cachedAt - records[b].cachedAt);
        const pruned = { ...records };
        for (let i = 0; i < Math.floor(keys.length / 2); i++) {
          delete pruned[sorted[i]];
        }
        try {
          localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(pruned));
          return true;
        } catch {
          return false;
        }
      }
    }
    console.warn('Failed to write audit cache to localStorage:', err);
    return false;
  }
}

/**
 * Get cached audit for a given domain/URL if it exists and has not expired
 */
export function getCachedAudit(domainOrUrl: string): { data: StoreAuditResult; cachedAt: number } | null {
  const domain = cleanDomain(domainOrUrl);
  if (!domain) return null;

  const records = getAllCacheRecords();
  const item = records[domain];

  if (!item) return null;

  const now = Date.now();
  if (now > item.expiresAt) {
    // Expired - clean it up lazily
    delete records[domain];
    saveAllCacheRecords(records);
    return null;
  }

  return {
    data: item.data,
    cachedAt: item.cachedAt,
  };
}

/**
 * Cache an audit result in localStorage with specified TTL
 */
export function setCachedAudit(
  domainOrUrl: string,
  data: StoreAuditResult,
  ttlMs = DEFAULT_TTL_MS
): void {
  const domain = cleanDomain(domainOrUrl || data.domain);
  if (!domain || !data) return;

  const records = getAllCacheRecords();
  const now = Date.now();

  records[domain] = {
    domain,
    data,
    cachedAt: now,
    expiresAt: now + ttlMs,
  };

  saveAllCacheRecords(records);
}

/**
 * Invalidate a single domain or all cache records
 */
export function invalidateAuditCache(domainOrUrl?: string): void {
  if (!domainOrUrl) {
    localStorage.removeItem(CACHE_STORAGE_KEY);
    return;
  }

  const domain = cleanDomain(domainOrUrl);
  const records = getAllCacheRecords();
  if (records[domain]) {
    delete records[domain];
    saveAllCacheRecords(records);
  }
}

/**
 * Get human-readable statistics about the local audit cache
 */
export function getCacheStats(): { count: number; domains: string[]; oldestCachedAt: number | null } {
  const records = getAllCacheRecords();
  const keys = Object.keys(records);
  const now = Date.now();

  const validDomains = keys.filter((k) => records[k].expiresAt > now);
  const oldest = validDomains.length > 0
    ? Math.min(...validDomains.map((k) => records[k].cachedAt))
    : null;

  return {
    count: validDomains.length,
    domains: validDomains,
    oldestCachedAt: oldest,
  };
}
