import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smarthire_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('smarthire_token'));
  const [loading, setLoading] = useState(true);

  // Load current user and profile on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smarthire_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
            setProfile(res.profile);
            localStorage.setItem('smarthire_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('smarthire_token', res.token);
      localStorage.setItem('smarthire_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      // Fetch full profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.success) {
          setProfile(meRes.profile);
        }
      } catch (e) {
        // Ignored
      }
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success) {
      localStorage.setItem('smarthire_token', res.token);
      localStorage.setItem('smarthire_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      // Fetch profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.success) setProfile(meRes.profile);
      } catch (e) {
        // Ignored
      }
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('smarthire_token');
    localStorage.removeItem('smarthire_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.user);
        setProfile(res.profile);
        localStorage.setItem('smarthire_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAuthenticated: !!user,
        isCandidate: user?.role === 'candidate',
        isRecruiter: user?.role === 'recruiter',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
