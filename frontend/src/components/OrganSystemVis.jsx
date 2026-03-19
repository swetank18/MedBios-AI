function OrganSystemVis({ riskScores = {} }) {
  const systems = riskScores.by_system || {};
  
  // Mapping of common systems to approximate relative X, Y positions on abstract body SVG
  const organMap = {
    Head: { x: 50, y: 15, label: 'Neurological/Head' },
    Cardiovascular: { x: 50, y: 35, label: 'Cardiovascular' },
    Respiratory: { x: 35, y: 35, label: 'Respiratory' },
    Hepatic: { x: 40, y: 50, label: 'Hepatic (Liver)' },
    Endocrine: { x: 50, y: 56, label: 'Endocrine (Pancreas)' },
    Renal: { x: 60, y: 58, label: 'Renal (Kidneys)' },
    Gastrointestinal: { x: 50, y: 65, label: 'Gastrointestinal' },
    Hematological: { x: 75, y: 45, label: 'Hematological (Blood)' },
    Electrolytes: { x: 25, y: 45, label: 'Electrolytes' }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return { fill: 'fill-accent-red/40', stroke: 'stroke-accent-red', text: 'text-accent-red', shadow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' };
    if (score >= 40) return { fill: 'fill-accent-orange/40', stroke: 'stroke-accent-orange', text: 'text-accent-orange', shadow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' };
    return { fill: 'fill-accent-green/20', stroke: 'stroke-accent-green/50', text: 'text-accent-green', shadow: 'drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]' };
  };

  const activeSystems = Object.entries(systems).map(([sys, score]) => {
    // Find closest match or default randomly
    const key = Object.keys(organMap).find(k => sys.toLowerCase().includes(k.toLowerCase())) || 'Electrolytes';
    // Add slight random offset if multiple map to same key
    return {
      sys,
      score,
      map: organMap[key],
      color: getRiskColor(score)
    };
  });

  return (
    <div className="glass-card relative overflow-hidden h-full min-h-[400px] flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Organ System Map</h3>
        <p className="text-text-muted text-xs">Visualizing risk concentration</p>
      </div>

      <div className="relative w-full max-w-[250px] aspect-[1/2] mx-auto opacity-90 mt-8">
        {/* Abstract Human Silhouette SVG */}
        <svg viewBox="0 0 100 200" className="w-full h-full text-white/5 drop-shadow-lg">
          <path 
            fill="currentColor"
            d="M50 5c-6 0-11 5-11 11s5 11 11 11 11-5 11-11-5-11-11-11zm-15 25c-8 0-15 7-15 15v45c0 4 3 7 7 7h3v65c0 6 5 11 10 11s10-5 10-11v-35h0v35c0 6 5 11 10 11s10-5 10-11v-65h3c4 0 7-3 7-7V45c0-8-7-15-15-15h-30z" 
          />
        </svg>

        {/* Glow Indicators */}
        {activeSystems.map((active, i) => (
          <div 
            key={i} 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: `${active.map.x}%`, top: `${active.map.y}%` }}
          >
            {/* Pulsing Dot */}
            <div className={`relative w-4 h-4 rounded-full ${active.color.fill} ${active.color.stroke} border-2 ${active.color.shadow} transition-all duration-300 group-hover:scale-150`}>
              {active.score >= 70 && (
                <div className={`absolute inset-0 rounded-full animate-ping ${active.color.stroke} border opacity-75`}></div>
              )}
            </div>
            
            {/* Tooltip-style Label (Always visible or hover-based, let's keep them visible if few, or connected with a line) */}
            <div className={`absolute top-full mt-2 w-max px-2 py-1 rounded-md bg-bg-card border border-border-subtle shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none`}>
              <div className="text-xs font-bold text-text-primary mb-0.5">{active.sys}</div>
              <div className={`text-[10px] uppercase font-bold ${active.color.text}`}>
                {active.score}% Risk
              </div>
            </div>
          </div>
        ))}

        {/* Floating Labels that are always visible */}
        {activeSystems.map((active, i) => {
          const isLeft = active.map.x < 50;
          return (
            <div 
              key={`label-${i}`}
              className={`absolute top-0 flex flex-col justify-center pointer-events-none ${isLeft ? 'right-full mr-4 items-end' : 'left-full ml-4 items-start'}`}
              style={{ top: `${active.map.y}%`, transform: 'translateY(-50%)' }}
            >
              <div className="text-[10px] text-text-secondary whitespace-nowrap">{active.sys}</div>
              <div className={`text-xs font-bold ${active.color.text}`}>{active.score}%</div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default OrganSystemVis;
