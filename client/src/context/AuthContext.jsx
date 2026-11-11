// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../features/auth/services/auth.service";
import api from "../api/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  // Extra flag for the initial cookie-based re-hydration check
  const [initializing, setInitializing] = useState(true);

  // ── On mount: try to restore session from HTTP-Only cookie ──────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch {
        // No valid cookie / session expired — stay logged out
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.data); // Store the user data, not the token
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      setUser(res.data); // Sets the global user state
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while verifying the cookie so there is no flash to /login
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2z"/>
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
