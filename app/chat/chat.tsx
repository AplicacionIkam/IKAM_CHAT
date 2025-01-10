import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colorsIkam from "@/assets/estilos";
import { getUserData } from "@/auth/authService";
import { User } from "@/models/User";
import {
  enviarMensaje,
  suscribirseAlChat,
  getReceptorToken,
  actualizarUnreadCount,
  verificarSiEsPyme,
} from "@/services/services";
import { auth } from "@/firebase/config-ikam";
import Toast from "react-native-root-toast";
import { RootSiblingParent } from "react-native-root-siblings";

type Mensaje = {
  user: string;
  mensaje: string;
  timestamp: string;
};

// Función para enviar notificación push con manejo de errores
async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string
) {
  const url = "https://dxc6q5-3000.csb.app/send-notification";
  const notificationData = {
    token: fcmToken,
    title: title,
    body: body,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationData),
    });

    const result = await response.text();
    console.log(result);

    if (response.ok) {
      console.log("Notificación enviada correctamente");
    } else {
      console.log("Error", result.error || "No se pudo enviar la notificación");
    }
  } catch (error) {
    console.log("Error", error.message);
  }
}

const chatNuevo = () => {
  const item = useLocalSearchParams();
  const [userData, setUserData] = useState<User | null>();
  const [receiverToken, setReceiverToken] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajesCargados, setMensajesCargados] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (mensajes.length > 0 && mensajesCargados && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [mensajes, mensajesCargados]);

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
    if (userData?.uid && item) {
      const chatId = item.id;

      const crearChatYEscucharMensajes = () => {
        const unsubscribe = suscribirseAlChat(
          chatId.toString(),
          (mensajesActualizados) => {
            if (mensajesActualizados.length !== mensajes.length) {
              setMensajes(mensajesActualizados);
            }
          }
        );

        return () => unsubscribe && unsubscribe();
      };

      crearChatYEscucharMensajes();
    }
  }, [userData, item.id]);

  useEffect(() => {
    if (receiverToken) return;

    const fetchReceiverToken = async () => {
      try {
        const receptorId =
          item.idUser === user?.uid ? item.idPyme : item.idUser;
        if (receptorId) {
          const token = await getReceptorToken(receptorId);
          setReceiverToken(token);
        }
      } catch (error) {
        console.error("Error al obtener el token del receptor:", error);
      }
    };

    if (user) {
      fetchReceiverToken();
    }
  }, [user]);

  // Enviar mensaje y notificación push
  const enviarMesaje = async () => {
    if (mensaje.trim() === "") {
      Toast.show("¡Atención! Escribe un mensaje.", {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      return;
    }

    const chatId = item.id;

    if (userData?.uid) {
      const isPyme = await verificarSiEsPyme(userData.uid);
      let tipo = isPyme ? "unreadCountUser" : "unreadCountPyme";
      if (userData.uid === item.idUser) {
        tipo = "unreadCountPyme";
      }

      // Primero, actualiza el contador de mensajes no leídos
      await actualizarUnreadCount(chatId, tipo, 1);

      // Enviar mensaje al chat
      await enviarMensaje(chatId.toString(), mensaje, userData.uid);

      if (receiverToken) {
        const tituloNotificacion = (isPyme != null) ? userData.display_name : isPyme.nombre_pyme;
        const cuerpoNotificacion = mensaje;

        const notificacionEnviada = await sendPushNotification(
          receiverToken.toString(),
          tituloNotificacion,
          cuerpoNotificacion
        );

        if (notificacionEnviada) {
          console.log(
            "La notificación fue enviada correctamente al usuario con token: " +
              receiverToken
          );
        } else {
          console.log("Hubo un error al enviar la notificación");
        }
      }
    }
    setMensaje("");
  };

  const formatearHora = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <RootSiblingParent>
      <View style={estilos.container}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: colorsIkam.rojo.backgroundColor },
            headerTitle: item.nombre ? item.nombre.toString() : "Sin nombre",
            headerTintColor: "white",
            headerBackTitle: "Volver",
            headerShown: true,
            headerTitleAlign: "center",
          }}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          <View style={estilos.chatContainer}>
            <ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
              <View style={estilos.messagesContainer}>
                <Text
                  style={{ fontSize: 20, textAlign: "center", marginTop: 15 }}
                ></Text>
                {mensajes.length > 0 ? (
                  <View>
                    {mensajes.map((m, index) => (
                      <View key={index}>
                        {m.user == userData?.uid ? (
                          <View style={estilos.containerMensajeDerecha}>
                            <View style={estilos.messageContainerDer}>
                              <View>
                                <Text style={estilos.mensajeTexto}>
                                  {m.mensaje}
                                </Text>
                                <Text style={estilos.mensajeHora}>
                                  {formatearHora(m.timestamp)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ) : (
                          <View style={estilos.containerMensajeIzquierda}>
                            <View style={estilos.messageContainerIzq}>
                              <View>
                                <Text style={estilos.mensajeTexto}>
                                  {m.mensaje}
                                </Text>
                                <Text style={estilos.mensajeHora}>
                                  {formatearHora(m.timestamp)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View>{/* <Text>No hay mensajes todavia</Text> */}</View>
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
                <TouchableOpacity
                  style={estilos.sendButton}
                  onPress={enviarMesaje}
                >
                  <Feather name="send" size={25} color="#737373" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RootSiblingParent>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
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
    marginRight: 14,
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
    backgroundColor: "#e5e5e5",
    marginRight: 2,
    marginVertical: 2,
    borderRadius: 50,
    padding: 9,
    elevation: 1,
    position: "static",
  },
});

export default chatNuevo;
