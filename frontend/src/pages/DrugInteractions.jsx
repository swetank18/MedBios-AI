import { useState } from 'react';
import { checkDrugInteractions } from '../api';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e',
};

const SEVERITY_ICONS = {
  critical: '🚨',
  high: '⚠️',
  moderate: '⚡',
  low: 'ℹ️',
};

const COMMON_MEDICATIONS = [
  'Warfarin', 'Aspirin', 'Metformin', 'Lisinopril', 'Atorvastatin',
  'Ibuprofen', 'Omeprazole', 'Fluoxetine', 'Levothyroxine', 'Amlodipine',
  'Clopidogrel', 'Digoxin', 'Amiodarone', 'Spironolactone', 'Prednisone',
  'Insulin', 'Methotrexate', 'Ciprofloxacin', 'Phenelzine', 'Sertraline',
];

export default function DrugInteractionChecker() {
  const [medications, setMedications] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addMedication = (med) => {
    const name = med || inputValue.trim();
    if (name && !medications.includes(name)) {
      setMedications([...medications, name]);
      setInputValue('');
      setResults(null);
    }
  };

  const removeMedication = (med) => {
    setMedications(medications.filter((m) => m !== med));
    setResults(null);
  };

  const handleCheck = async () => {
    if (medications.length < 1) {
      setError('Please add at least one medication');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await checkDrugInteractions(medications);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addMedication();
  };

  return (
    <div className="page">
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
        💊 Drug Interaction Checker
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Check for dangerous drug-drug and drug-lab interactions
      </p>

      {/* Medication Input */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>
          <span style={{ marginRight: '0.5rem' }}>📋</span>
          Patient Medications
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            id="medication-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type medication name..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-dim)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
            }}
          />
          <button
            onClick={() => addMedication()}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            + Add
          </button>
        </div>

        {/* Quick-add pills */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            Quick add:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {COMMON_MEDICATIONS.filter((m) => !medications.includes(m)).slice(0, 12).map((med) => (
              <button
                key={med}
                onClick={() => addMedication(med)}
                style={{
                  padding: '0.3rem 0.7rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '20px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(14,165,233,0.15)'; e.target.style.borderColor = 'var(--accent-blue)'; }}
                onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'var(--border-dim)'; }}
              >
                + {med}
              </button>
            ))}
          </div>
        </div>

        {/* Selected medications */}
        {medications.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {medications.map((med) => (
              <span
                key={med}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(14,165,233,0.3)',
                  borderRadius: '25px',
                  color: 'var(--accent-blue)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                💊 {med}
                <button
                  onClick={() => removeMedication(med)}
                  style={{
                    background: 'rgba(239,68,68,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          id="check-interactions-btn"
          onClick={handleCheck}
          disabled={loading || medications.length < 1}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '1rem',
            opacity: loading || medications.length < 1 ? 0.5 : 1,
          }}
        >
          {loading ? '🔬 Analyzing Interactions...' : '🔍 Check Interactions'}
        </button>

        {error && (
          <p style={{ color: '#ef4444', marginTop: '0.75rem', textAlign: 'center' }}>{error}</p>
        )}
      </div>

      {/* Results */}
      {results && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          {/* Alert Level Banner */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              borderColor: SEVERITY_COLORS[results.alert_level] || 'var(--border-dim)',
              borderWidth: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{
                  color: SEVERITY_COLORS[results.alert_level] || 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {SEVERITY_ICONS[results.alert_level] || '✅'}{' '}
                  {results.alert_level === 'none'
                    ? 'No Interactions Detected'
                    : `${results.alert_level} Alert Level`}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {results.drug_drug_interactions?.total || 0} drug-drug interaction(s) found
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {Object.entries(results.drug_drug_interactions?.by_severity || {}).map(([sev, count]) =>
                  count > 0 ? (
                    <div key={sev} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: SEVERITY_COLORS[sev] }}>
                        {count}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {sev}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>

          {/* Individual Interactions */}
          {results.drug_drug_interactions?.interactions?.map((inter, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                marginBottom: '1rem',
                borderLeft: `4px solid ${SEVERITY_COLORS[inter.severity]}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {inter.drug_a} ⟷ {inter.drug_b}
                  </h4>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: SEVERITY_COLORS[inter.severity],
                    }}
                  >
                    {inter.severity}
                  </span>
                </div>
              </div>

              <div style={{
                background: 'rgba(239,68,68,0.08)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '0.75rem',
              }}>
                <p style={{ fontWeight: 600, color: SEVERITY_COLORS[inter.severity], marginBottom: '0.25rem' }}>
                  ⚡ {inter.effect}
                </p>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  MECHANISM
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {inter.mechanism}
                </p>
              </div>

              <div style={{
                background: 'rgba(34,197,94,0.08)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                borderLeft: '3px solid #22c55e',
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  ✅ RECOMMENDATION
                </p>
                <p style={{ color: '#22c55e', fontSize: '0.9rem' }}>
                  {inter.recommendation}
                </p>
              </div>
            </div>
          ))}

          {/* Drug-Lab Interactions */}
          {results.drug_lab_interactions?.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>
                <span style={{ marginRight: '0.5rem' }}>🧪</span>
                Drug-Lab Interactions ({results.drug_lab_count})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Affected Lab</th>
                      <th>Expected Effect</th>
                      <th>Clinical Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.drug_lab_interactions.map((dl, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>💊 {dl.medication}</td>
                        <td>{dl.affected_lab}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            background: dl.expected_effect.includes('elevated') || dl.expected_effect.includes('increased')
                              ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                            color: dl.expected_effect.includes('elevated') || dl.expected_effect.includes('increased')
                              ? '#ef4444' : '#60a5fa',
                          }}>
                            {dl.expected_effect}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{dl.clinical_note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
