function PatientSummaryCard({ patientInfo = {}, labValues = [], riskScores = {}, insights = [] }) {
  const overall = riskScores.overall || 0;
  const abnormalCount = labValues.filter(l => l.status !== 'normal').length;
  const criticalCount = labValues.filter(l => l.status?.startsWith('critical')).length;
  const highConfInsights = insights.filter(i => i.confidence === 'high').length;

  const riskColor = overall >= 70 ? 'text-accent-red' : overall >= 40 ? 'text-accent-orange' : 'text-accent-green';
  const riskBg = overall >= 70 ? 'bg-accent-red/10' : overall >= 40 ? 'bg-accent-orange/10' : 'bg-accent-green/10';
  const riskLabel = overall >= 70 ? 'HIGH' : overall >= 40 ? 'MODERATE' : 'LOW';

  const name = patientInfo.name || patientInfo.patient_name || 'Patient';
  const age = patientInfo.age || patientInfo.patient_age || '—';
  const sex = patientInfo.sex || patientInfo.gender || '—';
  const id = patientInfo.id || patientInfo.patient_id || '—';

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="glass-card relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 blur-2xl pointer-events-none" />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-accent-blue/20">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary truncate">{name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-muted">
            {age !== '—' && <span>Age: <strong className="text-text-secondary">{age}</strong></span>}
            {sex !== '—' && <span>Sex: <strong className="text-text-secondary">{sex}</strong></span>}
            {id !== '—' && <span>ID: <strong className="text-text-secondary">{id}</strong></span>}
          </div>
        </div>

        {/* Risk badge */}
        <div className={`px-3 py-1.5 rounded-xl ${riskBg} flex flex-col items-center shrink-0`}>
          <span className={`text-lg font-bold tabular-nums ${riskColor}`}>{overall}%</span>
          <span className={`text-[0.55rem] font-bold uppercase tracking-wider ${riskColor}`}>{riskLabel}</span>
        </div>
      </div>

      {/* Quick metrics strip */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border-subtle">
        {[
          { value: labValues.length, label: 'Tests', color: 'text-accent-blue' },
          { value: abnormalCount, label: 'Abnormal', color: 'text-accent-orange' },
          { value: criticalCount, label: 'Critical', color: 'text-accent-red' },
          { value: highConfInsights, label: 'Alerts', color: 'text-accent-purple' },
        ].map((m, i) => (
          <div key={i} className="text-center">
            <div className={`text-lg font-bold tabular-nums ${m.color}`}>{m.value}</div>
            <div className="text-[0.55rem] text-text-muted uppercase tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientSummaryCard;
