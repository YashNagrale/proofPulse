export interface RiskInput {
  pdfText: string;
  hrEmail: string;
  companyWebsite: string;
  hadInterview: boolean;
  paymentRequested: boolean;
  interviewRounds: number;
}

export interface RedFlag {
  label: string;
  severity: 'low' | 'medium' | 'high';
  detail: string;
  layer: 'identity' | 'financial' | 'process' | 'documentation';
}

export interface LayerResult {
  name: string;
  key: 'identity' | 'financial' | 'process' | 'documentation';
  weight: number;
  score: number; // 0-100 raw score for this layer
  weightedScore: number; // score * weight
  level: 'Strong' | 'Moderate' | 'Weak';
  flags: RedFlag[];
}

export interface RiskResult {
  score: number;
  level: 'Low Risk' | 'Medium Risk' | 'High Risk';
  redFlags: RedFlag[];
  layers: LayerResult[];
}

const FREE_PROVIDERS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com', 'rediffmail.com'];

function extractDomain(input: string) {
  try {
    let url = input.trim().toLowerCase();
    if (!url.startsWith('http')) url = 'https://' + url;
    const hostname = new URL(url).hostname;
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return input.toLowerCase().replace(/^www\./, '');
  }
}

function extractEmailDomain(email: string) {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return '';
  return parts[1].split('.').slice(-2).join('.');
}

// ─── Layer 1: Identity Integrity (40%) ───
function analyzeIdentity(input: RiskInput): LayerResult {
  let score = 0;
  const flags: RedFlag[] = [];

  const emailDomain = input.hrEmail ? extractEmailDomain(input.hrEmail) : '';
  const websiteDomain = input.companyWebsite ? extractDomain(input.companyWebsite) : '';

  // Email-domain mismatch
  if (emailDomain && websiteDomain && emailDomain !== websiteDomain) {
    score += 35;
    flags.push({
      label: 'Email-domain mismatch',
      severity: 'high',
      detail: `HR email domain (${emailDomain}) does not match company website (${websiteDomain}).`,
      layer: 'identity',
    });
  }

  // Free email provider
  if (emailDomain && FREE_PROVIDERS.includes(emailDomain)) {
    score += 30;
    flags.push({
      label: 'Free email provider used',
      severity: 'medium',
      detail: `HR is using a free email provider (${emailDomain}) instead of a corporate domain.`,
      layer: 'identity',
    });
  }

  // No email provided
  if (!input.hrEmail.trim()) {
    score += 15;
    flags.push({
      label: 'No HR email provided',
      severity: 'low',
      detail: 'Unable to verify identity without an HR contact email.',
      layer: 'identity',
    });
  }

  // No website provided
  if (!input.companyWebsite.trim()) {
    score += 20;
    flags.push({
      label: 'No company website provided',
      severity: 'medium',
      detail: 'Legitimate companies typically have an online presence.',
      layer: 'identity',
    });
  }

  score = Math.min(100, score);
  const level = score <= 30 ? 'Strong' : score <= 60 ? 'Moderate' : 'Weak';

  return { name: 'Identity Integrity', key: 'identity', weight: 0.4, score, weightedScore: Math.round(score * 0.4), level, flags };
}

// ─── Layer 2: Financial Integrity (30%) ───
function analyzeFinancial(input: RiskInput): LayerResult {
  let score = 0;
  const flags: RedFlag[] = [];
  const textLower = input.pdfText.toLowerCase();

  // Payment requested via form
  if (input.paymentRequested) {
    score += 50;
    flags.push({
      label: 'Payment requested before joining',
      severity: 'high',
      detail: 'Legitimate employers never ask candidates to pay fees for employment.',
      layer: 'financial',
    });
  }

  // Financial keywords in document
  const financialKeywords = [
    { keyword: 'registration fee', weight: 20 },
    { keyword: 'processing charge', weight: 20 },
    { keyword: 'security deposit', weight: 25 },
    { keyword: 'training fee', weight: 15 },
    { keyword: 'bond amount', weight: 10 },
    { keyword: 'caution money', weight: 20 },
    { keyword: 'refundable deposit', weight: 15 },
    { keyword: 'urgent payment', weight: 25 },
    { keyword: 'pay before', weight: 20 },
    { keyword: 'bank transfer', weight: 10 },
  ];

  for (const { keyword, weight } of financialKeywords) {
    if (textLower.includes(keyword)) {
      score += weight;
      flags.push({
        label: `Suspicious financial term: "${keyword}"`,
        severity: weight >= 20 ? 'high' : 'medium',
        detail: `The document contains "${keyword}" which is commonly found in fraudulent offers.`,
        layer: 'financial',
      });
    }
  }

  // No refund clarity when payment mentioned
  if (input.paymentRequested && !textLower.includes('refund')) {
    score += 10;
    flags.push({
      label: 'No refund policy mentioned',
      severity: 'medium',
      detail: 'Payment is requested but no refund terms are specified.',
      layer: 'financial',
    });
  }

  score = Math.min(100, score);
  const level = score <= 30 ? 'Strong' : score <= 60 ? 'Moderate' : 'Weak';

  return { name: 'Financial Integrity', key: 'financial', weight: 0.3, score, weightedScore: Math.round(score * 0.3), level, flags };
}

