import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user on app start if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data.user);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // ── REGISTER ─────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // ── LOGIN ─────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // ── LOGOUT ────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // ── UPDATE PROFILE ────────────────────────────────────
  const updateProfile = async (formData) => {
    const { data } = await API.put('/auth/me', formData);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  // ── CHANGE PASSWORD ───────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await API.put('/auth/password', { currentPassword, newPassword });
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      register, login, logout,
      updateProfile, changePassword,
      isLoggedIn: !!token,
      isAdmin: user?.role === 'admin',
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
