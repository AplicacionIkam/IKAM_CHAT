import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from "react-native";

import { Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import app2 from "@/firebase/config-ikam";
const auth = getAuth(app2);

const img = require("@/assets/img/Abu8.png");

const ModalPassword = ({ modalVisible, setModalVisible }) => {  
  const [recuperar, setRecuperar] = useState(false);
  const [form, setForm] = useState({
    email: "",
  });

  const handlepassword = async () => {    
    await sendPasswordResetEmail(auth, form.email)
      .then(() => null)
      .catch((error: any) => console.log("error",error));
  };

  const handleRecover = async () => {
    const { email } = form;

    // Validaciones
    if (!email) {
      Alert.alert(
        "Sin correo",
        "Para recuperar la contraseña debe ingresar un correo."
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Correo electrónico inválido");
      return;
    }

    try {            
      handlepassword();
      setRecuperar(true);
      setForm({
        email: "",
      });
    } catch (error) {
      console.log(error);      
      //
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
        setRecuperar(false);
        StatusBar.setHidden(false);
      }}
    >
      <View style={estilos.modalBackground}>
        <View style={estilos.modalView}>
          <View style={estilos.btnCerrar}>
            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible);
                setRecuperar(false);
              }}
            >
              {({ pressed }) => (
                <Icon
                  name="times"
                  size={35}
                  color={pressed ? "blue" : "red"}
                  solid
                />
              )}
            </Pressable>
          </View>
          <View style={{ height: 35 }}></View>
          <ScrollView contentContainerStyle={estilos.scrollView}>
            {!recuperar ? (
              <View>
                <Text style={estilos.modalText}>¿Olvidó su contraseña?</Text>
                <Text style={estilos.modalContent}>
                  Por favor, proporcione el correo electrónico asociado a la
                  cuenta que desea recuperar.
                </Text>
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    keyboardType="email-address"
                    onChangeText={(email) => setForm({ ...form, email })}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#6b7280"
                    style={estilos.inputControl}
                    value={form.email}
                  />
                </View>
                <TouchableOpacity onPress={handleRecover}>
                  <View style={estilos.btnContain}>
                    <View style={estilos.btn}>
                      <Text style={estilos.btnText}>Recuperar contraseña</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={estilos.modalText}>
                  Se ha enviado un correo a su cuenta
                </Text>
                <Text style={estilos.modalContent}>
                  Para cambiar su contraseña, se ha enviado un correo
                  electrónico a la dirección que nos proporcionó. Este correo
                  contiene un enlace seguro que le permitirá restablecer su
                  contraseña. Por favor, revise su bandeja de entrada,
                  incluyendo la carpeta de correo no deseado o spam.
                </Text>
                <View style={estilos.imagenContenedor}>
                  <Image source={img} style={estilos.imagen} />
                </View>
              </View>
            )}
          </ScrollView>
          {/* <TouchableOpacity
            style={[estilos.button, estilos.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={estilos.textStyle}>Cerrar</Text>
          </TouchableOpacity> */}
          {/* <Pressable onPress={() => setModalVisible(!modalVisible)}>
            <Icon name="times" size={30} color="red" solid />
          </Pressable> */}
        </View>
      </View>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    width: "80%",
    height: "45%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  btnCerrar: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    marginTop: 20,
    backgroundColor: "#41DFD1",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
  },
  modalContent: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 10,
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
  imagenContenedor: {
    alignItems: "flex-end",
  },
  imagen: {
    width: 140,
    height: 160,
    resizeMode: "stretch",
  },
});

export default ModalPassword;
