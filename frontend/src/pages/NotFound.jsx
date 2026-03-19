import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center page-enter">
      <div className="relative inline-block mb-8">
        <span className="text-[8rem] font-bold bg-gradient-to-b from-accent-blue/30 to-transparent bg-clip-text text-transparent select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-accent-blue/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h1>
      <p className="text-text-muted text-sm mb-8 max-w-md mx-auto">
        The page you are looking for does not exist. It might have been moved or the URL may be incorrect.
      </p>
      <div className="flex justify-center gap-3">
        <Link to="/">
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-accent-blue/20">
            Go to Dashboard
          </button>
        </Link>
        <Link to="/upload">
          <button className="px-6 py-2.5 rounded-xl border border-border-subtle text-text-secondary text-sm font-medium hover:bg-white/5 transition">
            Upload Report
          </button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
