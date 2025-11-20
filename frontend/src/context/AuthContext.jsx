// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import * as api from "../api/index.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  const isAuthenticated = !!user;

  // load profile (and set token in api helper)
  const fetchProfile = async (jwtToken) => {
    try {
      setError("");
      api.setToken(jwtToken);

      // call profile endpoint
      const data = await api.user.profile();
      // set user state
      setUser(data);
      return true;
    } catch (err) {
      console.error("fetchProfile error:", err);
      setUser(null);
      setToken(null);
      api.setToken(null);
      localStorage.removeItem("token");
      setError(err.message || "Could not load profile.");
      return false;
    }
  };

  const login = async (mobile_number, password) => {
    try {
      setError("");
      const data = await api.auth.login(mobile_number, password);
      if (!data?.token) throw new Error("No token returned from server.");
      const jwtToken = data.token;
      localStorage.setItem("token", jwtToken);
      setToken(jwtToken);
      api.setToken(jwtToken);
      const ok = await fetchProfile(jwtToken);
      return ok;
    } catch (err) {
      console.error("login error:", err);
      setError(err.message || "Login failed.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem("token");
  };

  // Initialize from localStorage token (single source)
  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem("token");
      if (!saved) {
        setInitializing(false);
        return;
      }
      const ok = await fetchProfile(saved);
      if (ok) setToken(saved);
      setInitializing(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        initializing,
        error,
        login,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
