import preguntas from "@/app/configuracion/preguntas";
import { getUserData } from "@/auth/authService";
import { preguntaDb, soporte } from "@/services/services";
import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";

import Icon from "react-native-vector-icons/FontAwesome5";

const img = require("@/assets/img/Abu8.png");

const ModalPregunta = ({ modalVisible, setModalVisible }) => {  
  const [userData, setUserData] = useState();
  const [recuperar, setRecuperar] = useState(false);
  const [form, setForm] = useState({
    pregunta: "",
    correo: "",
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
    const { pregunta, correo } = form;

    if (!pregunta) {
      Alert.alert("Error", "Por favor, escriba su pregunta");
      return;
    }

    try {
      await preguntaDb(pregunta, correo);            
      setRecuperar(true)      
      setForm((prevForm) => ({
        ...prevForm,
        pregunta: '',
      }));      
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      //   setLoading(false);
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
                <Text style={estilos.modalContent}>
                  Por favor, agregue su pregunta.
                </Text>
                <View>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    keyboardType="email-address"
                    onChangeText={(pregunta) => setForm({ ...form, pregunta })}
                    placeholder="Pregunta"
                    placeholderTextColor="#6b7280"
                    style={estilos.inputControl}
                    value={form.pregunta}
                    multiline={true}
                  />
                </View>
                <TouchableOpacity onPress={enviarM}>
                  <View style={estilos.btnContain}>
                    <View style={estilos.btn}>
                      <Text style={estilos.btnText}>Enviar</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={estilos.modalText}>
                  Se ha enviado se pregunta
                </Text>
                <Text style={estilos.modalContent}>
                El equipo de Ikam Multitiendas atenderá su duda, gracias.
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
    height: "65%",
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
    marginBottom: 2,
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
    height: 150,
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

export default ModalPregunta;
