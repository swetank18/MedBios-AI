import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientTrends } from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';

const DIRECTION_STYLES = {
  increasing: { icon: '📈', color: '#f97316', label: 'Increasing' },
  decreasing: { icon: '📉', color: '#3b82f6', label: 'Decreasing' },
  stable: { icon: '➡️', color: '#22c55e', label: 'Stable' },
  fluctuating: { icon: '📊', color: '#eab308', label: 'Fluctuating' },
};

function TrendChart({ trend }) {
  const data = trend.data_points.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    value: p.value,
    status: p.status,
  }));

  const isAlert = trend.alert;
  const lineColor = isAlert ? '#ef4444' : '#0ea5e9';

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${trend.test_name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2.5}
            fill={`url(#gradient-${trend.test_name})`}
            dot={{ fill: lineColor, r: 4 }}
            activeDot={{ r: 6, fill: lineColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TrendAnalysis({ patientId: propPatientId }) {
  const params = useParams();
  const patientId = propPatientId || params.patientId;
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, alerts, improving

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setError('No patient ID provided');
      return;
    }
    loadTrends();
  }, [patientId]);

  const loadTrends = async () => {
    try {
      const data = await getPatientTrends(patientId);
      setTrends(data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'Need at least 2 reports for trend analysis. Upload more reports for this patient.'
          : err.response?.data?.detail || 'Failed to load trend data'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem', width: 40, height: 40, border: '3px solid var(--border-dim)', borderTop: '3px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading trend analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          📈 Trend Analysis
        </h1>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!trends || trends.status === 'insufficient_data') {
    return (
      <div className="page">
        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          📈 Trend Analysis
        </h1>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {trends?.message || 'Need at least 2 reports to analyze trends.'}
          </p>
        </div>
      </div>
    );
  }

  const allTrends = Object.values(trends.trends || {});
  const filteredTrends = allTrends.filter((t) => {
    if (filter === 'alerts') return t.alert;
    if (filter === 'improving') return t.direction === 'decreasing' || t.direction === 'stable';
    return true;
  });

  return (
    <div className="page">
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
        📈 Trend Analysis
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {trends.total_tests_tracked} tests tracked • {trends.alert_count} alerts
      </p>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
            {trends.total_tests_tracked}
          </div>
          <div className="stat-label">TESTS TRACKED</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {trends.alert_count}
          </div>
          <div className="stat-label">ALERTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {allTrends.filter((t) => t.direction === 'stable').length}
          </div>
          <div className="stat-label">STABLE</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        {[
          { key: 'all', label: `All (${allTrends.length})` },
          { key: 'alerts', label: `⚠️ Alerts (${trends.alert_count})` },
          { key: 'improving', label: `✅ Stable/Improving` },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Banner */}
      {trends.alerts?.length > 0 && filter !== 'improving' && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            borderColor: '#ef4444',
            borderWidth: '2px',
            background: 'rgba(239,68,68,0.05)',
          }}
        >
          <h3 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>
            🚨 Clinically Significant Trends
          </h3>
          {trends.alerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.5rem 0',
                borderBottom: idx < trends.alerts.length - 1 ? '1px solid rgba(239,68,68,0.15)' : 'none',
              }}
            >
              <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {DIRECTION_STYLES[alert.direction]?.icon} {alert.test_name}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  {alert.change_rate_pct > 0 ? '+' : ''}{alert.change_rate_pct}%
                </span>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {alert.clinical_note}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Trend Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1rem',
      }}>
        {filteredTrends.map((trend) => {
          const style = DIRECTION_STYLES[trend.direction] || DIRECTION_STYLES.stable;
          return (
            <div
              key={trend.test_name}
              className="card"
              style={{
                borderLeft: trend.alert ? '4px solid #ef4444' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ color: 'var(--text-primary)' }}>
                  {trend.test_name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: `${style.color}22`,
                    color: style.color,
                  }}>
                    {style.icon} {style.label}
                  </span>
                  <span style={{
                    fontWeight: 700,
                    color: trend.change_rate_pct > 0 ? '#f97316' : trend.change_rate_pct < 0 ? '#22c55e' : 'var(--text-muted)',
                    fontSize: '0.9rem',
                  }}>
                    {trend.change_rate_pct > 0 ? '+' : ''}{trend.change_rate_pct}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  First: <span style={{ color: 'var(--text-primary)' }}>{trend.first_value}</span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Latest: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{trend.latest_value}</span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Readings: {trend.num_readings}
                </span>
              </div>

              <TrendChart trend={trend} />

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                marginTop: '0.5rem',
                lineHeight: 1.4,
              }}>
                {trend.clinical_note}
              </p>
            </div>
          );
        })}
      </div>

      {filteredTrends.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No trends match this filter.
          </p>
        </div>
      )}
    </div>
  );
}
