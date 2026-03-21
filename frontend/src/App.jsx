import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import ReportResults from './pages/ReportResults';
import DrugInteractions from './pages/DrugInteractions';
import TrendAnalysis from './pages/TrendAnalysis';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import { ToastProvider } from './components/ToastProvider';
import { AuthProvider, useAuth } from './components/AuthContext';
import Footer from './components/Footer';
import './App.css';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/upload', label: 'Upload', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
  { to: '/drug-interactions', label: 'Drug Checker', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
];

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // If on login page, render without shell
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 font-bold text-lg group">
            <svg className="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#grad)" strokeWidth="2.5"/>
              <path d="M16 8v16M12 12h8M12 20h8" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#0ea5e9"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
              MedBios AI
            </span>
          </NavLink>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-accent-blue/15 text-accent-blue shadow-sm shadow-accent-blue/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`
                  }
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-bold">
                  {user?.initials || 'U'}
                </div>
                <span className="hidden sm:block text-sm text-text-secondary">{user?.name || 'User'}</span>
                <svg className={`w-3 h-3 text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border-subtle bg-bg-card/95 backdrop-blur-xl shadow-xl shadow-black/20 py-1 z-50 fade-in">
                  <div className="px-4 py-3 border-b border-border-subtle">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                    <p className="text-[0.6rem] text-accent-blue mt-0.5">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/10 transition text-left"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-text-secondary"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border-subtle bg-bg-card/95 backdrop-blur-xl">
            <ul className="flex flex-col p-3 gap-1">
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-accent-blue/15 text-accent-blue'
                          : 'text-text-secondary hover:bg-white/5'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadReport /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><ReportResults /></ProtectedRoute>} />
        <Route path="/drug-interactions" element={<ProtectedRoute><DrugInteractions /></ProtectedRoute>} />
        <Route path="/trends/:patientId" element={<ProtectedRoute><TrendAnalysis /></ProtectedRoute>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
