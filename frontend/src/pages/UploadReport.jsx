import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReportPending, uploadBatch, openPipelineSocket, openBatchSocket } from '../api';
import { useToast } from '../components/ToastProvider';

// Stage definitions — order matches backend pipeline
const PIPELINE_STAGES = [
  {
    num: 1,
    label: 'OCR Extraction',
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  },
  {
    num: 2,
    label: 'NLP Parsing',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    num: 3,
    label: 'Abnormal Detection',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  {
    num: 4,
    label: 'Clinical Reasoning',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  {
    num: 5,
    label: 'Risk Scoring',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    num: 6,
    label: 'Knowledge Graph',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
  {
    num: 7,
    label: 'Explainability',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    num: 8,
    label: 'Report Generation',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
];

function initialStageStatuses() {
  return Object.fromEntries(PIPELINE_STAGES.map((s) => [s.num, 'pending']));
}

function StagePill({ stage, status, message }) {
  const isCompleted = status === 'completed';
  const isRunning = status === 'running';
  const isError = status === 'error';

  let bgClass = 'bg-white/5 border-border-subtle text-text-muted';
  if (isCompleted) bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  if (isRunning) bgClass = 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
  if (isError) bgClass = 'bg-orange-500/10 border-orange-500/30 text-orange-400';

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 ${bgClass}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isCompleted
            ? 'bg-emerald-500 text-white'
            : isRunning
            ? 'bg-accent-blue text-white'
            : isError
            ? 'bg-orange-500 text-white'
            : 'bg-white/5 text-text-muted'
        }`}
      >
        {isCompleted ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : isRunning ? (
          <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : isError ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ) : (
          <span className="text-xs font-bold">{stage.num}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight ${
            isCompleted ? 'text-emerald-400' : isRunning ? 'text-accent-blue' : isError ? 'text-orange-400' : 'text-text-muted'
          }`}
        >
          {stage.label}
        </p>
        {(isRunning || isError || isCompleted) && message && (
          <p className="text-xs mt-0.5 opacity-75 truncate">{message}</p>
        )}
      </div>
      {isCompleted && <span className="text-xs font-medium text-emerald-500/80 shrink-0">Done</span>}
      {isError && <span className="text-xs font-medium text-orange-500/80 shrink-0">Warn</span>}
      {isRunning && <span className="text-xs font-medium text-accent-blue/80 shrink-0 animate-pulse">Running</span>}
    </div>
  );
}

// Per-file status color chip
function fileStatusColor(status) {
  if (status === 'completed') return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  if (status === 'running') return 'bg-accent-blue/15 border-accent-blue/30 text-accent-blue';
  if (status === 'error') return 'bg-red-500/15 border-red-500/30 text-red-400';
  return 'bg-white/5 border-border-subtle text-text-muted';
}

function MiniProgressBar({ progress, status }) {
  let barColor = 'bg-text-muted';
  if (status === 'completed') barColor = 'bg-emerald-500';
  else if (status === 'running') barColor = 'bg-accent-blue';
  else if (status === 'error') barColor = 'bg-red-500';

  return (
    <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden flex-1">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function UploadReport() {
  // ── mode ──────────────────────────────────────────────────
  const [mode, setMode] = useState('single'); // 'single' | 'batch'

  // ── single mode state ────────────────────────────────────
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [currentStageName, setCurrentStageName] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [stageStatuses, setStageStatuses] = useState(initialStageStatuses);
  const [stageMessages, setStageMessages] = useState({});
  const [error, setError] = useState(null);

  // ── batch mode state ─────────────────────────────────────
  const [batchFiles, setBatchFiles] = useState([]); // Array of File
  const [batchPhase, setBatchPhase] = useState('idle'); // idle | uploading | streaming | done
  const [batchUploadProgress, setBatchUploadProgress] = useState(0);
  const [batchOverallProgress, setBatchOverallProgress] = useState(0);
  const [batchCompleted, setBatchCompleted] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  // per-file tracking: { [report_id]: { filename, status, progress, stage } }
  const [fileRows, setFileRows] = useState({});
  // completed report_ids for summary links
  const [doneReportIds, setDoneReportIds] = useState([]);
  const [batchError, setBatchError] = useState(null);

  const fileInputRef = useRef();
  const batchFileInputRef = useRef();
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Switch mode resets state
  const switchMode = (m) => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setMode(m);
    setFile(null);
    setPhase('idle');
    setError(null);
    setBatchFiles([]);
    setBatchPhase('idle');
    setBatchError(null);
    setFileRows({});
    setDoneReportIds([]);
    setBatchOverallProgress(0);
  };

  // ── Single mode handlers ─────────────────────────────────

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf' || droppedFile?.name?.endsWith('.pdf')) {
      setFile(droppedFile);
      setError(null);
      addToast(`Selected: ${droppedFile.name}`, 'success');
    } else {
      setError('Only PDF files are supported');
      addToast('Please upload a PDF file', 'error');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      addToast(`Selected: ${selected.name}`, 'success');
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setPhase('uploading');
    setError(null);
    setUploadProgress(0);
    setPipelineProgress(0);
    setStageStatuses(initialStageStatuses());
    setStageMessages({});
    addToast('Uploading report...', 'info');

    let reportId;
    try {
      const data = await uploadReportPending(file, (p) => setUploadProgress(p));
      reportId = data.report_id;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Is the backend running?';
      setError(msg);
      addToast(msg, 'error');
      setPhase('idle');
      return;
    }

    setPhase('streaming');
    addToast('Analysis pipeline started — streaming progress...', 'info');

    const ws = openPipelineSocket(reportId);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }

      if (data.error) {
        setError(data.error);
        addToast(data.error, 'error');
        setPhase('idle');
        ws.close();
        return;
      }

      const { stage, name, status, progress, message } = data;
      setPipelineProgress(progress ?? 0);
      setCurrentStageName(name ?? '');
      setCurrentMessage(message ?? '');

      if (stage) {
        setStageStatuses((prev) => ({ ...prev, [stage]: status }));
        setStageMessages((prev) => ({ ...prev, [stage]: message }));
      }

      if (data.done) {
        setPhase('done');
        addToast('Analysis complete! Redirecting...', 'success');
        setTimeout(() => navigate(`/report/${reportId}`), 1200);
      }
    };

    ws.onerror = () => {
      const msg = 'WebSocket connection error. Is the backend running?';
      setError(msg);
      addToast(msg, 'error');
      setPhase('idle');
    };

    ws.onclose = (e) => {
      if (phase !== 'done' && e.code !== 1000) {
        setError('Pipeline connection closed unexpectedly.');
        setPhase('idle');
      }
    };
  };

  const overallProgress =
    phase === 'uploading'
      ? Math.round(uploadProgress * 0.08)
      : phase === 'streaming' || phase === 'done'
      ? Math.round(8 + pipelineProgress * 0.92)
      : 0;

  const isProcessing = phase === 'uploading' || phase === 'streaming' || phase === 'done';

  // ── Batch mode handlers ──────────────────────────────────

  const handleBatchDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
    );
    if (dropped.length === 0) {
      setBatchError('Only PDF files are supported');
      return;
    }
    setBatchFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...dropped.filter((f) => !existing.has(f.name))];
    });
    setBatchError(null);
  };

  const handleBatchFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setBatchFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...selected.filter((f) => !existing.has(f.name))];
    });
    setBatchError(null);
    e.target.value = '';
  };

  const removeBatchFile = (name) => {
    setBatchFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;

    setBatchPhase('uploading');
    setBatchError(null);
    setBatchUploadProgress(0);
    setBatchOverallProgress(0);
    setBatchCompleted(0);
    setFileRows({});
    setDoneReportIds([]);
    addToast(`Uploading ${batchFiles.length} reports...`, 'info');

    let batchData;
    try {
      batchData = await uploadBatch(batchFiles, {}, (p) => setBatchUploadProgress(p));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Batch upload failed. Is the backend running?';
      setBatchError(msg);
      addToast(msg, 'error');
      setBatchPhase('idle');
      return;
    }

    const { batch_id, reports } = batchData;
    const total = reports.length;
    setBatchTotal(total);

    // Initialise file rows from upload response
    const initialRows = {};
    reports.forEach(({ report_id, filename }) => {
      initialRows[report_id] = { filename, status: 'pending', progress: 0, stage: 0 };
    });
    setFileRows(initialRows);

    setBatchPhase('streaming');
    addToast('Batch pipeline started — processing concurrently...', 'info');

    const ws = openBatchSocket(batch_id);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }

      if (data.error && !data.report_id) {
        setBatchError(data.error);
        addToast(data.error, 'error');
        setBatchPhase('idle');
        ws.close();
        return;
      }

      // Per-file progress
      if (data.report_id) {
        setFileRows((prev) => ({
          ...prev,
          [data.report_id]: {
            ...prev[data.report_id],
            status: data.done
              ? data.status === 'error' ? 'error' : 'completed'
              : 'running',
            progress: data.progress ?? prev[data.report_id]?.progress ?? 0,
            stage: data.stage ?? prev[data.report_id]?.stage ?? 0,
          },
        }));
        if (data.done && data.status !== 'error') {
          setDoneReportIds((prev) => [...prev, data.report_id]);
        }
      }

      // Overall batch progress
      if (data.batch_progress !== undefined) {
        setBatchOverallProgress(data.batch_progress);
        setBatchCompleted(data.completed ?? 0);
      }

      // All done
      if (data.batch_done) {
        setBatchPhase('done');
        addToast(`Batch complete — ${total} reports analysed!`, 'success');
      }
    };

    ws.onerror = () => {
      const msg = 'Batch WebSocket error. Is the backend running?';
      setBatchError(msg);
      addToast(msg, 'error');
      setBatchPhase('idle');
    };

    ws.onclose = (e) => {
      if (batchPhase !== 'done' && e.code !== 1000) {
        setBatchError('Batch connection closed unexpectedly.');
      }
    };
  };

  const isBatchProcessing = batchPhase === 'uploading' || batchPhase === 'streaming' || batchPhase === 'done';

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 page-enter">
      {/* Header */}
      <div className="slide-up mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 border border-accent-blue/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold med-gradient-text">Upload Medical Report</h1>
            <p className="text-text-secondary text-sm">Upload PDF lab reports for AI-powered clinical analysis</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-bg-elevated border border-border-subtle w-fit">
          <button
            onClick={() => switchMode('single')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'single'
                ? 'bg-accent-blue text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Single Report
          </button>
          <button
            onClick={() => switchMode('batch')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'batch'
                ? 'bg-accent-blue text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Batch Upload
          </button>
        </div>
      </div>

      {/* ── Single mode ─────────────────────────────────────── */}
      {mode === 'single' && (
        <>
          {!isProcessing ? (
            <div className="stagger-children space-y-4">
              {/* Drop zone */}
              <div
                className={`glass-card border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-accent-blue bg-accent-blue/5 scale-[1.01]'
                    : file
                    ? 'border-accent-green/40 bg-accent-green/5'
                    : 'border-border-subtle hover:border-text-muted'
                }`}
                style={{ padding: file ? '2rem' : '3.5rem 2rem' }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {!file ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-accent-blue/10 flex items-center justify-center float-anim">
                      <svg className="w-10 h-10 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-text-primary font-semibold text-lg mb-1">Drop your lab report here</p>
                    <p className="text-text-muted text-sm mb-4">PDF format supported — up to 50MB</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Blood Work', 'Metabolic Panel', 'CBC', 'Lipid Profile', 'Thyroid', 'Kidney Function'].map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-bg-elevated/50 border border-border-subtle text-text-muted text-xs font-medium">{t}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-accent-green/15 flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-text-primary font-medium truncate">{file.name}</p>
                      <p className="text-text-muted text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF Document</p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="w-8 h-8 rounded-lg hover:bg-accent-red/15 flex items-center justify-center text-text-muted hover:text-accent-red transition shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {file && (
                <button
                  onClick={handleUpload}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-accent-blue/20 text-base"
                >
                  Analyze Report with AI
                </button>
              )}

              {/* Pipeline info pills */}
              <div className="glass-card !p-4">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Analysis Pipeline</h4>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE_STAGES.map((stage) => (
                    <div key={stage.num} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-subtle text-text-muted text-xs">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stage.icon} />
                      </svg>
                      {stage.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live pipeline progress */
            <div className="glass-card fade-in space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                    {phase === 'uploading' ? 'Uploading...' : phase === 'done' ? 'Analysis Complete' : 'Analysis Pipeline'}
                  </h3>
                  {currentStageName && phase === 'streaming' && (
                    <p className="text-xs text-text-muted mt-0.5">{currentStageName} — {currentMessage}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">{overallProgress}%</span>
              </div>

              <div className="h-2.5 rounded-full bg-bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                </div>
              </div>

              {phase === 'uploading' && (
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <svg className="w-4 h-4 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <div className="flex-1 h-1 rounded-full bg-bg-elevated overflow-hidden">
                    <div className="h-full rounded-full bg-accent-blue transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="w-8 text-right">{uploadProgress}%</span>
                </div>
              )}

              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage) => (
                  <StagePill key={stage.num} stage={stage} status={stageStatuses[stage.num]} message={stageMessages[stage.num]} />
                ))}
              </div>

              {phase === 'done' && (
                <div className="py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <p className="text-emerald-400 font-semibold">Analysis Complete</p>
                  <p className="text-text-muted text-xs mt-1">Redirecting to results...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Batch mode ──────────────────────────────────────── */}
      {mode === 'batch' && (
        <>
          {!isBatchProcessing ? (
            <div className="stagger-children space-y-4">
              {/* Batch drop zone */}
              <div
                className={`glass-card border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-accent-blue bg-accent-blue/5 scale-[1.01]'
                    : batchFiles.length > 0
                    ? 'border-accent-blue/30 bg-accent-blue/5'
                    : 'border-border-subtle hover:border-text-muted'
                }`}
                style={{ padding: '2rem' }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleBatchDrop}
                onClick={() => batchFileInputRef.current?.click()}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-accent-blue/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-text-primary font-semibold mb-1">Drop multiple PDF reports here</p>
                <p className="text-text-muted text-sm">Up to 20 files · 50MB each — processed concurrently</p>
                <input
                  ref={batchFileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={handleBatchFileSelect}
                />
              </div>

              {/* File chips list */}
              {batchFiles.length > 0 && (
                <div className="glass-card !p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      {batchFiles.length} file{batchFiles.length !== 1 ? 's' : ''} selected
                    </h4>
                    <button
                      onClick={() => setBatchFiles([])}
                      className="text-xs text-text-muted hover:text-accent-red transition"
                    >
                      Clear all
                    </button>
                  </div>
                  {batchFiles.map((f) => (
                    <div
                      key={f.name}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-elevated border border-border-subtle"
                    >
                      <svg className="w-4 h-4 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="flex-1 text-sm text-text-primary truncate">{f.name}</span>
                      <span className="text-xs text-text-muted shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBatchFile(f.name); }}
                        className="w-6 h-6 rounded-md hover:bg-accent-red/15 flex items-center justify-center text-text-muted hover:text-accent-red transition shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {batchError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {batchError}
                </div>
              )}

              {batchFiles.length > 0 && (
                <button
                  onClick={handleBatchUpload}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-accent-blue/20 text-base"
                >
                  Analyze {batchFiles.length} Report{batchFiles.length !== 1 ? 's' : ''} with AI
                </button>
              )}
            </div>
          ) : (
            /* Batch live progress */
            <div className="glass-card fade-in space-y-5">
              {/* Overall progress header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                    {batchPhase === 'uploading'
                      ? 'Uploading files...'
                      : batchPhase === 'done'
                      ? 'Batch Complete'
                      : `Processing ${batchTotal} reports concurrently`}
                  </h3>
                  {batchPhase === 'streaming' && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {batchCompleted} of {batchTotal} completed
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">
                  {batchPhase === 'uploading' ? `${batchUploadProgress}%` : `${batchOverallProgress}%`}
                </span>
              </div>

              {/* Overall progress bar */}
              <div className="h-2.5 rounded-full bg-bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${batchPhase === 'uploading' ? batchUploadProgress : batchOverallProgress}%`,
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Per-file rows */}
              {Object.keys(fileRows).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(fileRows).map(([reportId, row]) => (
                    <div
                      key={reportId}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 ${fileStatusColor(row.status)}`}
                    >
                      {/* Status icon */}
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                        {row.status === 'completed' ? (
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : row.status === 'running' ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
                        ) : row.status === 'error' ? (
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-text-muted/40" />
                        )}
                      </div>

                      {/* Filename */}
                      <span className="text-sm truncate flex-1 min-w-0">{row.filename}</span>

                      {/* Mini progress bar */}
                      <div className="w-24 shrink-0">
                        <MiniProgressBar progress={row.progress} status={row.status} />
                      </div>

                      {/* Stage label */}
                      <span className="text-xs shrink-0 w-8 text-right tabular-nums">
                        {row.status === 'completed' ? '100%' : row.status === 'pending' ? '—' : `${row.progress}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Done summary */}
              {batchPhase === 'done' && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3">
                  <p className="text-emerald-400 font-semibold text-center">
                    Batch Analysis Complete — {doneReportIds.length} / {batchTotal} succeeded
                  </p>
                  {doneReportIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {doneReportIds.map((rid, i) => (
                        <button
                          key={rid}
                          onClick={() => navigate(`/report/${rid}`)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition"
                        >
                          Report {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UploadReport;
