/**
 * AuthContext — versão local sem dependências do base44.
 * Usa o User da entidade local para prover autenticação.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/entities/all';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    User.me()
      .then(currentUser => {
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
      })
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoadingAuth(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, authError: null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
