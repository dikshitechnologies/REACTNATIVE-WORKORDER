import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveTokenForUser, getStoredUser } from './utils/fcm';
import AnimatedLogin from "./Screens/Login";
import ArtisansReport from "./Screens/ArtisansReport";
import PendingReports from "./Screens/PendingReports";
import DeliveredReports from "./Screens/DeliveredReports";
import AdminReports from "./Screens/AdminReports";
import OverdeuReports from "./Screens/OverdueReports";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // create an Android notification channel (required on Android 8+)
    (async () => {
      try {
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
        console.log('Notifee channel created:', channelId);
      } catch (e) {
        console.warn('Failed to create notifee channel', e);
      }
    })();

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived (foreground).', remoteMessage);
      try {
        // Prefer notification payload title/body; fallback to data
        const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Notification';
        const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';

        // Display a local/system notification so user sees it in the notification shade
        await notifee.displayNotification({
          title,
          body,
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher', // ensure you have a small icon resource
            pressAction: { id: 'default' },
          },
          data: remoteMessage?.data || {},
        });
      } catch (err) {
        console.warn('Failed to display foreground notification', err);
      }
    });

    // Token refresh
    const tokenUnsub = messaging().onTokenRefresh(async token => {
      console.log('FCM token refreshed:', token);
      try {
        await AsyncStorage.setItem('fcmToken', token);
      } catch (e) {
        console.warn('Failed to save refreshed token', e);
      }

      // try to send refreshed token to backend for stored user
      try {
        const stored = await getStoredUser();
        if (stored?.userCode && stored?.userType) {
          await saveTokenForUser(stored.userCode, token, stored.userType);
        }
      } catch (err) {
        console.warn('Failed to send refreshed token to backend', err);
      }
    });

    return () => {
      unsubscribe();
      tokenUnsub();
    };
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
     
          <Stack.Screen name="Login" component={AnimatedLogin} />
          <Stack.Screen name="ArtisansReport" component={ArtisansReport} />
          <Stack.Screen name="PendingReports" component={PendingReports} />
          <Stack.Screen name="DeliveredReports" component={DeliveredReports} />
          <Stack.Screen name="AdminReports" component={AdminReports} />
          <Stack.Screen name="OverdueReports" component={OverdeuReports} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
