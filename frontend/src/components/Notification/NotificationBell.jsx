// frontend/src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      URGENT: 'border-l-4 border-red-500',
      HIGH: 'border-l-4 border-orange-500',
      MEDIUM: 'border-l-4 border-blue-500',
      LOW: 'border-l-4 border-gray-500',
    };
    return styles[priority] || styles.MEDIUM;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-700"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status */}
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-white font-semibold">Notifications</h3>
              <p className="text-xs text-gray-400">
                {isConnected ? '🟢 Connected' : '🔴 Reconnecting...'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'text-white bg-gray-700 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'text-white bg-gray-700 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-5xl mb-3">🔔</p>
                <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 border-b border-gray-700 cursor-pointer 
                    hover:bg-gray-700 transition-colors group
                    ${!notification.isRead ? 'bg-gray-750' : ''}
                    ${getPriorityStyle(notification.priority)}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {notification.icon || '🔔'}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm ${!notification.isRead ? 'text-white font-semibold' : 'text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </p>
                        {notification.category && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">
                            {notification.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Unread Dot */}
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-700">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;