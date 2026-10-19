import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiRequest } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  registerHomeowner: (data: any) => Promise<User>;
  registerProfessional: (data: any) => Promise<User>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<any>;
  sendOtp: (mobileNumber: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('stroitx_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiRequest('/auth/me');
        if (res.data) setUser(res.data);
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('stroitx_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    const { user, token } = res.data;
    localStorage.setItem('stroitx_token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const registerHomeowner = async (data: any) => {
    const res = await apiRequest('/auth/signup/homeowner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const { user, token } = res.data;
    localStorage.setItem('stroitx_token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const registerProfessional = async (data: any) => {
    const res = await apiRequest('/auth/signup/professional', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const { user, token } = res.data;
    localStorage.setItem('stroitx_token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const sendOtp = async (mobileNumber: string) => {
    const res = await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber }),
    });
    return res;
  };

  const verifyOtp = async (mobileNumber: string, otp: string) => {
    const res = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, otp }),
    });
    if (res.data?.token) {
      localStorage.setItem('stroitx_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('stroitx_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerHomeowner,
        registerProfessional,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
