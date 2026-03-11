function DoctorReport({ report = {}, patientInfo = {} }) {
  const findings = report.abnormal_findings || [];
  const concerns = report.clinical_concerns || [];
  const recommendations = report.recommendations || [];
  const riskScores = report.risk_scores || {};
  const summary = report.summary || {};
  const allLabs = report.all_lab_values || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={handlePrint}>
          🖨️ Print Report
        </button>
      </div>

      {/* Doctor Report */}
      <div className="doctor-report">
        {/* Header */}
        <div className="report-header">
          <h2>MedBios AI — Patient Report Analysis</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
            Generated: {report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}
            {' • '}Document Type: {(report.document_type || 'Lab Report').replace('_', ' ')}
          </div>
        </div>

        {/* Patient Info */}
        <div className="report-section">
          <h3>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</div>
              <div style={{ fontWeight: 600 }}>{patientInfo.name || report.patient_info?.name || 'Not available'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age</div>
              <div style={{ fontWeight: 600 }}>{patientInfo.age || report.patient_info?.age || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gender</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {patientInfo.gender || report.patient_info?.gender || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="report-section">
          <h3>Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            {[
              { label: 'Tests Extracted', value: summary.total_tests_extracted || allLabs.length, color: 'var(--text-accent)' },
              { label: 'Abnormal Values', value: summary.abnormal_count || findings.length, color: 'var(--status-high)' },
              { label: 'Critical Values', value: summary.critical_count || 0, color: 'var(--status-critical)' },
              { label: 'Clinical Insights', value: summary.insights_generated || concerns.length, color: 'var(--text-accent)' },
              { label: 'Overall Risk', value: `${summary.overall_risk || 0}%`, color: 'var(--status-low)' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Abnormal Findings */}
        {findings.length > 0 && (
          <div className="report-section">
            <h3>Key Abnormal Findings</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Value</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{f.test}</td>
                    <td className="value-cell" style={{
                      color: f.status?.includes('critical') ? 'var(--status-critical)' : 'var(--status-high)',
                    }}>
                      {f.value} {f.unit}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {f.reference_range || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${f.status}`}>
                        {f.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Clinical Concerns */}
        {concerns.length > 0 && (
          <div className="report-section">
            <h3>Possible Clinical Concerns</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {concerns.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${c.confidence === 'high' ? '#ef4444' : c.confidence === 'medium' ? '#f59e0b' : '#22c55e'}`,
                }}>
                  <span style={{ fontWeight: 500 }}>{c.condition}</span>
                  <span className={`badge badge-${c.confidence === 'high' ? 'critical' : c.confidence === 'medium' ? 'high' : 'normal'}`}>
                    {c.confidence?.toUpperCase()} confidence
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Scores */}
        {Object.keys(riskScores).length > 0 && (
          <div className="report-section">
            <h3>Organ System Risk Scores</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {Object.entries(riskScores)
                .sort(([,a], [,b]) => b.score - a.score)
                .map(([system, data]) => (
                  <div key={system} className="risk-bar-container">
                    <div className="risk-bar-label">
                      <span style={{ textTransform: 'capitalize' }}>{system.replace('_', ' ')}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{data.score}%</span>
                    </div>
                    <div className="risk-bar-track">
                      <div className={`risk-bar-fill ${data.level}`} style={{ width: `${Math.max(data.score, 3)}%` }}></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="report-section">
            <h3>Recommended Follow-up</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {recommendations.map((r, i) => (
                <div key={i} style={{
                  padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${r.priority === 'high' ? '#f59e0b' : '#38bdf8'}`,
                }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    {r.priority === 'high' ? '⚡' : '→'} {r.recommendation}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Related to: {r.related_to}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer-box">
          ⚠️ <strong>IMPORTANT DISCLAIMER:</strong> {report.disclaimer || 
            'This analysis is generated by an AI system for informational purposes only. ' +
            'It is NOT a medical diagnosis. All findings must be reviewed and confirmed by a ' +
            'qualified healthcare professional.'}
        </div>
      </div>
    </div>
  );
}

export default DoctorReport;
