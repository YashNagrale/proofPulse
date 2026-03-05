import { motion } from 'framer-motion';
import { Shield, DollarSign, ClipboardList, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const layerIcons = {
  identity: Shield,
  financial: DollarSign,
  process: ClipboardList,
  documentation: FileText,
};

const LayerBreakdown = ({ layers }: { layers: any[] }) => {
  if (!layers || layers.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">4-Layer Risk Breakdown</h3>
      <div className="space-y-4">
        {layers.map((layer, i) => {
          const Icon = layerIcons[layer.key as keyof typeof layerIcons] || Shield;
          const levelColor =
            layer.level === 'Strong'
              ? 'text-risk-low bg-risk-low/10 border-risk-low/20'
              : layer.level === 'Moderate'
                ? 'text-risk-medium bg-risk-medium/10 border-risk-medium/20'
                : 'text-risk-high bg-risk-high/10 border-risk-high/20';

          const barColor =
            layer.score <= 30
              ? '[&>div]:bg-[hsl(var(--risk-low))]'
              : layer.score <= 60
                ? '[&>div]:bg-[hsl(var(--risk-medium))]'
                : '[&>div]:bg-[hsl(var(--risk-high))]';

          return (
            <motion.div
              key={layer.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-4 rounded-lg bg-accent/30 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-foreground">{layer.name}</span>
                  <span className="text-xs text-muted-foreground">({Math.round(layer.weight * 100)}% weight)</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${levelColor}`}>
                  {layer.level}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={layer.score} className={`h-2 flex-1 ${barColor}`} />
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">{layer.score}/100</span>
              </div>
              {layer.flags.length > 0 && (
                <div className="mt-2 space-y-1">
                  {layer.flags.map((flag: any, j: number) => (
                    <p key={j} className="text-xs text-muted-foreground pl-6">
                      • {flag.label}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LayerBreakdown;
