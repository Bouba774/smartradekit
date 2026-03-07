import { useState, useEffect } from 'react';

export const getNotificationPermission = (): NotificationPermission => {
  if (typeof Notification === 'undefined') return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof Notification === 'undefined') return 'denied';
  return await Notification.requestPermission();
};

interface SmartNotificationsOptions {
  trades?: any[];
  language?: string;
  enabled?: boolean;
}

export const useSmartNotifications = (options?: SmartNotificationsOptions) => {
  return {
    permission: getNotificationPermission(),
    requestPermission: requestNotificationPermission,
  };
};
