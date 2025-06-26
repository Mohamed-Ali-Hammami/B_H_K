"use client";
import React, { useState } from 'react';
export interface NotificationType {
  id: string;
  message: string;
  read: boolean;
  time: string;
}

interface NotificationsProps {
  notifications: NotificationType[];
  onMarkAsRead: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(id);
  };

  return (
    <div className="relative">
      <button 
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">Notifications</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-red-50' : ''
                    }`}
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    notifications
                      .filter(n => !n.read)
                      .forEach(n => onMarkAsRead(n.id));
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;