import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";

import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";

const { width, height } = Dimensions.get("window");

  import { auth, ikam } from "@/firebase/config-ikam";
import { getUserData, saveUserData } from "@/auth/authService";
import ModalPassword from "@/components/modalPassword";

// Importa las funciones de Firebase Messaging
import messaging from "@react-native-firebase/messaging";

const Logo = require("@/assets/img/logo_ikam.png");

const LoginScreen = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState(""); // Almacena el token FCM

  // Solicita permisos para notificaciones push y obtiene el token FCM
  const requestUserPermission = async (userUid) => {
    try {
      const authStatus = await messaging().requestPermission();
      const isEnabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (isEnabled) {
        console.log("Permisos para notificaciones concedidos.");
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log("Token FCM generado:", token);

        // Actualiza Firestore con el token
        await updateUserPushTokens(userUid, token);
      } else {
        console.log("Permisos para notificaciones denegados.");
      }
    } catch (error) {
      console.error("Error al solicitar permisos para notificaciones:", error);
    }
  };

  // Actualiza los tokens de notificación en Firestore
  const updateUserPushTokens = async (userUid, newToken) => {
    const userDocRef = doc(ikam, "users", userUid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (!userData.tokens || !userData.tokens.includes(newToken)) {
        await updateDoc(userDocRef, {
          tokens: arrayUnion(newToken),
        });
        console.log("Token FCM guardado en Firestore.");
      } else {
        console.log("El token FCM ya existe en Firestore.");
      }
    } else {
      console.log("No se encontraron datos del usuario en Firestore.");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;
      const userDocRef = doc(ikam, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const combinedUserData = {
          ...userData,
          uid: user.uid,
        };

        await saveUserData(combinedUserData);

        setForm({
          email: "",
          password: "",
        });
        setShowPassword(false);

        router.push({ pathname: "menu", params: { user: userData } });

        // Solicita permisos y obtiene el token de notificación
        await requestUserPermission(user.uid);
      } else {
        setErrorMessage("No se encontraron datos del usuario.");
      }
    } catch (error) {
      setErrorMessage("Correo o contraseña incorrectos");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      router.push({
        pathname: "menu",
        params: { user: { uid: user.uid, isAnonymous: true } },
      });
    } catch (error) {
      setErrorMessage("Error al iniciar sesión como invitado");
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.email || !form.password) {
      Alert.alert("Campos vacios", "Todos los campos deben ser llenados");
      return false;
    }
    return true;
  };

  // Agregar los manejadores de mensajes
  useEffect(() => {
    // Manejo de mensajes en primer plano
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("¡Nuevo mensaje FCM recibido!", JSON.stringify(remoteMessage));
    });

    // Cleanup de los manejadores cuando el componente se desmonta
    return () => {
      unsubscribeForeground();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.title}>Inicia Sesión</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#C61919" />
          ) : (
            <View style={styles.form}>
              {/* Formulario de login */}
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardType="email-address"
                onChangeText={(email) => setForm({ ...form, email })}
                placeholder="Correo electrónico"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.email}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  secureTextEntry={!showPassword}
                  onChangeText={(password) => setForm({ ...form, password })}
                  placeholder="Contraseña"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.password}
                />
                <FontAwesome5
                  style={styles.eyeIcon}
                  name={showPassword ? "eye" : "eye-slash"}
                  size={25}
                  color="#222C57"
                  onPress={() => setShowPassword(!showPassword)}
                />
              </View>

              {errorMessage ? (
                <Text style={styles.error}>{errorMessage}</Text>
              ) : null}

              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={styles.formLink}>
                  ¿Has olvidado tu contraseña?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (validateForm()) {
                    handleLogin();
                  }
                }}
                style={styles.btnContain}
              >
                <View style={styles.btn}>
                  <Text style={styles.btnText}>Ingresar</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/RegisterScreen")}
                style={[styles.btnContain]}
              >
                <View style={[styles.btn, { backgroundColor: "#222C57" }]}>
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    Regístrate
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleGuestLogin}>
                <Text style={styles.labelLink}>Ingresa como invitado</Text>
              </TouchableOpacity>
            </View>
          )}
          <ModalPassword
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    alignItems: "center",
  },
  logo: {
    width: width * 0.6,
    height: height * 0.2,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#222C57",
    marginBottom: 20,
  },
  form: {
    width: "100%",
  },
  inputControl: {
    height: 50,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 12,
  },
  error: {
    color: "#e74c3c",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  formLink: {
    textAlign: "center",
    color: "#0000ff",
    fontSize: 14,
    marginBottom: 10,
  },
  btnContain: {
    marginBottom: 10,
    width: "100%",
  },
  btn: {
    backgroundColor: "#C61919",
    borderRadius: 10,
    paddingVertical: 15,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  labelLink: {
    textAlign: "center",
    color: "#1a73e8",
    fontSize: 14,
    marginTop: 15,
  },
});

export default LoginScreen;