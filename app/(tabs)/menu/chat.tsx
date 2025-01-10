import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { getUserData } from "@/auth/authService";
import Chatlist from "@/components/Chatlist";
import { Pyme } from "@/models/Pyme";
import { User } from "@/models/User";
import {
  suscribirseAPymes,
  suscribirseAChats,
  suscribirseAMensajes,
  suscribirseAChatsPyme,
  suscribirseAMensajesPyme,
  suscribirseAUser,
} from "@/services/services";
import { listenToUserChanges } from "@/services/services";

interface Chat {
  id: string;
  idPyme: string;
  idUser: string;
  unreadCountPyme: number;
  unreadCountUser: number;
  ultimoMensaje?: string;
  hora?: string;
  user?: string;
}

interface Chats {
  id: string;
  idPyme: string;
  idUser: string;
  img: string;
  nombre: string;
  ultimoMensaje?: string;
  hora?: string;
  user?: string;
  unreadCountPyme: number;
  unreadCountUser: number;
}

const Chat = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [pymes, setPymes] = useState<Pyme[]>([]);
  const [users, setUsers] = useState<User[] | null>(null);
  const [chat, setChat] = useState<Chat[]>([]);
  const [chats, setChats] = useState<Chats[]>([]);
  const [chatPyme, setChatPyme] = useState<Chat[]>([]);
  const [chatsPyme, setChatsPyme] = useState<Chats[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        if (data && data.uid) {
          // Inicializa la escucha si hay datos de usuario
          const unsubscribe = listenToUserChanges(data.uid, setUserData);

          // Limpia la suscripción cuando el componente se desmonte
          return () => unsubscribe();
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Subscribe to PYMEs
  useEffect(() => {
    const unsubscribe = suscribirseAPymes((pymesData) => {
      setPymes(
        pymesData.sort((a, b) =>
          (a.nombre_pyme || "").localeCompare(b.nombre_pyme || "")
        )
      );
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // Subscribe to users if is Pyme
  useEffect(() => {
    if (userData?.isPyme) {
      const unsubscribe = suscribirseAUser(setUsers);
      return () => unsubscribe && unsubscribe();
    }
  }, [userData]);

  // Subscribe to user chats
  useEffect(() => {
    if (userData) {
      const unsubscribe = suscribirseAChats(userData.uid, setChat);
      return () => unsubscribe && unsubscribe();
    }
  }, [userData]);

  // Update chats with latest messages
  useEffect(() => {
    chat.forEach((chatItem) => {
      const unsubscribe = suscribirseAMensajes(chatItem.id, (mensajes: any) => {
        if (mensajes.length > 0) {
          const { mensaje, timestamp, user } = mensajes[mensajes.length - 1];
          setChats((prevChats) =>
            prevChats.map((c) =>
              c.id === chatItem.id
                ? { ...c, ultimoMensaje: mensaje, hora: timestamp, user }
                : c
            )
          );
        }
      });
      return () => unsubscribe && unsubscribe();
    });
  }, [chat]);

  // Combine chats with PYMEs
  useEffect(() => {
    const chatsConInfo = chat
      .map((chatItem) => {
        const pyme = pymes.find((p) => p.id === chatItem.idPyme);
        return {
          id: chatItem.id,
          user: chatItem.user,
          idPyme: chatItem.idPyme,
          idUser: chatItem.idUser,
          img: pyme?.imagen1 || "",
          nombre: pyme?.nombre_pyme || "PYME no encontrada",
          ultimoMensaje: chatItem.ultimoMensaje,
          hora: chatItem.hora || new Date().toISOString(),
          unreadCountPyme: chatItem.unreadCountPyme || 0, // Asegúrate de incluir esto
          unreadCountUser: chatItem.unreadCountUser || 0, // Asegúrate de incluir esto
        };
      })
      .sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

    setChats(chatsConInfo);
  }, [chat, pymes]);

  // Fetch chats for user-pyme
  useEffect(() => {
    if (userData?.isPyme) {
      const unsubscribe = suscribirseAChatsPyme(userData.pyme, setChatPyme);
      return () => unsubscribe && unsubscribe();
    }
  }, [userData]);

  // Update chatPyme with latest messages
  useEffect(() => {
    if (chatPyme.length > 0) {
      const unsubscribeArray = chatPyme.map((chatItem) =>
        suscribirseAMensajesPyme(chatItem.id, (mensajes: any) => {
          if (mensajes.length > 0) {
            const { mensaje, timestamp, user } = mensajes[mensajes.length - 1];
            setChatPyme((prevChats) =>
              prevChats.map((c) =>
                c.id === chatItem.id
                  ? { ...c, ultimoMensaje: mensaje, hora: timestamp, user }
                  : c
              )
            );
          }
        })
      );
      return () =>
        unsubscribeArray.forEach((unsubscribe) => unsubscribe && unsubscribe());
    }
  }, [chatPyme]);

  // Combine chatPyme with users
  useEffect(() => {
    const chatsConInfo = chatPyme.map((chatItem) => {
      const user = users?.find((p) => p.id === chatItem.idUser);
      return {
        id: chatItem.id,
        user: chatItem.user,
        idPyme: chatItem.idPyme,
        idUser: chatItem.idUser,
        img: user?.photo_url || "",
        nombre: user
          ? `${user.display_name.toUpperCase()} ${user.last_name.toUpperCase()}`
          : "Usuario no encontrado",
        ultimoMensaje: chatItem.ultimoMensaje,
        hora: chatItem.hora || new Date().toISOString(),
        unreadCountPyme: chatItem.unreadCountPyme || 0, // Asegúrate de incluir esto
        unreadCountUser: chatItem.unreadCountUser || 0, // Asegúrate de incluir esto
      };
    });
    setChatsPyme(chatsConInfo);
  }, [chatPyme, users]);

  // Helper function to render Chatlist
  const renderChatList = (title: string, chatData: Chats[]) => (
    <>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#333",
          marginVertical: 10,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Chatlist users={chatData} user={userData?.uid} />
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      {chatsPyme.length > 0 &&
        renderChatList("Mensajes de tus clientes", chatsPyme)}
      {chats.length > 0 &&
        renderChatList("Interacciones con otras tiendas", chats)}
      {chats.length === 0 && chatsPyme.length === 0 && (
        <Text
          style={{
            fontSize: 24,
            color: "#888",
            textAlign: "center",
            marginTop: "75%",
            fontWeight: "bold",
          }}
        >
          No tienes interacciones recientes
        </Text>
      )}
    </View>
  );
};

export default Chat;
