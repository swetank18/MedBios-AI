import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getReport, getReportPdfUrl } from '../api';
import AbnormalFindings from '../components/AbnormalFindings';
import ClinicalInsights from '../components/ClinicalInsights';
import RiskScores from '../components/RiskScores';
import KnowledgeGraphViz from '../components/KnowledgeGraphViz';
import DoctorReport from '../components/DoctorReport';
import OrganSystemVis from '../components/OrganSystemVis';
import ReportChat from '../components/ReportChat';

function ReportResults() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(!data);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => { if (!data && id) loadReport(); }, [id]);

  const loadReport = async () => {
    try {
      const result = await getReport(id);
      setData(result);
    } catch {
      console.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="spinner" />
          <p className="text-text-muted">Loading report analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass-card text-center py-12">
          <p className="text-text-muted mb-4">Report not found</p>
          <Link to="/" className="px-5 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const labValues = data.lab_values || [];
  const insights = data.insights || [];
  const riskScores = data.risk_scores || {};
  const graphData = data.knowledge_graph || null;
  const clinicalReport = data.clinical_report || {};
  const evidenceChains = data.evidence_chains || [];
  const graphRisks = data.graph_risks || [];
  const abnormalCount = data.abnormal_count || labValues.filter(l => l.status !== 'normal').length;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'findings', label: 'Findings' },
    { id: 'insights', label: 'Insights' },
    { id: 'graph', label: 'Graph' },
    { id: 'report', label: 'Report' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="slide-up mb-6">
        <Link to="/" className="text-text-muted text-sm hover:text-text-secondary transition">← Dashboard</Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent mt-2">
          Analysis Results
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-text-secondary text-sm">{data.filename || 'Medical Report'} · {data.document_type?.replace('_', ' ') || 'Lab Report'}</p>
          <a href={getReportPdfUrl(id)} target="_blank" rel="noopener noreferrer">
            <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export PDF
            </button>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 fade-in">
        {[
          { value: labValues.length, label: 'Lab Values', color: 'text-accent-blue' },
          { value: abnormalCount, label: 'Abnormal', color: 'text-accent-orange' },
          { value: insights.length, label: 'Clinical Insights', color: 'text-accent-red' },
          { value: `${riskScores.overall || 0}%`, label: 'Risk Score', color: 'text-accent-pink' },
        ].map((stat, i) => (
          <div key={i} className="glass-card text-center !p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[0.65rem] text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white'
                : 'border border-border-subtle text-text-secondary hover:bg-white/5'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="fade-in">
        {activeTab === 'overview' && (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <AbnormalFindings labValues={labValues} compact />
                  <RiskScores riskScores={riskScores} />
                </div>
                <ClinicalInsights insights={insights} evidenceChains={evidenceChains} compact />
              </div>
              <div className="lg:col-span-1 h-full min-h-[400px]">
                <OrganSystemVis riskScores={riskScores} />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'findings' && <AbnormalFindings labValues={labValues} />}
        {activeTab === 'insights' && <ClinicalInsights insights={insights} evidenceChains={evidenceChains} graphRisks={graphRisks} />}
        {activeTab === 'graph' && <KnowledgeGraphViz graphData={graphData} graphRisks={graphRisks} />}
        {activeTab === 'report' && <DoctorReport report={clinicalReport} patientInfo={data.patient_info} />}
      </div>

      {/* AI Chat FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/20 flex items-center justify-center hover:scale-105 transition-transform z-50 focus:outline-none"
      >
        {chatOpen ? (
          <span className="text-2xl leading-none -mt-1">&times;</span>
        ) : (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* AI Chat Panel */}
      <div className={`fixed bottom-24 right-6 w-[350px] shadow-2xl shadow-black/50 z-50 transition-all duration-300 origin-bottom-right ${chatOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <ReportChat reportId={id} />
      </div>
    </div>
  );
}

export default ReportResults;
