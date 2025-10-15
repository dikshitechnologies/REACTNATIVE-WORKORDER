import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../Screens/Links';

export const saveTokenForUser = async (userCode, token, userType) => {
  try {
    if (!userCode || !token || !userType) {
      console.warn('saveTokenForUser missing params', { userCode, token, userType });
      return null;
    }

    const url = `${BASE_URL}UserToken/SaveToken`;
    console.log('Saving token to:', url, { userCode, token, userType });

    const resp = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ userCode: userCode.toString(), token, userType }),
    });

    const text = await resp.text();
    console.log('SaveToken response', resp.status, text);
    return resp;
  } catch (error) {
    console.error('saveTokenForUser error', error);
    throw error;
  }
};

export const persistCurrentUser = async (userCode, userType) => {
  try {
    if (!userCode || !userType) return;
    await AsyncStorage.setItem('currentUserCode', userCode.toString());
    await AsyncStorage.setItem('currentUserType', userType.toString());
  } catch (e) {
    console.warn('persistCurrentUser failed', e);
  }
};

export const getStoredUser = async () => {
  try {
    const userCode = await AsyncStorage.getItem('currentUserCode');
    const userType = await AsyncStorage.getItem('currentUserType');
    if (!userCode || !userType) return null;
    return { userCode, userType };
  } catch (e) {
    console.warn('getStoredUser failed', e);
    return null;
  }
};
