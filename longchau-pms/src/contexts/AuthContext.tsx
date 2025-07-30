import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserService } from '../services/UserService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'pharmacist' | 'manager' | 'customer';
  branchId?: string;
  // Enhanced professional information
  professionalInfo?: {
    licenseNumber: string;
    specializations: string[];
    yearsOfExperience: number;
    education: {
      degree: string;
      institution: string;
      graduationYear: number;
    };
    certifications: string[];
    branch: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
    hireDate: string;
    position: string;
    department?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: 'pharmacist' | 'manager' | 'customer') => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('lcpms-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('lcpms-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await UserService.loginUser(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('lcpms-user', JSON.stringify(result.user));
        setIsLoading(false);
        return true;
      } else {
        console.error('Login failed:', result.error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'pharmacist' | 'manager' | 'customer'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await UserService.createUser({
        email,
        password,
        name,
        role,
      });

      if (result.success && result.user) {
        // Automatically log in the user after registration
        setUser(result.user);
        localStorage.setItem('lcpms-user', JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lcpms-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}