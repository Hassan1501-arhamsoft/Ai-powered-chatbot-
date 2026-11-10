// src/context/AuthContext.jsx
import { createContext, useState, useContext } from "react";
import { authService } from "../features/auth/services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // In a full production app, you would also verify the cookie on initial load
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

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

// Make sure to export it in the provider value
return (
  <AuthContext.Provider value={{ user, login, logout, registerUser, loading }}>
    {children}
  </AuthContext.Provider>
);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);