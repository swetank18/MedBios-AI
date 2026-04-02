import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedReport } from '../api';
import AbnormalFindings from '../components/AbnormalFindings';
import ClinicalInsights from '../components/ClinicalInsights';
import RiskScores from '../components/RiskScores';
import KnowledgeGraphViz from '../components/KnowledgeGraphViz';
import DoctorReport from '../components/DoctorReport';
import OrganSystemVis from '../components/OrganSystemVis';
import HealthScoreRing from '../components/HealthScoreRing';
import SystemRadarChart from '../components/SystemRadarChart';
import CriticalAlerts from '../components/CriticalAlerts';
import BiomarkerHeatmap from '../components/BiomarkerHeatmap';
import PatientSummaryCard from '../components/PatientSummaryCard';
import SkeletonLoader from '../components/SkeletonLoader';

function SharedReport() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // null | 'expired' | 'notfound'
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (token) loadSharedReport();
  }, [token]);

  const loadSharedReport = async () => {
    try {
      const res = await getSharedReport(token);
      setData(res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 410) setError('expired');
      else setError('notfound');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 page-enter">
        <div className="h-6 w-20 rounded bg-bg-secondary animate-pulse mb-2" />
        <div className="h-9 w-64 rounded bg-bg-secondary animate-pulse mb-6" />
        <SkeletonLoader type="stats" />
        <SkeletonLoader type="hero" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  if (error === 'expired') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="glass-card text-center py-16 px-8 max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Link Expired</h2>
          <p className="text-text-secondary text-sm mb-6">This shared report link has expired. Please ask the owner to share a new link.</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium hover:opacity-90 transition"
          >
            Sign up to MedBios AI
          </a>
        </div>
      </div>
    );
  }

  if (error === 'notfound' || !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="glass-card text-center py-16 px-8 max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-accent-red/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Report Not Found</h2>
          <p className="text-text-secondary text-sm mb-6">This shared link is invalid or has been revoked.</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium hover:opacity-90 transition"
          >
            Sign up to MedBios AI
          </a>
        </div>
      </div>
    );
  }

  const labValues = data.lab_values || [];
  const insights = data.insights || [];
  const riskScores = data.risk_scores || {};
  const graphData = data.knowledge_graph || null;
  const clinicalReport = data.clinical_report || {};
  const graphRisks = data.graph_risks || [];
  const overallScore = riskScores.overall || 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'findings', label: `Findings (${labValues.length})` },
    { id: 'insights', label: `Insights (${insights.length})` },
    { id: 'graph', label: 'Graph' },
    { id: 'report', label: 'Report' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Shared read-only banner */}
      <div className="bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border-b border-accent-blue/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <svg className="w-4 h-4 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>This is a <strong className="text-text-primary">shared read-only view</strong> · Shared by MedBios AI</span>
          </div>
          <a
            href="/signup"
            className="shrink-0 px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-semibold hover:opacity-90 transition"
          >
            Sign up to analyze your own reports
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 page-enter">
        {/* Header */}
        <div className="slide-up mb-6">
          <div className="flex items-start justify-between mt-3 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-blue via-white to-accent-purple bg-clip-text text-transparent">
                Analysis Results
              </h1>
              <p className="text-text-secondary text-sm mt-0.5">
                {data.filename || 'Medical Report'} · {data.document_type?.replace('_', ' ') || 'Lab Report'} · {labValues.length} tests analyzed
              </p>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        <CriticalAlerts labValues={labValues} insights={insights} />

        {/* Patient Summary */}
        <div className="mb-6 fade-in">
          <PatientSummaryCard
            patientInfo={data.patient_info}
            labValues={labValues}
            riskScores={riskScores}
            insights={insights}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 fade-in">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg shadow-accent-blue/15'
                  : 'border border-border-subtle text-text-secondary hover:bg-bg-secondary hover:border-text-muted'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div key={activeTab} className="page-enter">
          {activeTab === 'overview' && (
            <div className="stagger-children space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card flex flex-col items-center justify-center py-6">
                  <HealthScoreRing score={overallScore} size={200} />
                </div>
                <div className="lg:col-span-2">
                  <SystemRadarChart riskScores={riskScores} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AbnormalFindings labValues={labValues} compact />
                    <RiskScores riskScores={riskScores} />
                  </div>
                  <ClinicalInsights insights={insights} evidenceChains={[]} compact />
                </div>
                <div className="min-h-[380px]">
                  <OrganSystemVis riskScores={riskScores} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'heatmap' && <BiomarkerHeatmap labValues={labValues} />}
          {activeTab === 'findings' && <AbnormalFindings labValues={labValues} />}
          {activeTab === 'insights' && <ClinicalInsights insights={insights} evidenceChains={[]} graphRisks={graphRisks} />}
          {activeTab === 'graph' && <KnowledgeGraphViz graphData={graphData} graphRisks={graphRisks} />}
          {activeTab === 'report' && <DoctorReport report={clinicalReport} patientInfo={data.patient_info} />}
        </div>
      </div>
    </div>
  );
}

export default SharedReport;
