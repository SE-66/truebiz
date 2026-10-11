export type TrustStatus = 'verified' | 'caution' | 'suspicious' | 'phishing';

export interface ScoreCategoryBreakdown {
  score: number;
  max: number;
  details: string;
  status: 'pass' | 'warning' | 'fail';
}

export interface SocialProfile {
  handle: string;
  followers?: number;
  verified: boolean;
  botFollowerRatio?: number;
  engagementRate?: string;
  matchStatus: 'verified' | 'unverified' | 'impersonation_risk' | 'not_found';
  lastActive?: string;
  pageTransparency?: string;
  adLibraryActiveAds?: number;
  creationDate?: string;
}

export interface ReviewSourceData {
  rating: number;
  count: number;
  claimStatus?: string;
  flaggedFakeReviewsPct?: number;
}

export interface ReviewsAnalysis {
  totalAggregatedReviews: number;
  averageRating: number;
  trustpilot: ReviewSourceData;
  googleReviews: ReviewSourceData;
  redditSentiment: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'severe_scam_warnings';
    mentionsCount: number;
    sampleDiscussions: string[];
  };
  bbbRating: string;
  fakeReviewDetectionPct: number;
  topComplaints: string[];
}

export interface DomainInfrastructure {
  domainAgeMonths: number;
  registeredDate: string;
  sslIssuer: string;
  sslValid: boolean;
  registrar: string;
  serverLocation: string;
  checkoutGateways: string[];
  isKnownTyposquat: boolean;
  contactAddressVerified: boolean;
}

export interface RiskFlag {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  explanation: string;
}

export interface HistoricalReputation {
  timeline: {
    date: string;
    score: number;
    event?: string;
  }[];
  incidentLog: {
    date: string;
    title: string;
    type: 'dispute_surge' | 'domain_transfer' | 'ssl_update' | 'phishing_report' | 'normal';
    description: string;
  }[];
  lifetimeDisputeRate: string;
}

export interface StoreAuditResult {
  domain: string;
  storeName: string;
  url: string;
  trustScore: number;
  status: TrustStatus;
  category: string;
  summary: string;
  scoreBreakdown: {
    socialFootprint: ScoreCategoryBreakdown;
    reviewAuthenticity: ScoreCategoryBreakdown;
    infrastructureTrust: ScoreCategoryBreakdown;
    phishingPaymentSafety: ScoreCategoryBreakdown;
  };
  socialMediaProfiles: {
    instagram: SocialProfile;
    tiktok: SocialProfile;
    facebook: SocialProfile;
    twitter: SocialProfile;
    socialSummary: string;
  };
  reviewsAnalysis: ReviewsAnalysis;
  domainInfrastructure: DomainInfrastructure;
  riskFlags: RiskFlag[];
  historicalReputation: HistoricalReputation;
  verifiedBadges: string[];
  scannedAt: string;
}

export interface PhishingReport {
  id: string;
  domain: string;
  url: string;
  phishingType: string;
  evidence: string;
  reportedAt: string;
  status: string;
  upvotes: number;
}

export interface SecuritySettings {
  alertSensitivity: 'high' | 'moderate' | 'relaxed';
  autoPopupOnSuspicious: boolean;
  blockUnsafeCheckout: boolean;
  minTrustScoreThreshold: number; // default: 60
  scanSocialsInRealtime: boolean;
  crossReferenceReviews: boolean;
  soundAlerts: boolean;
  trustedWhitelist: string[];
  showOnPageBadge: boolean;
}
