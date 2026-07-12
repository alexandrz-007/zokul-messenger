import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  joinByInvite: (code: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateDeviceName(): string {
  const names = ['Luna', 'Nova', 'Aria', 'Orion', 'Elara', 'Zephyr', 'Iris', 'Leo', 'Mira', 'Atlas'];
  return names[Math.floor(Math.random() * names.length)] + '_' + Math.random().toString(36).slice(2, 6);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const joinByInvite = async (code: string) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/invite', { code });
      setToken(res.data.token);
      setUser(res.data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, joinByInvite, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
