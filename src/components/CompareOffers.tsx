import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromPdf } from "@/utils/pdfExtractor";
import { analyzeRisk } from "@/utils/riskEngine";
import { checkGrammarAndProfessionalism } from "@/utils/grammarCheck";

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
          hrEmail: "",
          companyWebsite: "",
          hadInterview: true,
          paymentRequested: false,
          interviewRounds: 2,
        });
        const grammar = checkGrammarAndProfessionalism(text);
        return { ...risk, grammarScore: grammar.score };
      });
      setResults(analyzed);
    } catch (err) {
      console.error("Compare failed:", err);
    }

    setComparing(false);
  };

  const FileSlot = ({ index }: { index: number }) => (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Offer {index + 1}
      </p>

      {files[index] ? (
        <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-border bg-accent/50 p-3">
          <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="min-w-0 flex-1 break-all text-xs text-foreground">
            {files[index]!.name}
          </span>
          <button
            type="button"
            onClick={() => handleFile(index, null)}
            className="rounded p-0.5 hover:bg-muted"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/30">
          <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Upload PDF</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.type === "application/pdf") handleFile(index, f);
            }}
          />
        </label>
      )}

      {results[index] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 overflow-hidden rounded-lg border border-border bg-card p-3 text-center"
        >
          <div
            className={`text-2xl font-semibold ${
              results[index].score <= 30
                ? "text-risk-low"
                : results[index].score <= 60
                  ? "text-risk-medium"
                  : "text-risk-high"
            }`}
          >
            {results[index].score}
          </div>
          <div className="break-words text-xs text-muted-foreground">
            {results[index].level}
          </div>
          <div className="mt-1 break-words text-xs text-muted-foreground">
            Grammar: {results[index].grammarScore}/100
          </div>
          <div className="break-words text-xs text-muted-foreground">
            Flags: {results[index].redFlags.length}
          </div>
        </motion.div>
      )}
    </div>
  );

  const safer =
    results[0] && results[1]
      ? results[0].score < results[1].score
        ? "Offer 1"
        : results[0].score > results[1].score
          ? "Offer 2"
          : "Equal"
      : null;

  return (
    <div className="w-full overflow-hidden">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <GitCompare className="h-4 w-4" strokeWidth={1.5} />
        Compare Two Offers
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FileSlot index={0} />
        <FileSlot index={1} />
      </div>

      <Button
        onClick={handleCompare}
        disabled={!files[0] || !files[1] || comparing}
        className="mt-4 w-full"
        variant="secondary"
      >
        {comparing ? "Comparing..." : "Compare Offers"}
      </Button>

      {safer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-lg border border-border bg-accent/50 p-3 text-center"
        >
          <p className="break-words text-sm font-medium text-foreground">
            {safer === "Equal"
              ? "Both offers have equal risk."
              : `${safer} appears safer.`}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CompareOffers;
