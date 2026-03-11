import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadReport } from '../api';

const PIPELINE_STAGES = [
  'PDF Upload', 'OCR Extraction', 'NLP Processing', 'Abnormal Detection',
  'Clinical Reasoning', 'Risk Scoring', 'Knowledge Graph', 'Report Generation',
];

function UploadReport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(-1);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    // Simulate pipeline stages
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      const data = await uploadReport(file, (uploadPct) => {
        setProgress(Math.max(uploadPct * 0.3, progress)); // Upload is 30% of total
      });

      clearInterval(stageInterval);
      setCurrentStage(PIPELINE_STAGES.length - 1);
      setProgress(100);
      setResult(data);

      // Navigate to results after a brief delay
      setTimeout(() => {
        if (data.report_id) {
          navigate(`/report/${data.report_id}`, { state: { analysisData: data } });
        }
      }, 1500);
    } catch (err) {
      clearInterval(stageInterval);
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Analysis failed. Please check the backend server.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header slide-up">
        <h1>Upload Medical Report</h1>
        <p>Upload a PDF lab report for comprehensive AI-powered clinical analysis</p>
      </div>

      {/* Upload Zone */}
      {!result && (
        <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
          >
            <input {...getInputProps()} id="file-upload" />
            <div className="upload-icon">
              {file ? '📋' : '📄'}
            </div>
            {file ? (
              <>
                <h3>{file.name}</h3>
                <p>{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <h3>
                  {isDragActive ? 'Drop your report here' : 'Drag & drop a medical report PDF'}
                </h3>
                <p>or click to browse • Supports lab reports, radiology, prescriptions</p>
              </>
            )}
          </div>

          {file && !uploading && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleUpload} id="analyze-btn">
                🔬 Analyze Report
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setFile(null)}
                style={{ marginLeft: 12 }}
              >
                Change File
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Status */}
      {(uploading || result) && (
        <div className="glass-card fade-in" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
              {result ? '✅' : '⚡'}
            </div>
            <h3>{result ? 'Analysis Complete' : 'Processing...'}</h3>
          </div>

          <div className="pipeline-stages">
            {PIPELINE_STAGES.map((stage, i) => (
              <div
                key={i}
                className={`pipeline-stage ${
                  i <= currentStage ? (i < currentStage || result ? 'completed' : 'active') : ''
                }`}
              >
                <span className="stage-dot"></span>
                {stage}
              </div>
            ))}
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${result ? 100 : Math.min(progress + currentStage * 12, 95)}%` }}></div>
          </div>

          {result && (
            <div style={{ marginTop: 16 }}>
              <div className="grid-3" style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                    {result.lab_values?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lab Values Extracted</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-high)' }}>
                    {result.abnormal_count || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Abnormal Values</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-critical)' }}>
                    {result.insights?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clinical Insights</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                ⏱ Processed in {result.processing_time_s?.toFixed(2)}s • Redirecting to full results...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card fade-in" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <p style={{ color: 'var(--status-critical)' }}>❌ {error}</p>
          <button className="btn btn-secondary" onClick={() => { setError(null); setFile(null); }} style={{ marginTop: 12 }}>
            Try Again
          </button>
        </div>
      )}

      {/* Supported Types Info */}
      {!uploading && !result && (
        <div className="grid-2 fade-in">
          <div className="glass-card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>✅</div>
              <h3>Supported Documents</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
              {['Lab Reports (CBC, Metabolic Panel, Lipid)', 'Radiology Reports', 'Prescriptions', 'Clinical Notes', 'Discharge Summaries'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--status-normal)' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>🔬</div>
              <h3>What You Get</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
              {['Extracted lab values with reference ranges', 'Abnormal value detection & severity', 'Clinical reasoning insights', 'Risk scores per organ system', 'Knowledge graph connections', 'Physician-ready clinical summary'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-accent)' }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadReport;
