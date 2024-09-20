import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import colorsIkam from "@/assets/estilos";
type Mensaje = {
  user: string;
  mensaje: string;
  time: string;
};

const chatNuevo = () => {
  const item = useLocalSearchParams();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensaje, setMensaje] = useState("");
  const user = "1";

  const men = [
    {
      user: "1",
      mensaje: " hola, buenas noches",
      time: "10:30 pm",
    },
    { user: "2", mensaje: "hola, buenas noches", time: "10:32 pm" },
    { user: "2", mensaje: "En que le puedo servir", time: "10:32 pm" },
    { user: "1", mensaje: "Quisiera saber los costos", time: "10:33 pm" },
    { user: "2", mensaje: "Le envio nuestra lista de precios", time: "10:32 pm" },
    { user: "1", mensaje: "Gracias", time: "10:33 pm" },
  ];

  useEffect(() => {
    setMensajes(men);
  }, []);  

  const verDetalle = (item: any) => {
    // router.push({ pathname: "/list/[id]", params: item });
  };

  const enviarMesaje = () => {
    if (mensaje == "") return;
    // console.log(mensaje);
    setMensajes((prevMensajes) => [
      ...prevMensajes,
      { user: "1", mensaje: mensaje, time: "10:50 pm" },
    ]);

    setMensaje("");
  };

  return (
    <View style={estilos.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colorsIkam.rojo.backgroundColor },
          headerTitle: item.nombre_pyme.toString() + ": nuevo",
          headerTintColor: "white",
          headerBackTitle: "Volver",
          headerShown: true,
          headerTitleAlign: "center",          
        }}
      />
      {/* <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "blue" },
          headerTintColor: "white",
          headerBackTitle: "Atras",
          headerTitle: `${item.nombre}`,
          headerTitleAlign: "center",
          headerRight: () => (
            <View>
              {item?.img && typeof item.img === "string" && (
                <TouchableOpacity onPress={() => verDetalle(item)}>
                  <Image
                    source={{ uri: item.img }}
                    style={estilos.headerImage}
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      /> */}
      <View style={estilos.chatContainer}>
        <ScrollView>
          <View style={estilos.messagesContainer}>
            <Text style={{ fontSize: 20, textAlign: "center", marginTop: 15 }}>
              {item.img}
            </Text>
            {mensajes.length > 0 ? (
              <View>
                {mensajes.map((m, index) => (
                  <View>
                    {m.user == "1" ? (
                      <View style={estilos.containerMensajeDerecha}>
                        <View style={estilos.messageContainerDer}>
                          <View key={index}>
                            <Text style={estilos.mensajeTexto}>
                              {m.mensaje}
                            </Text>
                            <Text style={estilos.mensajeHora}>{m.time}</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={estilos.containerMensajeIzquierda}>
                        <View style={estilos.messageContainerIzq}>
                          <View key={index}>
                            <Text style={estilos.mensajeTexto}>
                              {m.mensaje}
                            </Text>
                            <Text style={estilos.mensajeHora}>{m.time}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <Text>No hay mensajes todavia</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={estilos.inputContainer}>
          <View style={estilos.inputRow}>
            <TextInput
              placeholder="Mensaje"
              style={estilos.textInput}
              value={mensaje}
              onChangeText={(mensaje) => setMensaje(mensaje)}
            />
            <TouchableOpacity style={estilos.sendButton} onPress={enviarMesaje}>
              <Feather name="send" size={25} color="#737373" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
  },
  headerImage: {
    height: 30,
    width: 30,
    borderRadius: 100,
  },
  chatContainer: {
    flex: 1,
    justifyContent: "space-between",
    overflow: "visible",
  },
  messagesContainer: {
    flex: 1,
  },
  containerMensajeIzquierda: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    marginLeft: 12,
  },
  messageContainerIzq: {
    alignSelf: "flex-end",
    padding: 12,
    borderRadius: 24,
    backgroundColor: "#CEF8FF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxWidth: 350,
  },
  containerMensajeDerecha: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
    marginRight: 12,
  },
  messageContainerDer: {
    alignSelf: "flex-end",
    padding: 12,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxWidth: 350,
  },
  mensajeTexto: {
    fontSize: 20,
  },
  mensajeHora: {
    fontSize: 10,
    textAlign: "right",
  },
  inputContainer: {
    padding: 8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 2,
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 20,
    marginLeft: 15,
  },
  sendButton: {
    position: "relative",
    backgroundColor: "#e5e5e5",
    padding: 5,
    marginRight: 2,
    borderRadius: 50, // rounded-full
  },
});

export default chatNuevo;
