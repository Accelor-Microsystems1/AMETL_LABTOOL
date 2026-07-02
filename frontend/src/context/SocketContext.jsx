// frontend/src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../components/authentication/authContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const { user, token, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Fetch existing notifications from DB on mount
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      // Cleanup on logout
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    // Fetch existing notifications
    fetchNotifications();

    // Initialize socket
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      console.log('🟢 Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      if (error.message.includes('Authentication')) {
        toast.error('Session expired. Please login again.');
        logout?.();
      }
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmed connection:', data);
    });

    // 🔔 Notification events
    newSocket.on('notification:new', (notification) => {
      console.log('📬 New notification:', notification);
      
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast with priority styling
      showNotificationToast(notification);
    });

    newSocket.on('notification:unreadCount', (count) => {
      setUnreadCount(count);
    });

    newSocket.on('notification:updated', (updated) => {
      setNotifications((prev) => 
        prev.map(n => n.id === updated.id ? updated : n)
      );
    });

    // 🔄 Role change event
    newSocket.on('role:changed', ({ oldRole, newRole }) => {
      toast.success(`Your role has been updated from ${oldRole} to ${newRole}`, {
        duration: 5000,
        icon: '👤',
      });
      // Optional: reload to apply new permissions
      setTimeout(() => window.location.reload(), 2000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, fetchNotifications, logout]);

  // Show toast based on notification priority
  const showNotificationToast = (notification) => {
    const { title, message, priority, icon } = notification;
    const displayIcon = icon || '🔔';
    
    const toastOptions = {
      duration: priority === 'URGENT' ? 8000 : 4000,
      icon: displayIcon,
    };
    
    switch (priority) {
      case 'URGENT':
        toast.error(`${title}: ${message}`, toastOptions);
        break;
      case 'HIGH':
        toast(`${title}: ${message}`, { ...toastOptions, style: { borderLeft: '4px solid orange' } });
        break;
      default:
        toast(`${title}: ${message}`, toastOptions);
    }
  };

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    
    if (socket) {
      socket.emit('notification:markRead', notificationId);
    }
  }, [socket]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    
    if (socket) {
      socket.emit('notification:markAllRead');
    }
  }, [socket]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        setNotifications((prev) => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  }, [token]);

  // Subscribe to any custom event
  const on = useCallback((event, callback) => {
    if (!socket) return () => {};
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, [socket]);

  // Emit any custom event
  const emit = useCallback((event, data) => {
    if (socket) socket.emit(event, data);
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        on,
        emit,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};