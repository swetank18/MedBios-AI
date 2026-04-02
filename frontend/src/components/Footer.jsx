import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-16 relative overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-accent-blue/[0.02] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent-purple/[0.02] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
                <rect x="1" y="1" width="34" height="34" rx="9" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5"/>
                <path d="M4 18L8 18L9.5 14L12 21L14 6L16.5 23L18.5 18L22 13L25.5 18L32 18" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-[#065f46] tracking-tight">MedBios AI</span>
                <span className="text-[0.5rem] text-[#4a9175] font-semibold tracking-widest uppercase">Clinical Intelligence</span>
              </div>
            </div>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              AI-powered clinical intelligence platform. Analyze medical reports with explainable reasoning, knowledge graphs, and personalized health insights.
            </p>
            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
              </span>
              <span className="text-accent-green text-xs font-medium">All systems operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Dashboard' },
                { to: '/upload', label: 'Upload Report' },
                { to: '/drug-interactions', label: 'Drug Interaction Checker' },
                { to: '/settings', label: 'Settings' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-text-muted text-sm hover:text-accent-blue transition inline-flex items-center gap-1.5 group">
                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Capabilities</h4>
            <div className="space-y-2.5">
              {[
                { label: '100+ Lab Test References', color: 'bg-accent-blue' },
                { label: '25+ Clinical Reasoning Rules', color: 'bg-accent-purple' },
                { label: '30+ Drug Interaction Pairs', color: 'bg-accent-orange' },
                { label: 'Medical Knowledge Graph', color: 'bg-accent-teal' },
                { label: 'Personalized Recommendations', color: 'bg-accent-green' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-text-muted text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border-subtle gap-4">
          <p className="text-text-muted text-xs">
            For clinical decision support only. Not a substitute for professional medical advice.
          </p>
          <div className="flex items-center gap-3">
            {['FastAPI', 'React', 'Tailwind', 'SQLAlchemy'].map((tech, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-bg-elevated/50 border border-border-subtle text-text-muted text-[0.6rem] font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
