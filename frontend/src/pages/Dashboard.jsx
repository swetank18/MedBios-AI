import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listReports, getAnalytics, getReportPdfUrl } from '../api';

const CATEGORY_COLORS = {
  Hematology: '#ef4444',
  Cardiovascular: '#f97316',
  Nephrology: '#eab308',
  Endocrinology: '#22c55e',
  Hepatology: '#14b8a6',
  Electrolytes: '#0ea5e9',
  Immunology: '#8b5cf6',
  Nutrition: '#ec4899',
};

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportData, analyticsData] = await Promise.all([
        listReports(),
        getAnalytics().catch(() => null),
      ]);
      setReports(reportData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Could not connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const a = analytics || {};
  const catBreakdown = a.category_breakdown || {};
  const maxCatCount = Math.max(...Object.values(catBreakdown), 1);

  return (
    <div className="page-container">
      <div className="page-header slide-up">
        <h1>Clinical Intelligence Dashboard</h1>
        <p>AI-powered medical report analysis with clinical reasoning and explainable insights</p>
      </div>

      {/* Stats Overview — Live from DB */}
      <div className="grid-3 fade-in" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { value: a.total_reports ?? reports.length, label: 'Reports Analyzed', icon: '📊', color: '#0ea5e9' },
          { value: a.total_patients ?? '—', label: 'Patients Tracked', icon: '👤', color: '#8b5cf6' },
          { value: a.total_lab_tests ?? '—', label: 'Lab Tests Processed', icon: '🧪', color: '#22c55e' },
          { value: a.total_insights ?? '—', label: 'Clinical Insights', icon: '💡', color: '#f97316' },
          { value: a.abnormal_count ?? '—', label: 'Abnormal Values', icon: '⚠️', color: '#ef4444' },
          { value: a.avg_risk_score ? `${a.avg_risk_score}%` : '—', label: 'Avg Risk Score', icon: '🎯', color: '#ec4899' },
        ].map((stat, i) => (
          <div key={i} className="glass-card stat-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div className="stat-value" style={{ color: stat.color, fontSize: '1.8rem' }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category Breakdown + Knowledge Graph Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 24 }}>
        {/* Category Breakdown */}
        <div className="glass-card fade-in">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>📈</div>
            <h3>Insight Categories</h3>
          </div>
          {Object.keys(catBreakdown).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(catBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{cat}</span>
                      <span style={{ color: CATEGORY_COLORS[cat] || 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {count}
                      </span>
                    </div>
                    <div style={{
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(count / maxCatCount) * 100}%`,
                        borderRadius: 3,
                        background: CATEGORY_COLORS[cat] || '#0ea5e9',
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
              Upload a report to see category breakdown
            </p>
          )}
        </div>

        {/* Knowledge Graph + Quick Stats */}
        <div className="glass-card fade-in">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>🧠</div>
            <h3>Knowledge Graph</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {[
              { label: 'Nodes', value: a.knowledge_graph?.total_nodes ?? '100+', color: '#0ea5e9' },
              { label: 'Relationships', value: a.knowledge_graph?.total_edges ?? '115+', color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="badge badge-info" style={{ display: 'block', textAlign: 'center' }}>
            Diseases • Lab Tests • Symptoms • Medications
          </div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>🔬</div>
          <h3>Analysis Pipeline</h3>
        </div>
        <div className="pipeline-stages">
          {['PDF Upload', 'OCR Extraction', 'NLP Processing', 'Abnormal Detection',
            'Clinical Reasoning', 'Risk Scoring', 'Knowledge Graph', 'Report Generation'].map((stage, i) => (
            <div key={i} className="pipeline-stage completed">
              <span className="stage-dot"></span>
              {stage}
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12 }}>
          8-stage multimodal pipeline • 50+ lab tests • 13 clinical rules • Explainable AI
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: 24 }}>
        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
            <h3 style={{ marginBottom: 6 }}>Upload Report</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Upload PDF for AI analysis
            </p>
            <button className="btn btn-primary" style={{ marginTop: 12, fontSize: '0.85rem' }}>
              Upload →
            </button>
          </div>
        </Link>
        <Link to="/drug-interactions" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ cursor: 'pointer', textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>💊</div>
            <h3 style={{ marginBottom: 6 }}>Drug Checker</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Check drug interactions
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 12, fontSize: '0.85rem' }}>
              Check →
            </button>
          </div>
        </Link>
        <div className="glass-card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧠</div>
          <h3 style={{ marginBottom: 6 }}>Knowledge Graph</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Medical relationship mapping
          </p>
          <div className="badge badge-info" style={{ marginTop: 12 }}>
            {a.knowledge_graph?.total_nodes ?? '100+'} nodes
          </div>
        </div>
      </div>

      {/* Recent Reports with PDF Download */}
      <div className="glass-card fade-in">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>📋</div>
          <h3>Recent Reports</h3>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--status-low)', marginBottom: 8 }}>⚠️ {error}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Run <code style={{ color: 'var(--text-accent)' }}>uvicorn main:app --reload</code> in the backend directory
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 12 }}>No reports yet</p>
            <Link to="/upload">
              <button className="btn btn-primary">Upload Your First Report</button>
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
                  <td>{report.filename}</td>
                  <td>
                    <span className="badge badge-info">
                      {(report.document_type || 'unknown').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.status === 'completed' ? 'normal' : 'low'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/report/${report.id}`}>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          View →
                        </button>
                      </Link>
                      <a href={getReportPdfUrl(report.id)} target="_blank" rel="noopener noreferrer">
                        <button className="btn btn-secondary" style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          background: 'rgba(239,68,68,0.12)',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)',
                        }}>
                          📥 PDF
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
