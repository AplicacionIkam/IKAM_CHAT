import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colorsIkam from "@/assets/estilos";
import { getUserData } from "@/auth/authService";
import { User } from "@/models/User";
import { enviarMensaje, suscribirseAlChat, verificarYCrearChat } from "@/services/services";

type Mensaje = {
  user: string;
  mensaje: string;
  timestamp: string;
};

const chatNuevo = () => {
  const item = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensaje, setMensaje] = useState("");

  const user = "1";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData?.uid) {      
      const chatId = `${userData.uid}-${item.id}`;
      const pyme = item.id.toString();

      const crearChatYEscucharMensajes = async () => {        
        await verificarYCrearChat(chatId, userData.uid, pyme);        
        
        const unsubscribe = suscribirseAlChat(chatId, (mensajes) => {          
          setMensajes(mensajes);
        });        
        return () => unsubscribe && unsubscribe();
      };
      crearChatYEscucharMensajes();
    }

  }, [userData]);

  const enviarMesaje = () => {
    if (mensaje.trim() === "") return;
    const chatId = userData?.uid + "-" + item.id;
    if (userData?.uid) {
      enviarMensaje(chatId, mensaje, userData.uid);
    }
    setMensaje("");
  };

  const formatearHora = (timestamp: any) => {
    const date = timestamp.toDate(); // Convertir el Timestamp a objeto Date
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formato de hora
  };

  // useEffect(() => {
  //   if (userData?.uid && item.id) {
  //     const chatId = userData.uid + "-" + item.id;
  //     console.log("Chat ID generado:", chatId);

  //     const unsubscribe = suscribirseAlChat(chatId, (mensajes) => {
  //       console.log("Mensajes recibidos:", mensajes);
  //       setMensajes(mensajes);
  //     });

  //     return () => unsubscribe && unsubscribe();
  //   }
  // }, [userData]);

  return (
    <View style={estilos.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colorsIkam.rojo.backgroundColor },
          headerTitle: item.nombre_pyme.toString(),
          headerTintColor: "white",
          headerBackTitle: "Volver",
          headerShown: true,
          headerTitleAlign: "center",
        }}
      />
      <View style={estilos.chatContainer}>
        <ScrollView>
          <View style={estilos.messagesContainer}>
            
            {mensajes.length > 0 ? (
              <View>
                {mensajes.map((m, index) => (
                  <View>
                    {m.user == userData?.uid ? (
                      <View style={estilos.containerMensajeDerecha}>
                        <View style={estilos.messageContainerDer}>
                          <View key={index}>
                            <Text style={estilos.mensajeTexto}>
                              {m.mensaje}
                            </Text>
                            <Text style={estilos.mensajeHora}>{formatearHora(m.timestamp)}</Text>
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
                            <Text style={estilos.mensajeHora}>{formatearHora(m.timestamp)}</Text>
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
