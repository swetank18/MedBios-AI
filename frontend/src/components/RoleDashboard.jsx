import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

/* ─── Role color config ─── */
const ROLE_CONFIG = {
  Physician: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    accent: 'border-emerald-500/20',
    glow: 'from-emerald-500/[0.06]',
    dot: 'bg-emerald-400',
  },
  Nurse: {
    badge: 'bg-accent-blue/15 text-accent-blue border-accent-blue/25',
    accent: 'border-accent-blue/20',
    glow: 'from-accent-blue/[0.06]',
    dot: 'bg-accent-blue',
  },
  'Lab Technician': {
    badge: 'bg-accent-purple/15 text-accent-purple border-accent-purple/25',
    accent: 'border-accent-purple/20',
    glow: 'from-accent-purple/[0.06]',
    dot: 'bg-accent-purple',
  },
  Researcher: {
    badge: 'bg-accent-orange/15 text-accent-orange border-accent-orange/25',
    accent: 'border-accent-orange/20',
    glow: 'from-accent-orange/[0.06]',
    dot: 'bg-accent-orange',
  },
  'Medical Student': {
    badge: 'bg-accent-teal/15 text-accent-teal border-accent-teal/25',
    accent: 'border-accent-teal/20',
    glow: 'from-accent-teal/[0.06]',
    dot: 'bg-accent-teal',
  },
  Patient: {
    badge: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
    accent: 'border-pink-500/20',
    glow: 'from-pink-500/[0.06]',
    dot: 'bg-pink-400',
  },
};

/* ─── Quick action button ─── */
function ActionBtn({ to, label, color }) {
  const cls = {
    blue:    'bg-accent-blue/10 border-accent-blue/25 text-accent-blue hover:bg-accent-blue/20',
    purple:  'bg-accent-purple/10 border-accent-purple/25 text-accent-purple hover:bg-accent-purple/20',
    green:   'bg-accent-green/10 border-accent-green/25 text-accent-green hover:bg-accent-green/20',
    teal:    'bg-accent-teal/10 border-accent-teal/25 text-accent-teal hover:bg-accent-teal/20',
    orange:  'bg-accent-orange/10 border-accent-orange/25 text-accent-orange hover:bg-accent-orange/20',
    pink:    'bg-pink-500/10 border-pink-500/25 text-pink-400 hover:bg-pink-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20',
  }[color] || 'bg-accent-blue/10 border-accent-blue/25 text-accent-blue hover:bg-accent-blue/20';

  return (
    <Link to={to}>
      <button className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${cls}`}>
        {label}
      </button>
    </Link>
  );
}

/* ─── Role panels ─── */

function PhysicianPanel({ cfg }) {
  const recentReports = JSON.parse(localStorage.getItem('medbios_recent_count') || '0');
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Quick Actions</span>
        <ActionBtn to="/upload" label="Upload Report" color="blue" />
        <ActionBtn to="/drug-interactions" label="Drug Checker" color="purple" />
        <ActionBtn to="/" label="View Trends" color="green" />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400 tabular-nums leading-none">—</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Total Reports</div>
        </div>
        <div className="w-px h-8 bg-border-subtle" />
        <div className="text-center">
          <div className="text-lg font-bold text-accent-orange tabular-nums leading-none">—</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Critical Alerts</div>
        </div>
      </div>
    </div>
  );
}

function NursePanel({ cfg }) {
  const raw = localStorage.getItem('medbios_reports_cache');
  let recent = [];
  try { recent = JSON.parse(raw || '[]').slice(0, 3); } catch {}
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Quick Actions</span>
        <ActionBtn to="/upload" label="Upload Report" color="blue" />
        <ActionBtn to="/" label="Patient Vitals" color="teal" />
      </div>
      <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
        <svg className="w-3.5 h-3.5 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{recent.length > 0 ? `${recent.length} recent patient record(s)` : 'No recent patient activity'}</span>
      </div>
    </div>
  );
}

function LabTechPanel({ cfg }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Quick Actions</span>
        <ActionBtn to="/upload" label="Upload Report" color="purple" />
        <ActionBtn to="/" label="View All Results" color="teal" />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-center">
          <div className="text-lg font-bold text-accent-purple tabular-nums leading-none">—</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Pending Queue</div>
        </div>
        <div className="w-px h-8 bg-border-subtle" />
        <div className="text-center">
          <div className="text-lg font-bold text-accent-orange tabular-nums leading-none">—</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Abnormal Rate</div>
        </div>
      </div>
    </div>
  );
}

function ResearcherPanel({ cfg }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Quick Actions</span>
        <ActionBtn to="/" label="Export Data" color="orange" />
        <ActionBtn to="/" label="View Trends" color="teal" />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-center">
          <div className="text-lg font-bold text-accent-orange tabular-nums leading-none">—</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Tests Analyzed</div>
        </div>
        <div className="w-px h-8 bg-border-subtle" />
        <div className="text-center">
          <div className="text-lg font-bold text-accent-teal tabular-nums leading-none">—</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Unique Patients</div>
        </div>
        <div className="w-px h-8 bg-border-subtle" />
        <div className="text-center">
          <div className="text-[0.65rem] font-medium text-text-muted leading-none">All time</div>
          <div className="text-[0.6rem] text-text-muted uppercase tracking-wider mt-0.5">Date Range</div>
        </div>
      </div>
    </div>
  );
}

function MedStudentPanel({ cfg }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent-teal/15 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-xs text-accent-teal font-medium">
          You are in <span className="font-bold">learning mode</span> — clinical explanations are expanded by default.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <ActionBtn to="/upload" label="Upload Sample Report" color="teal" />
        <ActionBtn to="/drug-interactions" label="Drug Checker" color="purple" />
      </div>
    </div>
  );
}

function PatientPanel({ cfg, userName }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-pink-400">Your Health Summary</p>
          <p className="text-[0.65rem] text-text-muted">Showing your personal reports only</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-green/25 bg-accent-green/10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <span className="text-xs text-accent-green font-medium">Good</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-orange/25 bg-accent-orange/10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
          <span className="text-xs text-accent-orange font-medium">Needs Attention</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-red/25 bg-accent-red/10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
          <span className="text-xs text-accent-red font-medium">Critical</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export default function RoleDashboard() {
  const { user } = useAuth();
  const role = user?.role || 'Physician';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.Physician;

  const panelMap = {
    Physician:        <PhysicianPanel cfg={cfg} />,
    Nurse:            <NursePanel cfg={cfg} />,
    'Lab Technician': <LabTechPanel cfg={cfg} />,
    Researcher:       <ResearcherPanel cfg={cfg} />,
    'Medical Student':<MedStudentPanel cfg={cfg} />,
    Patient:          <PatientPanel cfg={cfg} userName={user?.name} />,
  };

  return (
    <div className={`relative mb-6 rounded-xl border ${cfg.accent} bg-bg-card/60 px-5 py-4 slide-up`}>
      {/* Subtle gradient glow */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${cfg.glow} to-transparent pointer-events-none`} />

      <div className="relative flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {role}
          </span>
          <span className="text-[0.65rem] text-text-muted">
            {role === 'Patient'
              ? 'Personal health portal'
              : role === 'Medical Student'
              ? 'Learning mode active'
              : 'Role-based workspace'}
          </span>
        </div>

        {/* Role-specific content */}
        {panelMap[role] || panelMap.Physician}
      </div>
    </div>
  );
}
