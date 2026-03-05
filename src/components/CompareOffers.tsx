import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Shield, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractTextFromPdf } from '@/utils/pdfExtractor';
import { analyzeRisk } from '@/utils/riskEngine';
import { checkGrammarAndProfessionalism } from '@/utils/grammarCheck';

const CompareOffers = () => {
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const [results, setResults] = useState<any[]>([null, null]);
  const [comparing, setComparing] = useState(false);

  const handleFile = (index: number, file: File | null) => {
    const next = [...files];
    next[index] = file;
    setFiles(next);
  };

  const handleCompare = async () => {
    if (!files[0] || !files[1]) return;
    setComparing(true);

    try {
      const texts = await Promise.all(files.map((f) => extractTextFromPdf(f!)));
      const analyzed = texts.map((text) => {
        const risk = analyzeRisk({
          pdfText: text,
          hrEmail: '',
          companyWebsite: '',
          hadInterview: true,
          paymentRequested: false,
          interviewRounds: 2,
        });
        const grammar = checkGrammarAndProfessionalism(text);
        return { ...risk, grammarScore: grammar.score };
      });
      setResults(analyzed);
    } catch (err) {
      console.error('Compare failed:', err);
    }
    setComparing(false);
  };

  const FileSlot = ({ index }: { index: number }) => (
    <div className="flex-1">
      <p className="text-xs font-medium text-muted-foreground mb-2">Offer {index + 1}</p>
      {files[index] ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-border">
          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs text-foreground truncate flex-1">{files[index]!.name}</span>
          <button onClick={() => handleFile(index, null)} className="p-0.5 hover:bg-muted rounded">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-colors">
          <Upload className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Upload PDF</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.type === 'application/pdf') handleFile(index, f);
            }}
          />
        </label>
      )}

      {results[index] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-lg bg-card border border-border text-center"
        >
          <div className={`text-2xl font-semibold ${
            results[index].score <= 30 ? 'text-risk-low' :
            results[index].score <= 60 ? 'text-risk-medium' : 'text-risk-high'
          }`}>
            {results[index].score}
          </div>
          <div className="text-xs text-muted-foreground">{results[index].level}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Grammar: {results[index].grammarScore}/100
          </div>
          <div className="text-xs text-muted-foreground">
            Flags: {results[index].redFlags.length}
          </div>
        </motion.div>
      )}
    </div>
  );

  const safer = results[0] && results[1]
    ? results[0].score < results[1].score ? 'Offer 1' : results[0].score > results[1].score ? 'Offer 2' : 'Equal'
    : null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <GitCompare className="w-4 h-4" strokeWidth={1.5} />
        Compare Two Offers
      </h3>

      <div className="flex gap-4">
        <FileSlot index={0} />
        <FileSlot index={1} />
      </div>

      <Button
        onClick={handleCompare}
        disabled={!files[0] || !files[1] || comparing}
        className="w-full mt-4"
        variant="secondary"
      >
        {comparing ? 'Comparing...' : 'Compare Offers'}
      </Button>

      {safer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 rounded-lg bg-accent/50 border border-border text-center"
        >
          <p className="text-sm font-medium text-foreground">
            {safer === 'Equal' ? '⚖️ Both offers have equal risk.' : `✅ ${safer} appears safer.`}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CompareOffers;
