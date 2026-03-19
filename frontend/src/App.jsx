import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import ReportResults from './pages/ReportResults';
import DrugInteractions from './pages/DrugInteractions';
import TrendAnalysis from './pages/TrendAnalysis';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/ToastProvider';
import Footer from './components/Footer';
import './App.css';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/upload', label: 'Upload', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
  { to: '/drug-interactions', label: 'Drug Checker', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Router>
      <ToastProvider>
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadReport />} />
            <Route path="/report/:id" element={<ReportResults />} />
            <Route path="/drug-interactions" element={<DrugInteractions />} />
            <Route path="/trends/:patientId" element={<TrendAnalysis />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
