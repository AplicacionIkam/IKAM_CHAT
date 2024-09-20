import colorsIkam from "@/assets/estilos";
import { getUserData } from "@/auth/authService";
import { soporte } from "@/services/services";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const contacto = () => {
  const [userData, setUserData] = useState();
  const [form, setForm] = useState({
    asunto: "",
    mensaje: "",
    correo: "userData.email",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        if (data) {
          setUserData(data);
        } else {
          console.log("No se encontraron datos del usuario");
        }
      } catch (error) {
        console.error("Error al recuperar los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setForm((prevForm) => ({
        ...prevForm,
        correo: userData.email,
      }));
    }
  }, [userData]);

  const enviarM = async () => {
    const { asunto, mensaje, correo } = form;

    if (!asunto || !mensaje) {
      Alert.alert("Error", "Todos los campos son requeridos");
      return;
    }

    try {
      await soporte(asunto, mensaje, correo);
      Alert.alert("Mensaje enviado", "Ikam Multitiendas atenderá su petición");
      setForm({
        asunto: "",
        mensaje: "",
        correo: "",
      });
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      //   setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colorsIkam.rojo.backgroundColor },
          headerTitle: "Contacto",
          headerTitleAlign: "center",
          headerTintColor: "white",
          headerBackTitle: "Perfil",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View>
            <Text style={styles.title}>Ikam Multitiendas</Text>
          </View>
          <View style={styles.form}>
            {/* Campos de entrada */}
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="default"
              onChangeText={(asunto) => setForm({ ...form, asunto })}
              placeholder="Asunto"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.asunto}
            />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="default"
              onChangeText={(mensaje) => setForm({ ...form, mensaje })}
              placeholder="Mensaje"
              placeholderTextColor="#6b7280"
              style={styles.inputControlTarea}
              value={form.mensaje}
              multiline={true}
            />
            <TouchableOpacity onPress={enviarM}>
              <View style={styles.btnContain}>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>Enviar</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  inputControlTarea: {
    height: 200,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#222C57",
    marginBottom: 15,
    textAlignVertical: "top",
  },
  btnContain: {
    marginBottom: 20,
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
});

export default contacto;
