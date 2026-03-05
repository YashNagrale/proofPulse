import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle, ShieldAlert, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RiskBreakdownChart from './RiskBreakdownChart';
import LayerBreakdown from './LayerBreakdown';
import ScamPatternDetector from './ScamPatternDetector';
import AutoReplyGenerator from './AutoReplyGenerator';
import ReportScamButton from './ReportScamButton';
import { generateReportText, downloadReport } from '@/utils/reportGenerator';

const severityIcon = {
  low: <CheckCircle className="w-4 h-4 text-risk-low flex-shrink-0" />,
  medium: <AlertTriangle className="w-4 h-4 text-risk-medium flex-shrink-0" />,
  high: <AlertCircle className="w-4 h-4 text-risk-high flex-shrink-0" />,
};

const RiskResult = ({ result, aiExplanation, isLoadingAi, pdfText, formData }: any) => {
  const { score, level, redFlags, layers } = result;

  const ringColor =
    score <= 30 ? 'text-risk-low' : score <= 60 ? 'text-risk-medium' : 'text-risk-high';

  const bgColor =
    score <= 30
      ? 'bg-risk-low/10 border-risk-low/20'
      : score <= 60
        ? 'bg-risk-medium/10 border-risk-medium/20'
        : 'bg-risk-high/10 border-risk-high/20';

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  const handleDownload = () => {
    const text = generateReportText(result, formData, pdfText);
    downloadReport(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Score Display */}
      <div className="flex flex-col items-center py-6">
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              className={ringColor}
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-foreground font-sans">{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${bgColor}`}>
          <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
          {level}
        </span>
      </div>

      {/* 4-Layer Breakdown */}
      <LayerBreakdown layers={layers} />

      {/* Weighted Chart */}
      <RiskBreakdownChart layers={layers} />

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            All Detected Red Flags ({redFlags.length})
          </h3>
          <div className="space-y-2">
            {redFlags.map((flag: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/40 border border-border"
              >
                {severityIcon[flag.severity as keyof typeof severityIcon]}
                <div>
                  <p className="text-sm font-medium text-foreground">{flag.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{flag.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {redFlags.length === 0 && (
        <div className="text-center p-4 rounded-lg bg-accent/30">
          <CheckCircle className="w-6 h-6 text-risk-low mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">No red flags detected</p>
          <p className="text-xs text-muted-foreground mt-1">The offer appears to be legitimate based on our checks.</p>
        </div>
      )}

      {/* Scam Pattern Detection */}
      {pdfText && <ScamPatternDetector pdfText={pdfText} />}

      {/* AI Explanation */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          AI Analysis
        </h3>
        <div className="p-4 rounded-lg bg-accent/30 border border-border">
          {isLoadingAi ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Generating explanation...
            </div>
          ) : aiExplanation ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">AI analysis will appear here after processing.</p>
          )}
        </div>
      </div>

      {/* Auto Reply Generator */}
      <AutoReplyGenerator riskLevel={level} companyName={formData?.companyWebsite || ''} />

      {/* Download Report */}
      <Button onClick={handleDownload} variant="outline" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download Risk Report
      </Button>

      {/* Report Scam */}
      {score > 60 && <ReportScamButton />}
    </motion.div>
  );
};

export default RiskResult;
