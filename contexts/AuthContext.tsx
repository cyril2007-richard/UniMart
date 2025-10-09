import React, { createContext, ReactNode, useContext, useState } from 'react';
import { users as mockUsers } from '../constants/mockData';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  matricNumber: string;
  faculty: string;
  followers: number;
  following: number;
};

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  signup: (newUser: Omit<User, 'id' | 'followers' | 'following'>) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const login = (username: string, password: string): boolean => {
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = (newUser: Omit<User, 'id' | 'followers' | 'following'>): boolean => {
    // Prevent duplicates
    const exists = users.some(
      (user) => user.email === newUser.email || user.username === newUser.username
    );
    if (exists) return false;

    // Create a new user entry
    const userToAdd: User = {
      ...newUser,
      id: (users.length + 1).toString(),
      followers: 0,
      following: 0,
    };

    setUsers((prev) => [...prev, userToAdd]);
    setCurrentUser(userToAdd);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
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
