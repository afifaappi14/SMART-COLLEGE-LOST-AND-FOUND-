import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { api, setCurrentUserHeaderId, getCurrentUserHeaderId } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  switchUser: (userId: string) => Promise<void>;
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  isStaffOrAdmin: boolean;
  isAdmin: boolean;
  resetDatabase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchUsersAndMe = async () => {
    try {
      setLoading(true);
      const userRes = await api.getUsers();
      setUsers(userRes.users);

      const savedId = getCurrentUserHeaderId();
      const meRes = await api.getMe();
      setCurrentUser(meRes.user);

      // Fetch notifications
      const notifRes = await api.getNotifications();
      setNotifications(notifRes.notifications);
    } catch (err) {
      console.error('Error loading auth data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndMe();
  }, []);

  const refreshNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  };

  const switchUser = async (userId: string) => {
    setCurrentUserHeaderId(userId);
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
    }
    // Refresh notifications for newly selected persona
    await refreshNotifications();
  };

  const resetDatabase = async () => {
    await api.resetDemo();
    await fetchUsersAndMe();
  };

  const isStaffOrAdmin = currentUser?.role === 'staff' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        switchUser,
        notifications,
        unreadCount,
        refreshNotifications,
        isStaffOrAdmin,
        isAdmin,
        resetDatabase,
      }}
    >
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