// ─── Layer 3: Process Integrity (20%) ───
function analyzeProcess(input: RiskInput): LayerResult {
  let score = 0;
  const flags: RedFlag[] = [];
  const textLower = input.pdfText.toLowerCase();

  // No interview
  if (!input.hadInterview) {
    score += 40;
    flags.push({
      label: 'No interview conducted',
      severity: 'high',
      detail: 'Legitimate companies conduct at least one interview before extending offers.',
      layer: 'process',
    });
  }

  // Only 1 round (instant selection)
  if (input.hadInterview && input.interviewRounds <= 1) {
    score += 20;
    flags.push({
      label: 'Only 1 interview round',
      severity: 'medium',
      detail: 'Most legitimate hiring involves multiple evaluation rounds.',
      layer: 'process',
    });
  }

  // Urgency keywords
  const urgencyKeywords = ['limited slots', 'act now', 'immediately', 'last date', 'urgent'];
  for (const kw of urgencyKeywords) {
    if (textLower.includes(kw)) {
      score += 10;
      flags.push({
        label: `Urgency pressure: "${kw}"`,
        severity: 'medium',
        detail: 'Artificial urgency is a common tactic to prevent verification.',
        layer: 'process',
      });
    }
  }

  // Unrealistic promises
  const unrealisticKeywords = ['guaranteed placement', 'guaranteed job', 'no experience required', 'easy money'];
  for (const kw of unrealisticKeywords) {
    if (textLower.includes(kw)) {
      score += 15;
      flags.push({
        label: `Unrealistic promise: "${kw}"`,
        severity: 'medium',
        detail: 'Offers promising guarantees with no requirements are suspicious.',
        layer: 'process',
      });
    }
  }

  // WhatsApp only communication
  if (textLower.includes('whatsapp') && !textLower.includes('email')) {
    score += 15;
    flags.push({
      label: 'WhatsApp-only communication',
      severity: 'medium',
      detail: 'Professional hiring typically uses official email, not just WhatsApp.',
      layer: 'process',
    });
  }

  score = Math.min(100, score);
  const level = score <= 30 ? 'Strong' : score <= 60 ? 'Moderate' : 'Weak';

  return { name: 'Process Integrity', key: 'process', weight: 0.2, score, weightedScore: Math.round(score * 0.2), level, flags };
}

// ─── Layer 4: Documentation Integrity (10%) ───
function analyzeDocumentation(input: RiskInput): LayerResult {
  let score = 0;
  const flags: RedFlag[] = [];
  const textLower = input.pdfText.toLowerCase();
  const wordCount = input.pdfText.split(/\s+/).length;

  // Generic template phrases
  const templatePhrases = ['dear candidate', 'congratulations you have been selected', 'we are pleased to inform', 'this is to certify'];
  let templateHits = 0;
  for (const phrase of templatePhrases) {
    if (textLower.includes(phrase)) templateHits++;
  }
  if (templateHits >= 2) {
    score += 25;
    flags.push({
      label: 'Generic template detected',
      severity: 'medium',
      detail: 'The document uses common template-style wording found in mass-produced fake offers.',
      layer: 'documentation',
    });
  }

  // Missing key sections
  const expectedSections = ['salary', 'position', 'date', 'regards', 'address'];
  const missing = expectedSections.filter(s => !textLower.includes(s));
  if (missing.length >= 3) {
    score += 20;
    flags.push({
      label: 'Missing key sections',
      severity: 'medium',
      detail: `Offer letter is missing typical sections: ${missing.join(', ')}.`,
      layer: 'documentation',
    });
  }

  // Very short document
  if (wordCount < 50) {
    score += 25;
    flags.push({
      label: 'Unusually short document',
      severity: 'medium',
      detail: 'The document is very short for an offer letter, suggesting incomplete or fake content.',
      layer: 'documentation',
    });
  }

  // Grammar/informal language
  const informalPatterns = [
    { regex: /\b(ur|u r|plz|pls|thnx|thx)\b/gi, issue: 'Informal/SMS language' },
    { regex: /[A-Z]{5,}/g, issue: 'Excessive CAPS usage' },
    { regex: /!{2,}/g, issue: 'Excessive exclamation marks' },
    { regex: /\b(kindly do the needful|please revert back|on urgent basis)\b/gi, issue: 'Unprofessional phrasing' },
  ];

  for (const { regex, issue } of informalPatterns) {
    regex.lastIndex = 0;
    const matches = input.pdfText.match(regex);
    if (matches && matches.length > 0) {
      score += 10;
      flags.push({
        label: issue,
        severity: 'low',
        detail: `Found ${matches.length} instance(s) of ${issue.toLowerCase()} in the document.`,
        layer: 'documentation',
      });
    }
  }

  score = Math.min(100, score);
  const level = score <= 30 ? 'Strong' : score <= 60 ? 'Moderate' : 'Weak';

  return { name: 'Documentation Integrity', key: 'documentation', weight: 0.1, score, weightedScore: Math.round(score * 0.1), level, flags };
}

// ─── Main Analysis ───
export function analyzeRisk(input: RiskInput): RiskResult {
  const layers = [
    analyzeIdentity(input),
    analyzeFinancial(input),
    analyzeProcess(input),
    analyzeDocumentation(input),
  ];

  const score = Math.min(100, layers.reduce((sum, l) => sum + l.weightedScore, 0));
  const redFlags = layers.flatMap(l => l.flags);
  const level = score <= 30 ? 'Low Risk' : score <= 60 ? 'Medium Risk' : 'High Risk';

  return { score, level, redFlags, layers };
}
