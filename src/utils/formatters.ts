export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'verified':
      return {
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        indicator: 'bg-emerald-400',
        label: 'Verified Legitimate',
        sublabel: 'Official brand entity with authenticated record',
      };
    case 'caution':
      return {
        badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        indicator: 'bg-amber-400',
        label: 'Exercise Caution',
        sublabel: 'Unverified brand presence or recent domain setup',
      };
    case 'suspicious':
      return {
        badgeBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        text: 'text-orange-400',
        bg: 'bg-orange-500',
        indicator: 'bg-orange-400',
        label: 'Suspicious Store',
        sublabel: 'Severe review discrepancies and clone indicators',
      };
    case 'phishing':
    default:
      return {
        badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        text: 'text-rose-400',
        bg: 'bg-rose-500',
        indicator: 'bg-rose-400',
        label: 'Phishing Threat',
        sublabel: 'Malicious clone harvesting payment or credentials',
      };
  }
}

export function getScoreGrade(score: number): { grade: string; color: string; desc: string } {
  if (score >= 90) return { grade: 'A+', color: 'text-emerald-400', desc: 'Highest Trust Standard' };
  if (score >= 80) return { grade: 'A', color: 'text-emerald-400', desc: 'Verified & Legitimate' };
  if (score >= 70) return { grade: 'B', color: 'text-blue-400', desc: 'Established Merchant' };
  if (score >= 55) return { grade: 'C', color: 'text-amber-400', desc: 'Caution Advised' };
  if (score >= 35) return { grade: 'D', color: 'text-orange-400', desc: 'Elevated Threat Risk' };
  return { grade: 'F', color: 'text-rose-400', desc: 'Active Scam / Phishing' };
}
