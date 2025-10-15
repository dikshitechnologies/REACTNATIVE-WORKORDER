/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
	console.log('Message handled in the background!', remoteMessage);
	try {
		// Dynamically import notifee to avoid requiring it at JS startup in the background
		const notifee = require('@notifee/react-native');
		const channelId = await notifee.createChannel({ id: 'default', name: 'Default Channel' });
		const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Notification';
		const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';
		await notifee.displayNotification({
			title,
			body,
			android: { channelId, smallIcon: 'ic_launcher', pressAction: { id: 'default' } },
			data: remoteMessage?.data || {},
		});
	} catch (err) {
		console.warn('Background notification failed', err);
	}
});

AppRegistry.registerComponent(appName, () => App);
