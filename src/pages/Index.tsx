import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RiskForm from '@/components/RiskForm';
import RiskResult from '@/components/RiskResult';
import CompareOffers from '@/components/CompareOffers';
import ThemeToggle from '@/components/ThemeToggle';
import { extractTextFromPdf } from '@/utils/pdfExtractor';
import { analyzeRisk } from '@/utils/riskEngine';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [pdfText, setPdfText] = useState('');
  const [formDataState, setFormDataState] = useState<any>(null);

  const generateLocalExplanation = (riskResult: any) => {
    const { score, level, layers, redFlags } = riskResult;
    const lines: string[] = [];

    if (score === 0) {
      return "Based on the analysis, no significant risk indicators were found. The document appears to follow standard professional practices. However, always verify through independent sources.";
    }

    lines.push(`This offer letter has been assessed as ${level} with a score of ${score}/100.`);
    lines.push('');

    // Layer-wise summary
    for (const layer of layers) {
      if (layer.flags.length > 0) {
        lines.push(`${layer.name} (${layer.level}): ${layer.flags.map((f: any) => f.label).join(', ')}.`);
      }
    }
    lines.push('');

    if (redFlags.length > 0) {
      lines.push(`${redFlags.length} red flag(s) were identified across ${layers.filter((l: any) => l.flags.length > 0).length} integrity layers.`);
      lines.push('');
    }

    lines.push('Recommendation: Verify the company independently through official channels, LinkedIn profiles, and industry databases before proceeding.');

    return lines.join('\n');
  };

  const handleSubmit = async (formData: any, file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    setAiExplanation('');
    setFormDataState(formData);

    try {
      const text = await extractTextFromPdf(file);
      setPdfText(text);

      const riskResult = analyzeRisk({
        pdfText: text,
        hrEmail: formData.hrEmail,
        companyWebsite: formData.companyWebsite,
        hadInterview: formData.hadInterview,
        paymentRequested: formData.paymentRequested,
        interviewRounds: formData.interviewRounds,
      });

      setResult(riskResult);
      setIsAnalyzing(false);

      setIsLoadingAi(true);
      await new Promise((r) => setTimeout(r, 800));
      setAiExplanation(generateLocalExplanation(riskResult));
      setIsLoadingAi(false);
    } catch (err) {
      console.error('Analysis failed:', err);
      setIsAnalyzing(false);
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground font-serif">ProofPulse</h1>
            <p className="text-xs text-muted-foreground">4-Layer Offer Letter Risk Analyzer</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-2">
              Verify your offer letter
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Upload a job or internship offer letter for a structured 4-layer risk analysis covering identity, financial, process, and documentation integrity.
            </p>
          </div>

          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="analyze">Analyze Offer</TabsTrigger>
              <TabsTrigger value="compare">Compare Offers</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <RiskForm onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
              </div>

              {result && (
                <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-sm">
                  <RiskResult
                    result={result}
                    aiExplanation={aiExplanation}
                    isLoadingAi={isLoadingAi}
                    pdfText={pdfText}
                    formData={formDataState}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <CompareOffers />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            ProofPulse provides risk indicators only — it does not declare any offer as fake or real. Always verify through official channels.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
