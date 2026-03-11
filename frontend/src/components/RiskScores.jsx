function RiskScores({ riskScores = {} }) {
  const organSystems = riskScores.organ_systems || {};

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>⚠️</div>
        <h3>
          Risk Assessment
          {riskScores.overall != null && (
            <span style={{
              marginLeft: 8, fontSize: '0.85rem', fontWeight: 700,
              color: riskScores.overall_level === 'critical' ? 'var(--status-critical)' :
                     riskScores.overall_level === 'high' ? 'var(--status-high)' :
                     riskScores.overall_level === 'moderate' ? 'var(--status-low)' : 'var(--status-normal)',
            }}>
              ({riskScores.overall}% — {riskScores.overall_level?.toUpperCase()})
            </span>
          )}
        </h3>
      </div>

      {Object.keys(organSystems).length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
          No significant risk factors detected ✅
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {Object.entries(organSystems)
            .sort(([,a], [,b]) => b.score - a.score)
            .map(([system, data]) => (
              <div key={system} className="risk-bar-container">
                <div className="risk-bar-label">
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                    {system.replace('_', ' ')}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: data.level === 'critical' ? 'var(--status-critical)' :
                           data.level === 'high' ? 'var(--status-high)' :
                           data.level === 'moderate' ? 'var(--status-low)' : 'var(--status-normal)',
                  }}>
                    {data.score}% ({data.level})
                  </span>
                </div>
                <div className="risk-bar-track">
                  <div
                    className={`risk-bar-fill ${data.level}`}
                    style={{ width: `${Math.max(data.score, 3)}%` }}
                  ></div>
                </div>
                {data.factors && data.factors.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {data.factors.join(' • ')}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default RiskScores;
