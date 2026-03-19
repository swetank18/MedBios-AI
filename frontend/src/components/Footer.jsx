import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#gf)" strokeWidth="2.5"/>
                <path d="M16 8v16M12 12h8M12 20h8" stroke="url(#gf)" strokeWidth="2" strokeLinecap="round"/>
                <defs><linearGradient id="gf" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#0ea5e9"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
              </svg>
              <span className="font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">MedBios AI</span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              AI-powered clinical report intelligence platform. Analyze medical reports with clinical reasoning, knowledge graphs, and explainable AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Dashboard' },
                { to: '/upload', label: 'Upload Report' },
                { to: '/drug-interactions', label: 'Drug Checker' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-text-muted text-sm hover:text-accent-blue transition">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Capabilities</h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li>100+ Lab Test References</li>
              <li>Clinical Reasoning Engine</li>
              <li>Knowledge Graph Analysis</li>
              <li>Smart Health Recommendations</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border-subtle gap-3">
          <p className="text-text-muted text-xs">
            Built with AI for humanity. Not a substitute for professional medical advice.
          </p>
          <div className="flex items-center gap-4 text-text-muted text-xs">
            <span>FastAPI</span>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>React</span>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>Tailwind CSS</span>
            <span className="w-1 h-1 rounded-full bg-border-subtle" />
            <span>SQLAlchemy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
