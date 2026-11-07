import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const isPushCapable = () => Capacitor.isNativePlatform();

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!isPushCapable()) return false;
  
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch (error) {
    console.error("Error requesting notification permissions", error);
    return false;
  }
};

export const scheduleWelcomeNotification = async () => {
  if (!isPushCapable()) return;

  const hasPermission = await checkPermissions();
  if (!hasPermission) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Protocol Active",
          body: "Your parameters are set. Stick to the plan. No bullshit.",
          id: 1,
          schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds from now
        }
      ]
    });
  } catch (error) {
    console.error("Error scheduling welcome notification", error);
  }
};

export const scheduleDailyReminders = async () => {
  if (!isPushCapable()) return;

  const hasPermission = await checkPermissions();
  if (!hasPermission) return;

  try {
    // Check if notifications are disabled in settings
    const notificationsEnabled = localStorage.getItem("ultimatum_notifications_enabled") !== "false";
    if (!notificationsEnabled) {
      await cancelAllNotifications();
      return;
    }

    await cancelAllNotifications(); // Clear existing to prevent duplicates

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "System",
          body: "Morning. Food logged?",
          id: 2,
          schedule: { allowWhileIdle: true, on: { hour: 9, minute: 0 } }
        },
        {
          title: "System",
          body: "Lunch. Food logged?",
          id: 3,
          schedule: { allowWhileIdle: true, on: { hour: 14, minute: 0 } }
        },
        {
          title: "System",
          body: "Evening. Food logged?",
          id: 4,
          schedule: { allowWhileIdle: true, on: { hour: 20, minute: 0 } }
        },
        {
          title: "System",
          body: "Had workout?",
          id: 5,
          schedule: { allowWhileIdle: true, on: { hour: 21, minute: 0 } }
        }
      ]
    });
  } catch (error) {
    console.error("Error scheduling daily reminders", error);
  }
};

export const cancelAllNotifications = async () => {
  if (!isPushCapable()) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  } catch (error) {
    console.error("Error canceling notifications", error);
  }
};

const checkPermissions = async (): Promise<boolean> => {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted';
  } catch (error) {
    return false;
  }
};

// Utility to generate a unique numeric ID from a string (for Capacitor LocalNotifications id which must be Int32)
function stringToId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export const scheduleHabitReminder = async (habitId: string, title: string, timeStr: string) => {
  if (!isPushCapable()) return;
  const hasPermission = await checkPermissions();
  if (!hasPermission) return;

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Habit Reminder",
          body: `Time to execute: ${title}`,
          id: stringToId(habitId),
          schedule: { allowWhileIdle: true, on: { hour: hours, minute: minutes } }
        }
      ]
    });
    console.log(`[notifications] Scheduled habit reminder for ${title} at ${timeStr}`);
  } catch (error) {
    console.error("Error scheduling habit reminder", error);
  }
};

export const cancelHabitReminder = async (habitId: string) => {
  if (!isPushCapable()) return;
  try {
    const id = stringToId(habitId);
    await LocalNotifications.cancel({ notifications: [{ id }] });
    console.log(`[notifications] Canceled habit reminder ${habitId}`);
  } catch (error) {
    console.error("Error canceling habit reminder", error);
  }
};
