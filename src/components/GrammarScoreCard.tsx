import { FileWarning } from 'lucide-react';

const GrammarScoreCard = ({ score, issues }: { score: number; issues: string[] }) => {
  const color = score >= 70 ? 'text-risk-low' : score >= 40 ? 'text-risk-medium' : 'text-risk-high';
  const bg = score >= 70 ? 'bg-risk-low/10' : score >= 40 ? 'bg-risk-medium/10' : 'bg-risk-high/10';

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <FileWarning className="w-4 h-4" strokeWidth={1.5} />
        Professionalism Score
      </h3>
      <div className={`p-4 rounded-lg ${bg} border border-border`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-2xl font-semibold ${color}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
          <span className={`text-xs font-medium ${color} ml-auto`}>
            {score >= 70 ? 'Professional' : score >= 40 ? 'Questionable' : 'Poor Quality'}
          </span>
        </div>
        {issues.length > 0 && (
          <ul className="space-y-1">
            {issues.map((issue, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="mt-0.5">•</span>
                {issue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GrammarScoreCard;
