import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
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
          ...userData, // Datos del documento de Firestore
          uid: user.uid, // Añadir el `uid` del objeto `user`
        };
        
        await saveUserData(combinedUserData);
        
        // await saveUserData(user);
        // Combinar el `uid` de Firebase con los datos del documento de Firestore
        // const savedUserData = await getUserData();
        // console.log(savedUserData);

        setForm({
          email: "",
          password: "",
        });
        setShowPassword(false);

        router.push({ pathname: "menu", params: { user: userData } });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.title}>Inicia sesión</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#C61919" />
          ) : (
            <View style={styles.form}>
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
                onPress={handleGuestLogin}
                style={[styles.btnContain]}
              >
                <View style={[styles.btn, { backgroundColor: "#222C57" }]}>
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    Ingresar como Invitado
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.label}>
                ¿No tienes cuenta?{" "}
                <Link href={"/RegisterScreen"} style={styles.labelLink}>
                  Regístrate en IKAM
                </Link>
              </Text>
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#222C57",
    marginBottom: 15,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 13,
  },
  error: {
    textAlign: "center",
    color: "#C61919",
    marginVertical: 10,
  },
  formLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222C57",
    marginBottom: 20,
    textAlign: "center",
  },
  btnContain: {
    marginVertical: 10,
    alignItems: "center",
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: "#C61919",
    borderColor: "#222C57",
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  label: {
    marginTop: 25,
    textAlign: "center",
    fontSize: 16,
  },
  labelLink: {
    color: "blue",
  },
});

export default LoginScreen;
