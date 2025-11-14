// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  const isAuthenticated = !!user;

  // Fetch user profile using token
  const fetchProfile = async (jwtToken) => {
    try {
      setError("");

      const res = await fetch("http://localhost:8000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          payload.detail || payload.message || "Failed to fetch profile."
        );
      }

      const data = await res.json();
      setUser(data);
      console.log("PROFILE:", data);
      return true;
    } catch (err) {
      console.error(err);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      setError(err.message || "Could not load profile.");
      return false;
    }
  };

  // Login: call /auth/login, save token, fetch profile
  const login = async (mobile_number, password) => {
    try {
      setError("");

      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number, password }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.detail || payload.message || "Login failed.");
      }

      const data = await res.json();
      const jwtToken = data.token;

      localStorage.setItem("token", jwtToken);
      setToken(jwtToken);

      const ok = await fetchProfile(jwtToken);
      return ok;
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // Init from localStorage token
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (!saved) {
      setInitializing(false);
      return;
    }

    (async () => {
      await fetchProfile(saved);
      setToken(saved);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
