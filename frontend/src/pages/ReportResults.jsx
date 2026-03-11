import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getReport, getReportPdfUrl } from '../api';
import AbnormalFindings from '../components/AbnormalFindings';
import ClinicalInsights from '../components/ClinicalInsights';
import RiskScores from '../components/RiskScores';
import KnowledgeGraphViz from '../components/KnowledgeGraphViz';
import DoctorReport from '../components/DoctorReport';

function ReportResults() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!data);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!data && id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      const result = await getReport(id);
      setData(result);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay" style={{ minHeight: 400 }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading report analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-muted)' }}>Report not found</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from either analysis result or DB-stored format
  const labValues = data.lab_values || [];
  const insights = data.insights || [];
  const riskScores = data.risk_scores || {};
  const graphData = data.knowledge_graph || null;
  const clinicalReport = data.clinical_report || {};
  const evidenceChains = data.evidence_chains || [];
  const graphRisks = data.graph_risks || [];
  const abnormalCount = data.abnormal_count || labValues.filter(l => l.status !== 'normal').length;

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '' },
    { id: 'findings', label: '🔍 Findings', icon: '' },
    { id: 'insights', label: '🧠 Insights', icon: '' },
    { id: 'graph', label: '🕸️ Graph', icon: '' },
    { id: 'report', label: '📄 Report', icon: '' },
  ];

  return (
    <div className="page-container">
      <div className="page-header slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>← Dashboard</Link>
        </div>
        <h1>Analysis Results</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p>{data.filename || 'Medical Report'} • {data.document_type?.replace('_', ' ') || 'Lab Report'}</p>
          <a href={getReportPdfUrl(id)} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-primary" style={{ fontSize: '0.85rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
              📥 Export PDF
            </button>
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid-auto fade-in" style={{ marginBottom: 24 }}>
        <div className="glass-card stat-card">
          <div className="stat-value">{labValues.length}</div>
          <div className="stat-label">Lab Values</div>
        </div>
        <div className="glass-card stat-card warning">
          <div className="stat-value">{abnormalCount}</div>
          <div className="stat-label">Abnormal</div>
        </div>
        <div className="glass-card stat-card danger">
          <div className="stat-value">{insights.length}</div>
          <div className="stat-label">Clinical Insights</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">
            {riskScores.overall || 0}%
          </div>
          <div className="stat-label">Risk Score</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: 24 }}>
            <div className="grid-2">
              <AbnormalFindings labValues={labValues} compact />
              <RiskScores riskScores={riskScores} />
            </div>
            <ClinicalInsights insights={insights} evidenceChains={evidenceChains} compact />
          </div>
        )}

        {activeTab === 'findings' && (
          <AbnormalFindings labValues={labValues} />
        )}

        {activeTab === 'insights' && (
          <ClinicalInsights insights={insights} evidenceChains={evidenceChains} graphRisks={graphRisks} />
        )}

        {activeTab === 'graph' && (
          <KnowledgeGraphViz graphData={graphData} graphRisks={graphRisks} />
        )}

        {activeTab === 'report' && (
          <DoctorReport report={clinicalReport} patientInfo={data.patient_info} />
        )}
      </div>
    </div>
  );
}

export default ReportResults;
