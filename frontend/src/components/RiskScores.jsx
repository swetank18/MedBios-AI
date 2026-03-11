function RiskScores({ riskScores = {} }) {
  const systems = riskScores.by_system || {};
  const overall = riskScores.overall || 0;

  const getRiskColor = (score) => {
    if (score >= 70) return { bar: 'bg-accent-red', text: 'text-accent-red', label: 'HIGH' };
    if (score >= 40) return { bar: 'bg-accent-orange', text: 'text-accent-orange', label: 'MODERATE' };
    return { bar: 'bg-accent-green', text: 'text-accent-green', label: 'LOW' };
  };

  const overallRisk = getRiskColor(overall);

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Risk Assessment</h3>
        <span className={`text-xs font-bold ${overallRisk.text}`}>{overall}% — {overallRisk.label}</span>
      </div>

      {/* Overall bar */}
      <div className="mb-5">
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full ${overallRisk.bar} transition-all duration-1000`}
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      {/* Per-system */}
      <div className="space-y-3">
        {Object.entries(systems)
          .sort((a, b) => b[1] - a[1])
          .map(([system, score]) => {
            const risk = getRiskColor(score);
            return (
              <div key={system}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-text-secondary">{system}</span>
                  <span className={`text-sm font-bold ${risk.text}`}>{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${risk.bar} transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default RiskScores;
