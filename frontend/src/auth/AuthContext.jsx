import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("carbon_token"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("carbon_token", res.data.token);
      setUser(res.data.user);
    },
    async register(payload) {
      const res = await api.post("/auth/register", payload);
      localStorage.setItem("carbon_token", res.data.token);
      setUser(res.data.user);
    },
    logout() {
      localStorage.removeItem("carbon_token");
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
