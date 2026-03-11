import { useState } from 'react';

function ClinicalInsights({ insights = [], evidenceChains = [], graphRisks = [], compact = false }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const confStyles = {
    high: 'bg-accent-red/15 text-accent-red',
    medium: 'bg-accent-orange/15 text-accent-orange',
    low: 'bg-accent-blue/15 text-accent-blue',
  };

  const displayInsights = compact ? insights.slice(0, 4) : insights;

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Clinical Insights {compact && `(${insights.length})`}
        </h3>
      </div>

      <div className="space-y-3">
        {displayInsights.map((insight, i) => {
          const chain = evidenceChains.find(e => e.condition === insight.condition);
          const isExpanded = expanded[i];

          return (
            <div
              key={i}
              className="rounded-lg border border-border-subtle bg-white/[0.02] overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.02] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">{insight.condition}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-bold ${confStyles[insight.confidence] || confStyles.low}`}>
                      {insight.confidence?.toUpperCase()}
                    </span>
                    <span className="text-[0.65rem] text-text-muted">
                      {insight.category}
                    </span>
                  </div>
                </div>
                <span className="text-text-muted text-xs mt-0.5">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-border-subtle pt-2">
                  {insight.reasoning && (
                    <div>
                      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider mb-0.5">Reasoning</p>
                      <p className="text-sm text-text-secondary">{insight.reasoning}</p>
                    </div>
                  )}
                  {insight.recommendation && (
                    <div>
                      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider mb-0.5">Recommendation</p>
                      <p className="text-sm text-accent-green">{insight.recommendation}</p>
                    </div>
                  )}
                  {chain && chain.evidence && (
                    <div>
                      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider mb-1">Evidence Chain</p>
                      <div className="space-y-1">
                        {chain.evidence.map((ev, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-text-secondary">
                            <span className="w-1 h-1 rounded-full bg-accent-blue shrink-0" />
                            <span>{ev.test_name}: <strong className="text-text-primary">{ev.value} {ev.unit || ''}</strong> ({ev.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Knowledge graph risks */}
                  {graphRisks.filter(r => r.source === insight.condition).length > 0 && (
                    <div>
                      <p className="text-[0.6rem] text-text-muted uppercase tracking-wider mb-1">Downstream Risks</p>
                      <div className="flex flex-wrap gap-1.5">
                        {graphRisks.filter(r => r.source === insight.condition).map((risk, k) => (
                          <span key={k} className="px-2 py-0.5 rounded text-xs bg-accent-red/10 text-accent-red">
                            {risk.target}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClinicalInsights;
