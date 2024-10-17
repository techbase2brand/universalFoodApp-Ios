// import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import { configureNotifications, showNotification, createNotificationChannel } from './src/notifications';
// import PushNotification from 'react-native-push-notification';
// PushNotification.configure({
//   onNotification: function(notification) {
//     console.log('Notification received:', notification);
//   },
//   permissions: {
//     alert: true,
//     badge: true,
//     sound: true,
//   },
//   popInitialNotification: true,
//   requestPermissions: Platform.OS === 'ios',
// });

// // Function to display notification
// const showNotification = (message) => {
//   PushNotification.localNotification({
//     title: message.notification.title,
//     message: message.notification.body,
//   });
// };

// // Background message handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
//   // Call showNotification function to display notification
//   showNotification(remoteMessage);
// });

// // Foreground message handler
// messaging().onMessage(async remoteMessage => {
//   console.log('Message handled in the foreground!', remoteMessage);
//   // Call showNotification function to display notification
//   showNotification(remoteMessage);
// });

configureNotifications();
createNotificationChannel();

// // Background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  showNotification(remoteMessage);
});

// Foreground message handler
messaging().onMessage(async remoteMessage => {
  console.log('Message handled in the foreground!', remoteMessage);
  showNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
