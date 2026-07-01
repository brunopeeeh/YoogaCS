import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/entities/all';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const loggedUser = await User.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await User.logout();
      setUser(null);
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = { 
    user, 
    isLoading, 
    login, 
    logout,
    refreshUser: fetchUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};