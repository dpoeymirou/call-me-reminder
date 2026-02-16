import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "./api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setIsAuthenticated(true), 0);
    }
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => setIsLoading(false), 0);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", { password });
      const { access_token } = response.data;

      localStorage.setItem("auth_token", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setIsAuthenticated(true), 0);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    delete api.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
