import PushNotification from 'react-native-push-notification';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';


export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      // console.log('Notification received:', notification);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });
};

export const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: "default-channel-id",
      channelName: "Default Channel",
      channelDescription: "A default channel",
      soundName: "default",
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};

export const showNotification = (message) => {
  PushNotification.localNotification({
    channelId: "default-channel-id",
    title: message.notification.title,
    message: message.notification.body,
    // bigPictureUrl: message.notification.image || undefined, // Add image URL if present
    // bigLargeIcon: "ic_launcher", // Optional
    // largeIcon: "ic_launcher", // Optional
  });
};


const checkAndRequestExactAlarmPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    // Check if permission is already granted
    const result = await check(PERMISSIONS.ANDROID.SCHEDULE_EXACT_ALARM);

    if (result === RESULTS.DENIED) {
      // Request the permission
      const requestResult = await request(PERMISSIONS.ANDROID.SCHEDULE_EXACT_ALARM);

      if (requestResult === RESULTS.GRANTED) {
        console.log('Exact alarm permission granted');
      } else {
        console.log('Exact alarm permission denied');
      }
    } else if (result === RESULTS.GRANTED) {
      console.log('Exact alarm permission already granted');
    }
  }
};

// export const scheduleNotification = async () => {
//   await checkAndRequestExactAlarmPermission();
//   console.log("SHOWNOTIFICATIONWORKING::::::::::::::::::::::::::::")
//   // Schedule the notification only if the permission is granted
//   PushNotification.localNotificationSchedule({
//     channelId: "default-channel-id",
//     // id: "unique-id-1234",
//     title: "Reminder",
//     message: "You still have items in your cart! Don't forget to check out.",
//     date: new Date(Date.now() + 20 * 1000), // 20 seconds from now
//     // date: new Date(Date.now() +3* 60 * 1000), // 3 minutes from now
//     // date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
//     // date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 day from now
//     // allowWhileIdle: true, // Allows notification even if device is idle
//   });
// };

export const scheduleNotification = async () => {
  const schedule = async () => {
    await checkAndRequestExactAlarmPermission();

    try {
      PushNotification.localNotificationSchedule({
        channelId: "default-channel-id",
        id: "1", // Ensure this ID is unique and valid
        title: "Reminder",
        message: "You still have items in your cart! Don't forget to check out.",
        // date: new Date(Date.now() + 20 * 1000), // 20 seconds from now
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 day from now
        allowWhileIdle: true, // Allows notification even if device is idle
        // data: { screen: "cart" },
      });
      console.log("Notification scheduled successfully.");
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  };

  schedule();
};
