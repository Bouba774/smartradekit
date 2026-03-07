export const getNotificationPermission = (): NotificationPermission => {
  if (typeof Notification === 'undefined') return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof Notification === 'undefined') return 'denied';
  return await Notification.requestPermission();
};

export const useSmartNotifications = () => {
  // Placeholder for smart notifications
  return {
    permission: getNotificationPermission(),
    requestPermission: requestNotificationPermission,
  };
};
