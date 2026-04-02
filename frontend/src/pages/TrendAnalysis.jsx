import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientTrends } from '../api';
import Sparkline from '../components/Sparkline';

const DIR_CONFIG = {
  increasing:  { label: 'Increasing',   color: 'text-emerald-600',  bg: 'bg-emerald-50  border-emerald-200' },
  decreasing:  { label: 'Decreasing',   color: 'text-blue-600',     bg: 'bg-blue-50    border-blue-200'    },
  stable:      { label: 'Stable',       color: 'text-emerald-600',  bg: 'bg-emerald-50  border-emerald-200' },
  fluctuating: { label: 'Fluctuating',  color: 'text-amber-600',    bg: 'bg-amber-50   border-amber-200'   },
};

function DirectionBadge({ direction, alert }) {
  if (alert) return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-600">
      Alert
    </span>
  );
  const cfg = DIR_CONFIG[direction] ?? DIR_CONFIG.stable;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function StatChip({ label, value, sub }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.6rem] text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
      {sub && <span className="text-[0.6rem] text-gray-400">{sub}</span>}
    </div>
  );
}

function TrendCard({ trend }) {
  const pct = trend.change_rate_pct ?? 0;
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
  const pctColor = trend.alert
    ? 'text-red-600'
    : Math.abs(pct) < 5
      ? 'text-gray-400'
      : 'text-emerald-600';

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
      trend.alert ? 'border-red-200' : 'border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm capitalize truncate">
            {trend.test_name}
          </h4>
          {trend.unit && (
            <span className="text-[0.6rem] text-gray-400 uppercase">{trend.unit}</span>
          )}
        </div>
        <DirectionBadge direction={trend.direction} alert={trend.alert} />
      </div>

      {/* Sparkline chart */}
      <div className="mb-3">
        <Sparkline
          data={trend.data_points ?? []}
          direction={trend.direction}
          alert={trend.alert}
          refMin={trend.reference_min}
          refMax={trend.reference_max}
          unit={trend.unit}
          height={80}
          showAxes
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-3 gap-3">
        <StatChip
          label="First"
          value={trend.first_value ?? '—'}
          sub={trend.reference_min != null ? `ref: ${trend.reference_min}–${trend.reference_max}` : undefined}
        />
        <div className={`text-lg font-bold tabular-nums ${pctColor}`}>
          {arrow} {Math.abs(pct).toFixed(1)}%
        </div>
        <StatChip label="Latest" value={trend.latest_value ?? '—'} />
        <StatChip label="Readings" value={trend.num_readings ?? '—'} />
      </div>

      {/* Clinical note */}
      {(trend.clinical_note || trend.note) && (
        <p className="mt-3 text-[0.7rem] text-gray-500 italic leading-relaxed border-t border-gray-50 pt-2">
          {trend.clinical_note || trend.note}
        </p>
      )}
    </div>
  );
}

export default function TrendAnalysis() {
  const { patientId } = useParams();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    getPatientTrends(patientId)
      .then(setTrends)
      .catch(() => setError('Failed to load trend data.'))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading trend analysis…</p>
    </div>
  );

  if (error || !trends) return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="text-red-600 mb-3">{error || 'No trend data available'}</p>
        <Link to="/" className="text-emerald-600 text-sm hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const labTrends = trends.lab_trends ?? [];
  const alertTrends = labTrends.filter(t => t.alert);
  const filtered = filter === 'alerts' ? alertTrends
    : filter === 'stable' ? labTrends.filter(t => t.direction === 'stable')
    : labTrends;

  const tabs = [
    { id: 'all',    label: `All (${labTrends.length})` },
    { id: 'alerts', label: `Alerts (${alertTrends.length})` },
    { id: 'stable', label: `Stable (${labTrends.filter(t => t.direction === 'stable').length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-gray-400 text-sm hover:text-emerald-600 transition">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Longitudinal Trend Analysis
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Patient {patientId} · {trends.report_count ?? '?'} reports tracked
        </p>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tests Tracked',  value: trends.total_tests_tracked ?? labTrends.length, color: 'text-emerald-600' },
          { label: 'Trend Alerts',   value: trends.alert_count ?? alertTrends.length, color: alertTrends.length > 0 ? 'text-red-600' : 'text-gray-400' },
          { label: 'Reports',        value: trends.report_count ?? '—', color: 'text-emerald-600' },
          { label: 'Status',         value: trends.status === 'analyzed' ? 'Analyzed' : 'Pending', color: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-[0.6rem] text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts panel */}
      {alertTrends.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            {alertTrends.length} Clinically Significant Trend{alertTrends.length > 1 ? 's' : ''} Detected
          </h3>
          <ul className="space-y-1">
            {alertTrends.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {t.clinical_note || t.note || `${t.test_name}: ${t.direction} by ${Math.abs(t.change_rate_pct ?? 0).toFixed(1)}%`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trend cards grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trend, i) => (
            <TrendCard key={i} trend={trend} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400 text-sm">
          No trends matching the current filter.
        </div>
      )}

      {/* Insufficient data message */}
      {trends.status === 'insufficient_data' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center mt-6">
          <p className="text-amber-700 font-medium">Need at least 2 reports for trend analysis.</p>
          <p className="text-amber-600 text-sm mt-1">Upload a second report for this patient to see longitudinal trends.</p>
        </div>
      )}
    </div>
  );
}
