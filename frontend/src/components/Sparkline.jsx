/**
 * Sparkline — tiny inline line/area chart for biomarker trend previews.
 * Uses Recharts ComposedChart with ReferenceLine for normal range.
 */
import {
  ComposedChart, Line, Area, ReferenceLine,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const STATUS_COLOR = {
  increasing: '#10b981',
  decreasing: '#10b981',
  stable:     '#10b981',
  fluctuating:'#f59e0b',
  alert:      '#ef4444',
};

function SparkTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-card px-2 py-1 text-xs shadow-lg">
      <span className="text-text-secondary">{d.label ?? d.date ?? ''}: </span>
      <span className="font-semibold text-text-primary">{payload[0].value} {unit ?? ''}</span>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Array}  props.data        — [{date, value, status?}, ...] or numbers
 * @param {string} [props.direction] — 'increasing' | 'decreasing' | 'stable' | 'fluctuating'
 * @param {boolean}[props.alert]     — if true, renders in red
 * @param {number} [props.refMin]    — lower reference bound (dashed line)
 * @param {number} [props.refMax]    — upper reference bound (dashed line)
 * @param {string} [props.unit]      — unit label for tooltip
 * @param {number} [props.height]    — chart height (default 60)
 * @param {boolean}[props.showAxes]  — show axis labels (default false)
 */
export default function Sparkline({
  data = [],
  direction = 'stable',
  alert = false,
  refMin,
  refMax,
  unit,
  height = 60,
  showAxes = false,
}) {
  if (!data.length) return null;

  // Normalise: accept plain numbers or objects
  const points = data.map((d, i) => {
    if (typeof d === 'number') return { value: d, date: `#${i + 1}`, label: `#${i + 1}` };
    return {
      ...d,
      label: d.date
        ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `#${i + 1}`,
    };
  });

  const stroke = alert ? STATUS_COLOR.alert : (STATUS_COLOR[direction] ?? '#10b981');
  const fill   = alert ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)';

  const vals = points.map(p => p.value).filter(v => v != null);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const padding = (maxVal - minVal) * 0.2 || 1;
  const domainMin = Math.max(0, minVal - padding);
  const domainMax = maxVal + padding;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: showAxes ? 20 : 0 }}>
        {showAxes && (
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
        )}
        {showAxes && (
          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fontSize: 9, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
        )}
        <Tooltip content={<SparkTooltip unit={unit} />} />

        {/* Reference range band */}
        {refMin != null && (
          <ReferenceLine
            y={refMin}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={showAxes ? { value: 'min', fontSize: 8, fill: '#94a3b8' } : null}
          />
        )}
        {refMax != null && (
          <ReferenceLine
            y={refMax}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={1}
            label={showAxes ? { value: 'max', fontSize: 8, fill: '#94a3b8' } : null}
          />
        )}

        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill={fill}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={1.5}
          dot={points.length <= 8 ? { r: 2.5, fill: stroke, strokeWidth: 0 } : false}
          activeDot={{ r: 4, fill: stroke }}
          isAnimationActive={true}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
