import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard shortcuts for the MedBios AI platform.
 * 
 * Shortcuts:
 *   Ctrl+U — Upload Report
 *   Ctrl+D — Dashboard
 *   Ctrl+K — Drug Checker
 *   Ctrl+, — Settings
 *   Ctrl+P — Print (browser native)
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      // Don't trigger in input/textarea fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'u') {
        e.preventDefault();
        navigate('/upload');
      } else if (isCtrl && e.key === 'd') {
        e.preventDefault();
        navigate('/');
      } else if (isCtrl && e.key === 'k') {
        e.preventDefault();
        navigate('/drug-interactions');
      } else if (isCtrl && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
