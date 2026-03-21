import { useState } from 'react';
import { useAuth } from '../components/AuthContext';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');

    // Simulate brief auth delay
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    if (!result.success) setError('Invalid credentials');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-accent-blue/5 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent-purple/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-blue/[0.02] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md page-enter">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 border border-accent-blue/20 mb-4">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#lg)" strokeWidth="2.5"/>
              <path d="M16 8v16M12 12h8M12 20h8" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#0ea5e9"/><stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue via-white to-accent-purple bg-clip-text text-transparent">
            MedBios AI
          </h1>
          <p className="text-text-muted text-sm mt-1">Clinical Report Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card !p-8">
          <h2 className="text-lg font-bold text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in to access your clinical dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border-subtle text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-blue transition"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[0.65rem] text-accent-blue hover:text-accent-blue/80 transition">
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border-subtle text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-blue transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-red/10 border border-accent-red/25 text-accent-red text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-accent-blue/20 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-[0.6rem] text-text-muted uppercase tracking-wider">Platform Highlights</span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: '100+ Lab Tests' },
                { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707', label: 'AI Insights' },
                { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: 'Health Rx' },
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'HIPAA Ready' },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] text-xs text-text-muted">
                  <svg className="w-3.5 h-3.5 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                  {feat.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-[0.6rem] mt-6">
          Built with AI for humanity · Not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
}

export default Login;
