import { useState } from 'react';

function AbnormalFindings({ labValues = [], compact = false }) {
  const [showAll, setShowAll] = useState(false);

  const abnormal = labValues.filter(l => l.status !== 'normal');
  const normal = labValues.filter(l => l.status === 'normal');
  const displayValues = compact ? abnormal.slice(0, 5) : (showAll ? labValues : abnormal);

  const getStatusBadge = (status) => {
    const labels = {
      critical_low: '🔴 CRITICAL LOW',
      critical_high: '🔴 CRITICAL HIGH',
      low: '🟡 LOW',
      high: '🟠 HIGH',
      normal: '🟢 NORMAL',
    };
    return labels[status] || status;
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-icon" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>🔍</div>
        <h3>
          {compact ? 'Key Findings' : 'Lab Values & Findings'}
          {abnormal.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--status-high)' }}>
              ({abnormal.length} abnormal)
            </span>
          )}
        </h3>
      </div>

      {displayValues.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
          {labValues.length === 0 ? 'No lab values extracted' : 'All values within normal range ✅'}
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Value</th>
              <th>Reference Range</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayValues.map((lab, i) => (
              <tr key={i}>
                <td style={{ fontWeight: lab.status !== 'normal' ? 600 : 400 }}>
                  {lab.test_name || lab.canonical_name}
                </td>
                <td className="value-cell" style={{ 
                  color: lab.status === 'normal' ? 'var(--text-primary)' : 
                         lab.status?.includes('critical') ? 'var(--status-critical)' : 'var(--status-high)'
                }}>
                  {lab.value} {lab.unit || lab.expected_unit || ''}
                </td>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {lab.reference_min != null && lab.reference_max != null
                    ? `${lab.reference_min} – ${lab.reference_max}`
                    : lab.reference_range || '—'}
                </td>
                <td>
                  <span className={`badge badge-${lab.status}`}>
                    {getStatusBadge(lab.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!compact && labValues.length > abnormal.length && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? `Show Abnormal Only (${abnormal.length})` : `Show All Values (${labValues.length})`}
          </button>
        </div>
      )}

      {compact && abnormal.length > 5 && (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            +{abnormal.length - 5} more abnormal values
          </span>
        </div>
      )}
    </div>
  );
}

export default AbnormalFindings;
