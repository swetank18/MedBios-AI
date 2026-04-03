import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

const ACCESS_KEY = 'medbios_access_token';
const REFRESH_KEY = 'medbios_refresh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive initials from name for display
  const buildUserState = (userData) => ({
    ...userData,
    initials: userData.name
      ? userData.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
      : userData.email.substring(0, 2).toUpperCase(),
  });

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('medbios_demo_user');
    setUser(null);
  }, []);

  const storeTokens = (access_token, refresh_token) => {
    localStorage.setItem(ACCESS_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
  };

  // Try to refresh access token using stored refresh token
  const refreshToken = useCallback(async () => {
    const stored = localStorage.getItem(REFRESH_KEY);
    if (!stored) return false;
    try {
      const res = await authAPI.refresh(stored);
      localStorage.setItem(ACCESS_KEY, res.data.access_token);
      return true;
    } catch {
      return false;
    }
  }, []);

  // On mount: restore session from stored tokens
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem(ACCESS_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.me();
        setUser(buildUserState(res.data));
      } catch (err) {
        // No response = backend unreachable; restore demo session from token
        if (!err?.response) {
          const stored = localStorage.getItem('medbios_demo_user');
          if (stored) try { setUser(JSON.parse(stored)); } catch { clearSession(); }
        } else if (err?.response?.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            try {
              const res = await authAPI.me();
              setUser(buildUserState(res.data));
            } catch {
              clearSession();
            }
          } else {
            clearSession();
          }
        } else {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [refreshToken, clearSession]);

  // Mock auth fallback for when backend is unreachable (dev/demo mode)
  const _mockAuth = (name, email, role) => {
    const mockUser = { id: 'demo', name: name || email.split('@')[0], email, role: role || 'Physician' };
    const built = buildUserState(mockUser);
    const fakeToken = 'demo_token_' + Date.now();
    storeTokens(fakeToken, fakeToken);
    localStorage.setItem('medbios_demo_user', JSON.stringify(built));
    setUser(built);
    return { success: true };
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const { access_token, refresh_token, user: userData } = res.data;
      storeTokens(access_token, refresh_token);
      setUser(buildUserState(userData));
      return { success: true };
    } catch (err) {
      // If backend is unreachable (network error), use demo mode
      if (!err?.response) {
        console.warn('Backend unreachable — using demo mode');
        return _mockAuth(null, email, 'Physician');
      }
      const detail = err?.response?.data?.detail || 'Login failed';
      return { success: false, error: detail };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const res = await authAPI.register(name, email, password, role);
      const { access_token, refresh_token, user: userData } = res.data;
      storeTokens(access_token, refresh_token);
      setUser(buildUserState(userData));
      return { success: true };
    } catch (err) {
      // If backend is unreachable (network error), use demo mode
      if (!err?.response) {
        console.warn('Backend unreachable — using demo mode');
        return _mockAuth(name, email, role);
      }
      const detail = err?.response?.data?.detail || 'Registration failed';
      return { success: false, error: detail };
    }
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    clearSession();
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem(ACCESS_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      refreshToken,
      getAuthHeaders,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
