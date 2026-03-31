import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('medbios_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // In production, this would call the backend API
    const userData = {
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      initials: email.substring(0, 2).toUpperCase(),
      role: 'Physician',
      loginTime: new Date().toISOString(),
    };
    setUser(userData);
    localStorage.setItem('medbios_user', JSON.stringify(userData));
    return { success: true };
  };

  const signup = (name, email, password, role) => {
    // In production, this would POST to backend registration endpoint
    // For now, create user directly and log them in
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const userData = {
      email,
      name,
      initials,
      role: role || 'Physician',
      loginTime: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
    };
    setUser(userData);
    localStorage.setItem('medbios_user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medbios_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
