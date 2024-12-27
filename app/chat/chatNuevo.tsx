import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  enviarMensajeDefault,
  suscribirseAlChat,
  verificarYCrearChat,
  actualizarUnreadCount,
  verificarSiEsPyme,
} from "@/services/services";
import Toast from "react-native-root-toast";

type Mensaje = {
  user: string;
  mensaje: string;
  timestamp: string;
};

async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { someData: "chat message" },
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error de red o al enviar la notificación:", error);
    return false;
  }
}

const chatNuevo = () => {
  const item = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>();
  const [receiverToken, setReceiverToken] = useState<string | null>(null);

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
    const chatId = userData?.uid + "-" + item.id;
    if (userData?.uid) {
      await actualizarUnreadCount(chatId, "unreadCountPyme", 1);
      enviarMensaje(chatId, mensaje, userData.uid);

      if (receiverToken) {
        // Preparar notificación
        const tituloNotificacion = userData.display_name; // Usar el nombre del usuario como título
        const cuerpoNotificacion = mensaje; // Usar el mensaje como cuerpo

        // Enviar notificación
        const notificacionEnviada = await sendPushNotification(
          receiverToken, // Asegúrate de pasar un array de tokens
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
    const date = timestamp.toDate(); // Convertir el Timestamp a objeto Date
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Formato de hora
  };

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
      <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={90}
                 // Ajusta según el alto de tu header
              >
      <View style={estilos.chatContainer}>
        <ScrollView>
          <View style={estilos.messagesContainer}>
            <Text
              style={{ fontSize: 20, textAlign: "center", marginTop: 15 }}
            ></Text>
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
                            <Text style={estilos.mensajeHora}>
                              {formatearHora(m.timestamp)}
                            </Text>
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
            <TouchableOpacity style={estilos.sendButton} onPress={enviarMesaje}>
              <Feather name="send" size={25} color="#737373" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
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
    backgroundColor: "#e5e5e5",
    marginRight: 2,
    borderRadius: 50,
    padding: 9,
    elevation: 1,
    position: "absolute",
    top: 4,
    right: 4,
  },
});

export default chatNuevo;
