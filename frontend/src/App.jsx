import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import ReportResults from './pages/ReportResults';
import DrugInteractions from './pages/DrugInteractions';
import TrendAnalysis from './pages/TrendAnalysis';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary">
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-lg">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
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
          </div>
          <ul className="flex items-center gap-1">
            {[
              { to: '/', label: 'Dashboard', end: true },
              { to: '/upload', label: 'Upload Report' },
              { to: '/drug-interactions', label: 'Drug Checker' },
            ].map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-blue/15 text-accent-blue'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadReport />} />
          <Route path="/report/:id" element={<ReportResults />} />
          <Route path="/drug-interactions" element={<DrugInteractions />} />
          <Route path="/trends/:patientId" element={<TrendAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
