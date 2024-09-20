import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserData = async (user) => {
  try {
    const userData = {
      age : user.age,
      display_name: user.display_name,
      email: user.email,
      isAdmin: user.isAdmin,
      isPyme: user.isPyme,
      last_name: user.last_name,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      uid: user.uid
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  } 

};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
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
