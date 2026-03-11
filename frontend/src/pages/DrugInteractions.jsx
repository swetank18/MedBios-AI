import { useState } from 'react';
import { checkDrugInteractions } from '../api';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-accent-red/10', border: 'border-accent-red/40', text: 'text-accent-red', badge: 'bg-accent-red text-white' },
  high: { bg: 'bg-accent-orange/10', border: 'border-accent-orange/40', text: 'text-accent-orange', badge: 'bg-accent-orange text-white' },
  moderate: { bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/40', text: 'text-accent-yellow', badge: 'bg-accent-yellow text-black' },
  low: { bg: 'bg-accent-blue/10', border: 'border-accent-blue/40', text: 'text-accent-blue', badge: 'bg-accent-blue text-white' },
};

const QUICK_MEDS = [
  'Warfarin', 'Aspirin', 'Metformin', 'Lisinopril', 'Atorvastatin',
  'Ibuprofen', 'Omeprazole', 'Levothyroxine', 'Amlodipine', 'Clopidogrel',
  'Digoxin', 'Amiodarone', 'Spironolactone', 'Prednisone', 'Insulin',
  'Fluoxetine', 'Phenelzine', 'Ciprofloxacin',
];

function DrugInteractions() {
  const [medications, setMedications] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addMed = (med) => {
    const normalized = med.trim().toLowerCase();
    if (normalized && !medications.some(m => m.toLowerCase() === normalized)) {
      setMedications(prev => [...prev, med.trim()]);
    }
    setInputValue('');
  };

  const removeMed = (index) => setMedications(prev => prev.filter((_, i) => i !== index));

  const handleCheck = async () => {
    if (medications.length < 2) { setError('Add at least 2 medications'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await checkDrugInteractions(medications);
      setResults(data);
    } catch {
      setError('Failed to check interactions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const maxSeverity = results?.drug_interactions?.reduce((max, i) => {
    const order = { critical: 4, high: 3, moderate: 2, low: 1 };
    return (order[i.severity] || 0) > (order[max] || 0) ? i.severity : max;
  }, 'low') || 'low';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="slide-up mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          Drug Interaction Checker
        </h1>
        <p className="text-text-secondary mt-1">Check for dangerous drug-drug and drug-lab interactions</p>
      </div>

      {/* Medication Input */}
      <div className="glass-card mb-6 fade-in">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Patient Medications</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMed(inputValue)}
            placeholder="Type medication name..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-border-subtle text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-blue transition"
          />
          <button
            onClick={() => addMed(inputValue)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium hover:opacity-90 transition"
          >
            + Add
          </button>
        </div>

        <div className="mb-4">
          <p className="text-text-muted text-xs mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_MEDS.map(med => (
              <button
                key={med}
                onClick={() => addMed(med)}
                className="px-2.5 py-1 rounded-md text-xs border border-border-subtle text-text-muted hover:text-text-primary hover:border-text-muted transition"
              >
                + {med}
              </button>
            ))}
          </div>
        </div>

        {medications.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border-subtle">
            {medications.map((med, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-blue/15 text-accent-blue text-sm">
                {med}
                <button onClick={() => removeMed(i)} className="text-accent-red/60 hover:text-accent-red text-xs">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        disabled={loading || medications.length < 2}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        {loading ? 'Checking...' : 'Check Interactions'}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm mb-6">{error}</div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4 fade-in">
          {/* Summary */}
          <div className={`glass-card ${SEVERITY_STYLES[maxSeverity].border} border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${SEVERITY_STYLES[maxSeverity].text}`}>
                  {maxSeverity.toUpperCase()} ALERT LEVEL
                </h3>
                <p className="text-text-secondary text-sm mt-0.5">
                  {results.drug_interactions?.length || 0} drug-drug interaction(s) found
                </p>
              </div>
              <div className="flex gap-3">
                {['critical', 'high', 'moderate', 'low'].map(sev => {
                  const count = results.drug_interactions?.filter(i => i.severity === sev).length || 0;
                  if (!count) return null;
                  return (
                    <div key={sev} className="text-center">
                      <div className={`text-lg font-bold ${SEVERITY_STYLES[sev].text}`}>{count}</div>
                      <div className="text-[0.6rem] text-text-muted uppercase">{sev}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interaction Cards */}
          {results.drug_interactions?.map((interaction, i) => {
            const s = SEVERITY_STYLES[interaction.severity] || SEVERITY_STYLES.low;
            return (
              <div key={i} className={`glass-card ${s.border} border`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-text-primary">
                    {interaction.drug1} ↔ {interaction.drug2}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.badge}`}>
                    {interaction.severity?.toUpperCase()}
                  </span>
                </div>

                <div className={`${s.bg} rounded-lg p-3 mb-3`}>
                  <span className={`text-sm font-medium ${s.text}`}>{interaction.effect}</span>
                </div>

                {interaction.mechanism && (
                  <div className="mb-3">
                    <p className="text-[0.65rem] text-text-muted uppercase tracking-wider mb-1">Mechanism</p>
                    <p className="text-text-secondary text-sm">{interaction.mechanism}</p>
                  </div>
                )}

                {interaction.recommendation && (
                  <div className="bg-accent-green/10 border border-accent-green/30 rounded-lg p-3">
                    <p className="text-[0.65rem] text-text-muted uppercase tracking-wider mb-1">Recommendation</p>
                    <p className="text-accent-green text-sm">{interaction.recommendation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DrugInteractions;
