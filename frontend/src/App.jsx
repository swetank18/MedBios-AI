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
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#grad)" strokeWidth="2.5"/>
              <path d="M16 8v16M12 12h8M12 20h8" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#0ea5e9"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            MedBios AI
          </div>
          <ul className="nav-links">
            <li><NavLink to="/" end>Dashboard</NavLink></li>
            <li><NavLink to="/upload">Upload Report</NavLink></li>
            <li><NavLink to="/drug-interactions">Drug Checker</NavLink></li>
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
