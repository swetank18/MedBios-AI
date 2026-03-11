import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listReports, getAnalytics, getReportPdfUrl } from '../api';

const CATEGORY_COLORS = {
  Hematology: 'bg-accent-red',
  Cardiovascular: 'bg-accent-orange',
  Nephrology: 'bg-accent-yellow',
  Endocrinology: 'bg-accent-green',
  Hepatology: 'bg-accent-teal',
  Electrolytes: 'bg-accent-blue',
  Immunology: 'bg-accent-purple',
  Nutrition: 'bg-accent-pink',
};

const CATEGORY_TEXT = {
  Hematology: 'text-accent-red',
  Cardiovascular: 'text-accent-orange',
  Nephrology: 'text-accent-yellow',
  Endocrinology: 'text-accent-green',
  Hepatology: 'text-accent-teal',
  Electrolytes: 'text-accent-blue',
  Immunology: 'text-accent-purple',
  Nutrition: 'text-accent-pink',
};

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [reportData, analyticsData] = await Promise.all([
        listReports(),
        getAnalytics().catch(() => null),
      ]);
      setReports(reportData);
      setAnalytics(analyticsData);
    } catch {
      setError('Could not connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const a = analytics || {};
  const catBreakdown = a.category_breakdown || {};
  const maxCatCount = Math.max(...Object.values(catBreakdown), 1);

  const stats = [
    { value: a.total_reports ?? reports.length, label: 'Reports Analyzed', color: 'text-accent-blue' },
    { value: a.total_patients ?? '-', label: 'Patients Tracked', color: 'text-accent-purple' },
    { value: a.total_lab_tests ?? '-', label: 'Lab Tests', color: 'text-accent-green' },
    { value: a.total_insights ?? '-', label: 'Clinical Insights', color: 'text-accent-orange' },
    { value: a.abnormal_count ?? '-', label: 'Abnormal Values', color: 'text-accent-red' },
    { value: a.avg_risk_score ? `${a.avg_risk_score}%` : '-', label: 'Avg Risk Score', color: 'text-accent-pink' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="slide-up mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          Clinical Intelligence Dashboard
        </h1>
        <p className="text-text-secondary mt-1">AI-powered medical report analysis with clinical reasoning and explainable insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 fade-in">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card text-center !p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[0.65rem] text-text-muted uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category + KG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 fade-in">
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Insight Categories</h3>
          {Object.keys(catBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-text-secondary">{cat}</span>
                    <span className={`text-sm font-bold ${CATEGORY_TEXT[cat] || 'text-accent-blue'}`}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_COLORS[cat] || 'bg-accent-blue'} transition-all duration-1000`}
                      style={{ width: `${(count / maxCatCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-center py-8 text-sm">Upload a report to see category breakdown</p>
          )}
        </div>

        <div className="glass-card">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Knowledge Graph</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Nodes', value: a.knowledge_graph?.total_nodes ?? '100+', color: 'text-accent-blue' },
              { label: 'Relationships', value: a.knowledge_graph?.total_edges ?? '115+', color: 'text-accent-purple' },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-white/[0.03]">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[0.65rem] text-text-muted uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-accent-blue/80 bg-accent-blue/10 rounded-lg py-2 px-3">
            Diseases / Lab Tests / Symptoms / Medications
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="glass-card mb-6 fade-in">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Analysis Pipeline</h3>
        <div className="flex flex-wrap gap-2">
          {['PDF Upload', 'OCR Extraction', 'NLP Processing', 'Abnormal Detection',
            'Clinical Reasoning', 'Risk Scoring', 'Knowledge Graph', 'Report Generation'].map((stage, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-green/30 text-accent-green text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              {stage}
            </div>
          ))}
        </div>
        <p className="text-text-muted text-xs mt-3">8-stage multimodal pipeline | 50+ lab tests | 13 clinical rules | Explainable AI</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 fade-in">
        <Link to="/upload" className="glass-card text-center hover:border-accent-blue/40 cursor-pointer group">
          <div className="text-accent-blue text-sm font-semibold mb-1 group-hover:text-accent-blue/80 transition">Upload Report</div>
          <p className="text-text-muted text-xs mb-3">Upload PDF for AI analysis</p>
          <span className="inline-block px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-medium">
            Upload
          </span>
        </Link>
        <Link to="/drug-interactions" className="glass-card text-center hover:border-accent-purple/40 cursor-pointer group">
          <div className="text-accent-purple text-sm font-semibold mb-1">Drug Checker</div>
          <p className="text-text-muted text-xs mb-3">Check drug interactions</p>
          <span className="inline-block px-4 py-1.5 rounded-lg border border-border-subtle text-text-secondary text-xs font-medium hover:bg-white/5">
            Check
          </span>
        </Link>
        <div className="glass-card text-center">
          <div className="text-accent-teal text-sm font-semibold mb-1">Knowledge Graph</div>
          <p className="text-text-muted text-xs mb-3">Medical relationship mapping</p>
          <span className="inline-block px-3 py-1 rounded-lg bg-accent-blue/10 text-accent-blue text-xs">
            {a.knowledge_graph?.total_nodes ?? '100+'} nodes
          </span>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="glass-card fade-in">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Recent Reports</h3>

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="spinner" />
            <p className="text-text-muted text-sm">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-accent-orange text-sm mb-1">{error}</p>
            <p className="text-text-muted text-xs">
              Run <code className="text-accent-blue">uvicorn main:app --reload</code> in the backend directory
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted mb-3">No reports yet</p>
            <Link to="/upload">
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium hover:opacity-90 transition">
                Upload Your First Report
              </button>
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="text-text-primary font-medium">{report.filename}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-xs bg-accent-blue/15 text-accent-blue">
                      {(report.document_type || 'unknown').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      report.status === 'completed' ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-orange/15 text-accent-orange'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="text-text-muted text-sm">
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/report/${report.id}`}>
                        <button className="px-3 py-1 rounded-md text-xs border border-border-subtle text-text-secondary hover:bg-white/5 transition">
                          View
                        </button>
                      </Link>
                      <a href={getReportPdfUrl(report.id)} target="_blank" rel="noopener noreferrer">
                        <button className="px-3 py-1 rounded-md text-xs border border-accent-red/30 text-accent-red hover:bg-accent-red/10 transition">
                          PDF
                        </button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
