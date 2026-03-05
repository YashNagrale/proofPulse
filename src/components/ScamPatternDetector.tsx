import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const SCAM_PATTERNS = [
  {
    id: 'registration-fee',
    name: 'Registration Fee Scam',
    keywords: ['registration fee', 'processing charge', 'application fee'],
    description: 'Scammers ask for upfront fees disguised as registration or processing charges.',
  },
  {
    id: 'security-deposit',
    name: 'Security Deposit Scam',
    keywords: ['security deposit', 'refundable deposit', 'caution money'],
    description: 'Fraudsters demand deposits claiming they will be refunded after joining.',
  },
  {
    id: 'training-fee',
    name: 'Training Fee Scam',
    keywords: ['training fee', 'training cost', 'certification fee', 'bond amount'],
    description: 'Fake companies charge for mandatory training that never materializes.',
  },
  {
    id: 'urgency',
    name: 'Urgency Pressure Scam',
    keywords: ['limited slots', 'act now', 'urgent', 'immediately', 'last date'],
    description: 'Scammers create artificial urgency to prevent victims from verifying.',
  },
  {
    id: 'too-good',
    name: 'Too Good To Be True',
    keywords: ['guaranteed placement', 'no experience required', 'guaranteed job', 'easy money'],
    description: 'Offers promising unrealistic benefits with no qualifications needed.',
  },
];

const ScamPatternDetector = ({ pdfText }: { pdfText: string }) => {
  const textLower = pdfText.toLowerCase();
  const matchedPatterns = SCAM_PATTERNS.filter((pattern) =>
    pattern.keywords.some((kw) => textLower.includes(kw))
  );

  if (matchedPatterns.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
        Scam Pattern Matches
      </h3>
      <div className="space-y-2">
        {matchedPatterns.map((pattern, i) => (
          <motion.div
            key={pattern.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="p-3 rounded-lg bg-risk-high/10 border border-risk-high/20"
          >
            <p className="text-sm font-medium text-foreground">⚠ {pattern.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{pattern.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ScamPatternDetector;
