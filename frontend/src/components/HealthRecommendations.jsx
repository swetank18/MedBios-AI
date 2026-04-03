import { useState, useEffect } from 'react';

const URGENCY_STYLES = {
  high:     { border: 'border-l-accent-red',    badge: 'bg-accent-red text-white',    text: 'text-accent-red',    bg: 'bg-accent-red/8' },
  moderate: { border: 'border-l-accent-orange', badge: 'bg-accent-orange text-white', text: 'text-accent-orange', bg: 'bg-accent-orange/8' },
  low:      { border: 'border-l-accent-green',  badge: 'bg-accent-green text-white',  text: 'text-accent-green',  bg: 'bg-accent-green/8' },
};

const URGENCY_TIMELINE = {
  high: 'This Week',
  moderate: 'This Month',
  low: '3 Months',
};

const TABS = [
  { key: 'diet',        label: 'Diet',        icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z', color: 'text-accent-green' },
  { key: 'exercise',    label: 'Exercise',    icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-accent-blue' },
  { key: 'supplements', label: 'Supplements', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-accent-purple' },
  { key: 'followup',    label: 'Follow-up',   icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-accent-orange' },
];

const TIMELINE_ORDER = ['This Week', 'This Month', '3 Months'];

function CompletionRing({ pct, size = 48 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-bg-secondary" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="currentColor" strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="text-accent-green transition-all duration-700"
      />
    </svg>
  );
}

function RecCard({ rec, index, done, onToggle }) {
  const [activeTab, setActiveTab] = useState('diet');
  const style = URGENCY_STYLES[rec.urgency] || URGENCY_STYLES.low;

  // Auto-select first tab that has content
  useEffect(() => {
    const first = TABS.find(t => rec[t.key]?.length > 0);
    if (first) setActiveTab(first.key);
  }, [rec]);

  const activeItems = rec[activeTab] || [];

  return (
    <div className={`relative glass-card border-l-4 ${style.border} transition-all ${done ? 'opacity-60' : ''}`}>
      {/* Done overlay */}
      {done && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none z-10">
          <div className="bg-accent-green/15 rounded-full p-3">
            <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-7 h-7 rounded-lg ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <span className={`text-xs font-bold ${style.text}`}>{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-text-primary text-sm">{rec.condition}</h4>
            <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wide ${style.badge}`}>
              {rec.urgency}
            </span>
            {rec.value && (
              <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-mono border ${style.border} ${style.text} bg-bg-secondary`}>
                {rec.test}: {rec.value}
              </span>
            )}
          </div>
          <p className="text-text-muted text-xs mt-0.5">{URGENCY_TIMELINE[rec.urgency] || '3 Months'} priority</p>
        </div>
        {/* Mark done button */}
        <button
          onClick={() => onToggle(index)}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.6rem] font-medium transition border ${
            done
              ? 'bg-accent-green/15 text-accent-green border-accent-green/30 hover:bg-accent-green/25'
              : 'bg-bg-secondary text-text-muted border-border-subtle hover:border-accent-green hover:text-accent-green'
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {done ? 'Done' : 'Mark Done'}
        </button>
      </div>

      {/* Mini tab bar */}
      <div className="flex gap-1 mb-3 border-b border-border-subtle pb-2">
        {TABS.map(tab => {
          const hasContent = rec[tab.key]?.length > 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              disabled={!hasContent}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[0.6rem] font-medium transition ${
                activeTab === tab.key
                  ? `${tab.color} bg-bg-secondary`
                  : hasContent
                    ? 'text-text-muted hover:text-text-secondary'
                    : 'text-text-muted opacity-30 cursor-not-allowed'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <ul className="space-y-1.5 pl-4 min-h-[40px]">
        {activeItems.length > 0 ? activeItems.map((item, j) => (
          <li key={j} className="text-sm text-text-secondary relative before:absolute before:left-[-10px] before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-text-muted/50">
            {item}
          </li>
        )) : (
          <li className="text-xs text-text-muted italic">No items for this category.</li>
        )}
      </ul>
    </div>
  );
}

function HealthRecommendations({ recommendations = {} }) {
  const recs = recommendations.recommendations || [];
  const summary = recommendations.summary || '';

  // Progress state — persisted per report
  const storageKey = `medbios_rec_progress_${recommendations.reportId || 'default'}`;
  const [doneSet, setDoneSet] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [timelineFilter, setTimelineFilter] = useState('All');
  const [exportCopied, setExportCopied] = useState(false);

  const toggleDone = (index) => {
    setDoneSet(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  if (!recs.length) {
    return (
      <div className="glass-card text-center py-12">
        <svg className="w-12 h-12 mx-auto text-accent-green mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-text-secondary font-medium">All Clear</p>
        <p className="text-text-muted text-sm mt-1">No specific recommendations — maintain your healthy lifestyle!</p>
      </div>
    );
  }

  // Counts
  const highCount = recs.filter(r => r.urgency === 'high').length;
  const modCount  = recs.filter(r => r.urgency === 'moderate').length;
  const lowCount  = recs.filter(r => r.urgency === 'low').length;
  const actionedCount = doneSet.size;
  const pct = recs.length > 0 ? Math.round((actionedCount / recs.length) * 100) : 0;

  // Category counts for top row
  const dietCount = recs.filter(r => r.diet?.length > 0).length;
  const lifestyleCount = recs.filter(r => r.exercise?.length > 0).length;
  const medCount = recs.filter(r => r.followup?.length > 0 || r.supplements?.length > 0).length;

  // Group recs by timeline
  const grouped = {};
  recs.forEach((rec, i) => {
    const bucket = URGENCY_TIMELINE[rec.urgency] || '3 Months';
    if (!grouped[bucket]) grouped[bucket] = [];
    grouped[bucket].push({ rec, index: i });
  });

  const handleExport = () => {
    const lines = [];
    lines.push('MedBios AI — Health Recommendations');
    lines.push('='.repeat(40));
    lines.push(summary);
    lines.push('');
    recs.forEach((rec, i) => {
      lines.push(`${i + 1}. ${rec.condition} [${rec.urgency?.toUpperCase()}]`);
      if (rec.value) lines.push(`   Test: ${rec.test} = ${rec.value}`);
      if (rec.diet?.length)        lines.push(`   Diet: ${rec.diet.join('; ')}`);
      if (rec.exercise?.length)    lines.push(`   Exercise: ${rec.exercise.join('; ')}`);
      if (rec.supplements?.length) lines.push(`   Supplements: ${rec.supplements.join('; ')}`);
      if (rec.followup?.length)    lines.push(`   Follow-up: ${rec.followup.join('; ')}`);
      lines.push('');
    });
    lines.push('Generated by MedBios AI — For informational purposes only.');
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    });
  };

  const timelineBuckets = timelineFilter === 'All'
    ? TIMELINE_ORDER.filter(t => grouped[t])
    : [timelineFilter].filter(t => grouped[t]);

  return (
    <div className="space-y-5">
      {/* Summary Banner */}
      <div className="glass-card border border-accent-blue/20 bg-gradient-to-r from-accent-blue/5 to-accent-purple/5">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Completion Ring */}
          <div className="relative shrink-0">
            <CompletionRing pct={pct} size={52} />
            <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold text-text-primary">{pct}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-primary">AI Health Recommendations</h3>
            <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{summary}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-text-muted">{recs.length} total</span>
              {highCount > 0 && <span className="text-xs text-accent-red font-medium">{highCount} high urgency</span>}
              {modCount > 0 && <span className="text-xs text-accent-orange font-medium">{modCount} moderate</span>}
              <span className="text-xs text-accent-green font-medium">{actionedCount}/{recs.length} actioned</span>
            </div>
          </div>
          {/* Progress bar + export */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="w-32 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-blue transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.6rem] font-medium border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 transition"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {exportCopied ? 'Copied!' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Category overview row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Diet', count: dietCount, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Lifestyle', count: lifestyleCount, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
          { label: 'Medical', count: medCount, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
        ].map(cat => (
          <div key={cat.label} className={`rounded-xl ${cat.bg} px-3 py-2.5 text-center`}>
            <p className={`text-xl font-bold ${cat.color}`}>{cat.count}</p>
            <p className="text-xs text-text-secondary mt-0.5">{cat.label}</p>
          </div>
        ))}
      </div>

      {/* Urgency timeline filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...TIMELINE_ORDER].map(t => (
          <button
            key={t}
            onClick={() => setTimelineFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              timelineFilter === t
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white border-transparent'
                : 'border-border-subtle text-text-secondary hover:border-text-muted hover:bg-bg-secondary'
            }`}
          >
            {t}
            {t !== 'All' && grouped[t] && (
              <span className="ml-1.5 opacity-70">({grouped[t].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Recommendation cards grouped by timeline */}
      {timelineBuckets.map(bucket => (
        <div key={bucket}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className={`text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              bucket === 'This Week' ? 'bg-accent-red/10 text-accent-red' :
              bucket === 'This Month' ? 'bg-accent-orange/10 text-accent-orange' :
              'bg-accent-green/10 text-accent-green'
            }`}>{bucket}</span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>
          <div className="space-y-3">
            {grouped[bucket].map(({ rec, index }) => (
              <RecCard
                key={index}
                rec={rec}
                index={index}
                done={doneSet.has(index)}
                onToggle={toggleDone}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div className="text-center py-3">
        <p className="text-text-muted text-xs">
          These recommendations are AI-generated and for informational purposes only. Always consult your healthcare provider before making changes.
        </p>
      </div>
    </div>
  );
}

export default HealthRecommendations;
