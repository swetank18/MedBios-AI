function DoctorReport({ report = {}, patientInfo = {} }) {
  const summary = report.summary || {};
  const abnormalFindings = report.abnormal_findings || [];
  const concerns = report.concerns || [];
  const riskScores = report.risk_scores || {};
  const recommendations = report.recommendations || [];

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            Clinical Analysis Report
          </h2>
          <p className="text-text-muted text-xs mt-0.5">MedBios AI — Physician Summary</p>
        </div>
        <div className="text-right text-xs text-text-muted">
          <div>Generated: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Patient Info */}
      {patientInfo && Object.keys(patientInfo).length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Patient Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(patientInfo).map(([key, value]) => (
              value && (
                <div key={key} className="px-3 py-2 rounded-lg bg-white/[0.03]">
                  <div className="text-[0.6rem] text-text-muted uppercase">{key.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-text-primary font-medium">{value}</div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Abnormal Findings */}
      {abnormalFindings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Abnormal Findings ({abnormalFindings.length})
          </h3>
          <div className="space-y-1.5">
            {abnormalFindings.map((finding, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-orange/5 border border-accent-orange/20 text-sm text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0" />
                {typeof finding === 'string' ? finding : `${finding.test_name}: ${finding.value} ${finding.unit || ''} (${finding.status})`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Concerns */}
      {concerns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Clinical Concerns</h3>
          <div className="space-y-1.5">
            {concerns.map((concern, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-accent-red/5 border border-accent-red/20 text-sm text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 shrink-0" />
                {typeof concern === 'string' ? concern : concern.condition}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Scores */}
      {Object.keys(riskScores).length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Risk Assessment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(riskScores.by_system || riskScores).map(([system, score]) => {
              if (system === 'overall' || system === 'by_system') return null;
              const color = score >= 70 ? 'text-accent-red' : score >= 40 ? 'text-accent-orange' : 'text-accent-green';
              return (
                <div key={system} className="px-3 py-2 rounded-lg bg-white/[0.03]">
                  <div className="text-[0.6rem] text-text-muted uppercase">{system}</div>
                  <div className={`text-sm font-bold ${color}`}>{score}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Recommendations</h3>
          <div className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-accent-green/5 border border-accent-green/20 text-sm text-accent-green">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green mt-1.5 shrink-0" />
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-border-subtle">
        <p className="text-[0.65rem] text-text-muted leading-relaxed">
          DISCLAIMER: This report is generated by MedBios AI for informational purposes only. 
          It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified 
          healthcare provider for clinical decisions. AI-generated insights should be verified by 
          a licensed physician before any clinical action.
        </p>
      </div>
    </div>
  );
}

export default DoctorReport;
