import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
// Importa `@react-native-firebase/messaging` para manejar FCM en React Native
import messaging from "@react-native-firebase/messaging";

const firebaseConfig2 = {
  apiKey: "AIzaSyB-Sm38xUlEJRRS4cB0MKjSjCI_uzRhoE8",
  projectId: "ikamultitiendas",
  storageBucket: "ikamultitiendas.appspot.com",
  authDomain: "ikamultitiendas.firebaseapp.com",
  appId: "1:844394495235:android:34bf6cd669fe2b7d487d36",
  messagingSenderId: "844394495235", // Es necesario para notificaciones push
};

// Verificar si hay alguna app inicializada antes de inicializar una nueva
let app2;
if (!getApps().length) {
  app2 = initializeApp(firebaseConfig2);
} else {
  app2 = getApps()[0];
}

const auth = initializeAuth(app2, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const ikam = getFirestore(app2);

// Configuración de `@react-native-firebase/messaging`
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Mensaje en segundo plano recibido:", remoteMessage);
});

export { app2, ikam, auth, messaging };
