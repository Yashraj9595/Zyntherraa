import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userApi } from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user data
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // Set token in localStorage
      localStorage.setItem('token', token);
      
      // Get user profile
      const response = await userApi.getProfile() as any;
      
      if (response) {
        setUser({
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
          token
        });
      } else {
        // Invalid token, remove it
        localStorage.removeItem('token');
      }
    } catch (error) {
      // Error validating token, remove it
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: any) => {
    setUser({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      token: userData.token
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};