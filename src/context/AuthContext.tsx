"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '../utils/utils_storage';

/** Interfaces **/
export interface DecodedToken {
  exp: number;
  user_id: number;
  is_superuser: boolean;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isSuperuser: boolean;
  setIsSuperuser: React.Dispatch<React.SetStateAction<boolean>>;
  user?: DecodedToken;
  setUser: React.Dispatch<React.SetStateAction<DecodedToken | undefined>>;
  token?: string;
  setToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loginWithCredentials: (formData: Record<string, unknown>) => Promise<string | undefined>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [user, setUser] = useState<DecodedToken | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] useEffect[] fired: Hydrating token from localStorage');
    const storedToken = getLocalStorageItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUser(decoded);
          setIsSuperuser(decoded.role === "superuser");
          setToken(storedToken);
          console.log('[AuthContext] Token hydrated, user:', decoded);
        } else {
          removeLocalStorageItem("token");
          console.log('[AuthContext] Token expired, removed from storage');
        }
      } catch (err) {
        removeLocalStorageItem("token");
        console.log('[AuthContext] Invalid token, removed from storage', err);
      }
    }
    setLoading(false);
  }, []);

  const loginWithCredentials = async (formData: Record<string, unknown>): Promise<string | undefined> => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setLocalStorageItem('token', data.token);
      setToken(data.token);
      const decoded = jwtDecode<DecodedToken>(data.token);
      setIsLoggedIn(true);
      setUser(decoded);
      setIsSuperuser(!!data.is_superuser || decoded.role === 'superuser');
      console.log('[AuthContext] Login success, user:', decoded);
      
      return decoded.role === 'superuser' ? '/superuser_dashboard' : '/dashboard';
      
    } catch (error) {
      console.error('[AuthContext] Error logging in:', error);
      alert('Login failed. Please check your credentials and try again.');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] logout called');
    removeLocalStorageItem("token");
    setIsLoggedIn(false);
    setIsSuperuser(false);
    setUser(undefined);
    setToken(undefined);
    window.location.href = '/';
  };

  useEffect(() => {
    console.log('[AuthContext] State changed:', {
      isLoggedIn,
      isSuperuser,
      user,
      token,
      loading
    });
  }, [isLoggedIn, isSuperuser, user, token, loading]);

  const contextValue: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    isSuperuser,
    setIsSuperuser,
    user,
    setUser,
    token,
    setToken,
    loading,
    setLoading,
    loginWithCredentials,
    logout,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};