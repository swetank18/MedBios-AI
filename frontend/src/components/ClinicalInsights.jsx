import { useState } from 'react';

function ClinicalInsights({ insights = [], evidenceChains = [], graphRisks = [], compact = false }) {
  const [expandedInsight, setExpandedInsight] = useState(null);

  const displayInsights = compact ? insights.slice(0, 3) : insights;

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>🧠</div>
        <h3>
          Clinical Insights
          {insights.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({insights.length} findings)
            </span>
          )}
        </h3>
      </div>

      {displayInsights.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
          No clinical insights generated — all values may be within normal range.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {displayInsights.map((insight, i) => {
            const chain = evidenceChains[i];
            const isExpanded = expandedInsight === i;

            return (
              <div
                key={i}
                className={`insight-card confidence-${insight.confidence}`}
                onClick={() => setExpandedInsight(isExpanded ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4>{insight.condition}</h4>
                    <span className="insight-category">{insight.category}</span>
                  </div>
                  <span className={`badge badge-${insight.confidence === 'high' ? 'critical' : insight.confidence === 'medium' ? 'high' : 'normal'}`}>
                    {insight.confidence?.toUpperCase()}
                  </span>
                </div>

                {isExpanded && (
                  <div className="insight-body">
                    {/* Reasoning */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Reasoning
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {insight.reasoning}
                      </p>
                    </div>

                    {/* Evidence */}
                    {insight.evidence && insight.evidence.length > 0 && (
                      <div className="evidence-chain" style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                          Supporting Evidence
                        </div>
                        {insight.evidence.map((ev, j) => (
                          <div key={j} className="evidence-step">
                            <div className="step-number">{j + 1}</div>
                            <div className="step-content">
                              <div className="step-label">{ev.test}</div>
                              <div className="step-value">
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  {ev.value}
                                </span>
                                {' '}— {ev.finding}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Evidence Chain from Explainability */}
                    {chain && chain.confidence_justification && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12 }}>
                        💡 {chain.confidence_justification}
                      </div>
                    )}

                    {/* Recommendation */}
                    {insight.recommendation && (
                      <div className="recommendation">
                        <strong>📋 Recommended:</strong> {insight.recommendation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {compact && insights.length > 3 && (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            +{insights.length - 3} more insights — switch to Insights tab for details
          </span>
        </div>
      )}

      {/* Downstream Graph Risks */}
      {!compact && graphRisks && graphRisks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>🕸️</div>
            <h3>Knowledge Graph — Downstream Risks</h3>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {graphRisks.map((risk, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${risk.confidence === 'high' ? '#ef4444' : risk.confidence === 'medium' ? '#f59e0b' : '#22c55e'}`,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{risk.risk}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Triggered by: {risk.triggered_by} ({risk.status}) • Chain: {risk.relationship_chain}
                  </div>
                </div>
                <span className={`badge badge-${risk.confidence === 'high' ? 'critical' : risk.confidence === 'medium' ? 'high' : 'normal'}`}>
                  {risk.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicalInsights;
