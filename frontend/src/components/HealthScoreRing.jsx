import { useEffect, useRef, useState } from 'react';

function HealthScoreRing({ score = 0, size = 220 }) {
  const [animated, setAnimated] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const target = Math.min(Math.max(score, 0), 100);
    let current = 0;
    const step = target / 60;
    timerRef.current = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timerRef.current); }
      setAnimated(Math.round(current));
    }, 16);
    return () => clearInterval(timerRef.current);
  }, [score]);

  const radius = (size / 2) - 20;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (animated / 100) * circumference;

  const getRisk = (s) => {
    if (s >= 70) return { label: 'HIGH RISK', color: '#ef4444', glow: 'rgba(239,68,68,0.4)', text: 'text-accent-red', bg: 'bg-accent-red/10' };
    if (s >= 40) return { label: 'MODERATE', color: '#f97316', glow: 'rgba(249,115,22,0.4)', text: 'text-accent-orange', bg: 'bg-accent-orange/10' };
    return { label: 'LOW RISK', color: '#22c55e', glow: 'rgba(34,197,94,0.4)', text: 'text-accent-green', bg: 'bg-accent-green/10' };
  };

  const risk = getRisk(animated);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-2xl"
          style={{ background: risk.glow }}
        />
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor={risk.color} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14"
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            filter="url(#glow)"
            style={{ transition: 'stroke-dashoffset 0.016s linear' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
          <span className={`text-4xl font-bold tabular-nums ${risk.text}`}>{animated}</span>
          <span className="text-text-muted text-xs mt-0.5">/ 100</span>
          <span className={`text-[0.6rem] font-bold uppercase tracking-widest mt-2 px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>
            {risk.label}
          </span>
        </div>
      </div>
      <p className="text-text-muted text-xs mt-2 text-center">Overall Clinical Risk Score</p>
    </div>
  );
}

export default HealthScoreRing;
