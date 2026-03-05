import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = {
  identity: "hsl(200, 60%, 50%)",
  financial: "hsl(0, 72%, 52%)",
  process: "hsl(38, 85%, 50%)",
  documentation: "hsl(270, 50%, 55%)",
};

const FALLBACK_COLORS = [
  "hsl(150, 55%, 45%)",
  "hsl(220, 65%, 55%)",
  "hsl(12, 78%, 54%)",
  "hsl(46, 92%, 52%)",
];

const normalizeLayerKey = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.toLowerCase().replace("integrity", "").trim();
};

const getLayerColor = (layer: any, index: number) => {
  const normalizedKey = normalizeLayerKey(layer?.key);
  if (normalizedKey.includes("identity")) return COLORS.identity;
  if (normalizedKey.includes("financial")) return COLORS.financial;
  if (normalizedKey.includes("process")) return COLORS.process;
  if (normalizedKey.includes("documentation")) return COLORS.documentation;

  const normalizedName = normalizeLayerKey(layer?.name);
  if (normalizedName.includes("identity")) return COLORS.identity;
  if (normalizedName.includes("financial")) return COLORS.financial;
  if (normalizedName.includes("process")) return COLORS.process;
  if (normalizedName.includes("documentation")) return COLORS.documentation;

  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

const RiskBreakdownChart = ({ layers }: { layers: any[] }) => {
  if (!layers || layers.length === 0) return null;

  const data = layers.map((l, index) => ({
    name: l.name.replace(" Integrity", ""),
    score: l.weightedScore,
    raw: l.score,
    weight: Math.round(l.weight * 100),
    key: l.key,
    color: getLayerColor(l, index),
  }));

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;
    return (
      <div className="min-w-[190px] rounded-md border border-border bg-popover px-3 py-2 shadow-md">
        <p className="text-xs font-semibold text-foreground">{item.name}</p>
        <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
          <p>
            Contribution:{" "}
            <span className="font-medium text-foreground">{item.score} pts</span>
          </p>
          <p>
            Layer risk:{" "}
            <span className="font-medium text-foreground">{item.raw}/100</span>
          </p>
          <p>
            Weight:{" "}
            <span className="font-medium text-foreground">{item.weight}%</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Weighted Risk Contribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="hsl(var(--border))"
              strokeOpacity={0.35}
            />
            <XAxis
              type="number"
              domain={[0, 40]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent) / 0.45)" }}
              content={renderTooltip}
            />
            <Bar
              dataKey="score"
              radius={[0, 5, 5, 0]}
              barSize={20}
              background={{ fill: "hsl(var(--muted) / 0.7)", radius: 5 }}
            >
              {data.map((d) => (
                <Cell key={`${d.key}-${d.name}`} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskBreakdownChart;
