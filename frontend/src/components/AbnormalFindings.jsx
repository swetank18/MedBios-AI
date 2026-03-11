import { useState } from 'react';

function AbnormalFindings({ labValues = [], compact = false }) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? labValues : labValues.filter(l => l.status !== 'normal');
  const abnormalCount = labValues.filter(l => l.status !== 'normal').length;

  const statusStyles = {
    critical_high: 'bg-accent-red/15 text-accent-red',
    critical_low: 'bg-accent-red/15 text-accent-red',
    high: 'bg-accent-orange/15 text-accent-orange',
    low: 'bg-accent-yellow/15 text-accent-yellow',
    normal: 'bg-accent-green/15 text-accent-green',
  };

  if (compact) {
    return (
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Key Findings</h3>
          <span className="text-xs text-accent-orange">{abnormalCount} abnormal</span>
        </div>
        <div className="space-y-2">
          {labValues.filter(l => l.status !== 'normal').slice(0, 6).map((lab, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{lab.test_name}</span>
              <div className="flex items-center gap-2">
                <span className="text-text-primary font-medium">{lab.value} {lab.unit || ''}</span>
                <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-medium ${statusStyles[lab.status] || statusStyles.normal}`}>
                  {lab.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Lab Values</h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-accent-blue hover:text-accent-blue/80 transition"
        >
          {showAll ? `Show Abnormal (${abnormalCount})` : `Show All (${labValues.length})`}
        </button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Status</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          {display.map((lab, i) => (
            <tr key={i}>
              <td className="text-text-primary font-medium">{lab.test_name}</td>
              <td>{lab.value} {lab.unit || ''}</td>
              <td>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[lab.status] || statusStyles.normal}`}>
                  {lab.status?.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td className="text-text-muted text-xs">
                {lab.reference_min != null ? `${lab.reference_min} - ${lab.reference_max}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AbnormalFindings;
