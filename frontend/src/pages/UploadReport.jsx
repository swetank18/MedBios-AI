import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReport } from '../api';

const PIPELINE_STAGES = [
  'Uploading PDF',
  'OCR Extraction',
  'NLP Processing',
  'Abnormal Detection',
  'Clinical Reasoning',
  'Risk Scoring',
  'Knowledge Graph',
  'Report Generation',
];

function UploadReport() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') setFile(droppedFile);
    else setError('Please upload a PDF file');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setCurrentStage(0);

    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
        clearInterval(stageInterval);
        return prev;
      });
    }, 1200);

    try {
      const data = await uploadReport(file, (p) => setProgress(p));
      clearInterval(stageInterval);
      setCurrentStage(PIPELINE_STAGES.length);
      setTimeout(() => {
        navigate(`/report/${data.report_id}`, { state: { analysisData: data } });
      }, 500);
    } catch (err) {
      clearInterval(stageInterval);
      setError(err.response?.data?.detail || 'Upload failed. Is the backend running?');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="slide-up mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          Upload Medical Report
        </h1>
        <p className="text-text-secondary mt-1">Upload a PDF lab report for AI-powered clinical analysis</p>
      </div>

      {!uploading ? (
        <div className="fade-in">
          {/* Drop zone */}
          <div
            className={`glass-card border-2 border-dashed text-center py-16 cursor-pointer transition-colors ${
              dragOver ? 'border-accent-blue bg-accent-blue/5' : 'border-border-subtle hover:border-text-muted'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent-blue/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-text-primary font-medium mb-1">
              {file ? file.name : 'Drop your PDF here or click to browse'}
            </p>
            <p className="text-text-muted text-sm">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supports lab reports, blood work, metabolic panels'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
              {error}
            </div>
          )}

          {file && (
            <button
              onClick={handleUpload}
              className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white font-medium hover:opacity-90 transition"
            >
              Analyze Report
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card fade-in">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Analysis Pipeline</h3>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < currentStage ? 'bg-accent-green text-white'
                  : i === currentStage ? 'bg-accent-blue text-white animate-pulse'
                  : 'bg-white/5 text-text-muted'
                }`}>
                  {i < currentStage ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${
                  i < currentStage ? 'text-accent-green' : i === currentStage ? 'text-accent-blue' : 'text-text-muted'
                }`}>
                  {stage}
                </span>
              </div>
            ))}
          </div>
          {progress > 0 && (
            <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadReport;
