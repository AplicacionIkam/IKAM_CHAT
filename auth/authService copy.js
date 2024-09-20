import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config-ikam';
import { doc, getDoc } from 'firebase/firestore';
import { ikam } from '../firebase/config-ikam';
import { onAuthStateChanged } from 'firebase/auth';

export const saveUserData = async (user) => {
  try {
    const userData = {
      email: user.email,
      uid: user.uid
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async () => {
  try {
    console.log('Retrieving user data from AsyncStorage...');
    const storedUserData = await AsyncStorage.getItem('userData');
    if (!storedUserData) {
      console.log('No user data found in AsyncStorage');
      return null;
    }

    const { uid } = JSON.parse(storedUserData);
    if (!uid) {
      console.log('UID not found in stored user data');
      return null;
    }

    // Verificar si el usuario está autenticado
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      console.log(`Fetching user document for UID: ${uid}`);
      const userDocRef = doc(ikam, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log('User document found:', userDoc.data());
        return { ...userDoc.data(), uid };
      } else {
        console.log('No such document in Firestore!');
        return null;
      }
    } else {
      console.log('User is not authenticated or UID does not match');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
