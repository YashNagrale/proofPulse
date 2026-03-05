export interface GrammarResult {
  score: number; // 0-100
  issues: string[];
}

const TEMPLATE_PHRASES = [
  'dear candidate',
  'we are pleased to inform',
  'this is to certify',
  'congratulations you have been selected',
  'we are happy to offer',
];

const GRAMMAR_ISSUES_PATTERNS = [
  { regex: /\b(their|there|they're)\b.*\b(their|there|they're)\b/gi, issue: 'Possible there/their/they\'re confusion' },
  { regex: /[.!?]\s*[a-z]/g, issue: 'Sentences not properly capitalized' },
  { regex: /\b(ur|u r|plz|pls|thnx|thx|asap)\b/gi, issue: 'Informal/SMS language detected' },
  { regex: /[A-Z]{5,}/g, issue: 'Excessive use of CAPS' },
  { regex: /!{2,}/g, issue: 'Excessive exclamation marks' },
  { regex: /\s{3,}/g, issue: 'Irregular spacing' },
  { regex: /\b(kindly do the needful|please revert back|on urgent basis)\b/gi, issue: 'Overly informal phrasing' },
];

export function checkGrammarAndProfessionalism(pdfText: string): GrammarResult {
  const issues: string[] = [];
  let score = 100;

  // Check for template phrases
  const textLower = pdfText.toLowerCase();
  let templateCount = 0;
  TEMPLATE_PHRASES.forEach((phrase) => {
    if (textLower.includes(phrase)) templateCount++;
  });

  if (templateCount >= 3) {
    issues.push('Document appears to use a generic template');
    score -= 15;
  }

  // Check grammar patterns
  GRAMMAR_ISSUES_PATTERNS.forEach(({ regex, issue }) => {
    regex.lastIndex = 0;
    const matches = pdfText.match(regex);
    if (matches && matches.length > 0) {
      issues.push(`${issue} (${matches.length} instance${matches.length > 1 ? 's' : ''})`);
      score -= Math.min(matches.length * 5, 20);
    }
  });

  // Check document length (too short = suspicious)
  const wordCount = pdfText.split(/\s+/).length;
  if (wordCount < 50) {
    issues.push('Document is unusually short for an offer letter');
    score -= 20;
  }

  // Check for missing key sections
  const expectedSections = ['salary', 'position', 'date', 'dear', 'regards'];
  const missingSections = expectedSections.filter((s) => !textLower.includes(s));
  if (missingSections.length >= 3) {
    issues.push('Missing key offer letter sections (salary, position, date, etc.)');
    score -= 15;
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}
