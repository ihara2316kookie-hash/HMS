import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setSessionWarning(false);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSessionWarning(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const extendSession = useCallback(() => {
    setSessionWarning(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    const TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 28 * 60 * 1000; // Show warning 2 minutes before timeout

    let logoutTimer;
    let warningTimer;

    const startTimers = () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      setSessionWarning(false);

      warningTimer = setTimeout(() => {
        setSessionWarning(true);
      }, WARNING_TIME);

      logoutTimer = setTimeout(() => {
        logout();
        alert('Session expired due to inactivity. Please login again.');
        window.location.href = '/login';
      }, TIMEOUT);
    };

    startTimers();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => {
      startTimers();
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, sessionWarning, extendSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);