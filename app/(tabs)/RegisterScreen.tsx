import { FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  Pressable,
  StatusBar
} from 'react-native';
import ModalTerminosCondiciones from '@/components/modalPoliticas'; // Asegúrate de que la ruta sea correcta

const { width, height } = Dimensions.get('window');

import { registerUser } from "@/auth/authRegister";

const Logo = require('@/assets/img/logo_ikam.png');

const RegisterScreen = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    last_name: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    const { email, password, confirmPassword, name, last_name } = form;

    // Validaciones
    if (!name || !last_name || !email || !password) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Correo electrónico inválido');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8 || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres, al menos una letra mayúscula, minúsculas y un carácter especial: @#$%^&*(),.?":{}|<>');
      // Alert.alert('Error', 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un carácter especial');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, name, last_name);
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        last_name: '',
      });
      router.push('menu');
    } catch (error) {
      // console.log("Error como string:", error.toString());
      if (error.message.includes('auth/email-already-in-use')) {
        // console.error("El usuario ya existe en nuestra base:", error);
        Alert.alert("Usuario ya registrado", "Ikam Multitiendas: El usuario que intenta registrar ya existe.");
      } else {
        console.error("Error al registrar el usuario:", error);
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  function MyCheckbox() {
    return (
      <Pressable
        style={[styles.checkboxBase, acceptedTerms && styles.checkboxChecked]}
        onPress={() => setAcceptedTerms(!acceptedTerms)}>
        {acceptedTerms && <FontAwesome5 name="check" size={15} color="white" />}
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Image source={Logo} style={styles.logo} />
          <View style={styles.header}>
            <Text style={styles.title}>Regístrate</Text>
          </View>
          {loading ?
            <ActivityIndicator size="large" color="#C61919" />
            :

            <View style={styles.form}>
              {/* Campos de entrada */}
              <View style={styles.input}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="default"
                  onChangeText={name => setForm({ ...form, name })}
                  placeholder="Nombre"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.name}
                />
              </View>

              <View style={styles.input}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="default"
                  onChangeText={last_name => setForm({ ...form, last_name })}
                  placeholder="Apellido"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.last_name}
                />
              </View>

              <View style={styles.input}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="email-address"
                  onChangeText={email => setForm({ ...form, email })}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.email}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  secureTextEntry={!showPassword}
                  onChangeText={password => setForm({ ...form, password })}
                  placeholder="Contraseña"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.password}
                />
                <FontAwesome5
                  style={styles.eyeIcon}
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={25}
                  color="#222C57"
                  onPress={() => {
                    setShowPassword(!showPassword)
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={confirmPassword => setForm({ ...form, confirmPassword })}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#6b7280"
                  style={styles.inputControl}
                  value={form.confirmPassword}
                />
                <FontAwesome5
                  style={styles.eyeIcon}
                  name={showConfirmPassword ? 'eye' : 'eye-slash'}
                  size={25}
                  color="#222C57"
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword)
                  }}
                />
              </View>
              <View style={styles.appContainer}>
                <View style={styles.checkboxContainer}>
                  <MyCheckbox />
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.checkboxLabel}>{`Aceptar términos y condiciones`}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.formAction}>
                <TouchableOpacity onPress={handleRegister}>
                  <View style={styles.btnContain}>
                    <View style={styles.btn}>
                      <Text style={styles.btnText}>Registrar</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>
                ¿Ya tienes una cuenta? <Link href={'LoginScreen'} style={styles.labelLink}>Inicia en IKAM</Link>
              </Text>
            </View>
          }
        </View>
      </ScrollView>

      <ModalTerminosCondiciones
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.2,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#222C57',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#222C57',
    marginBottom: 15,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  error: {
    textAlign: 'center',
    color: '#C61919',
    marginVertical: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkboxBase: {
    width: 25,
    height: 25,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#222C57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#222C57',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: 'blue',
    marginLeft: 10,
  },
  btnContain: {
    marginBottom: 20,
    alignItems: 'center',
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: '#C61919',
    borderColor: '#222C57',
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
  },
  labelLink: {
    color: 'blue',
  },
});

export default RegisterScreen;
