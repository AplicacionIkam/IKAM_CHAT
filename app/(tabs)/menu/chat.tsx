import { getUserData } from "@/auth/authService";
import Chatlist from "@/components/Chatlist";
import { Pyme } from "@/models/Pyme";
import { User } from "@/models/User";
import { suscribirseAPymes, suscribirseAChats, suscribirseAMensajes } from "@/services/services"; // Asegúrate de que las funciones estén definidas
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

interface Chat {
  id: string;
  idPyme: string;
  idUser: string;  
  ultimoMensaje?: string;
  hora?: string;
}

interface Chats {
  id: string;
  idPyme: string;
  idUser: string;  
  img: string;
  nombre: string;
  ultimoMensaje?: string;
  hora?: string;
}

const Chat = () => {  
  const [chat, setChat] = useState<Chat[]>([]);
  const [chats, setChats] = useState<Chats[]>([]);
  const [pymes, setPymes] = useState<Pyme[]>([]);  
  const [userData, setUserData] = useState<User | null>(null);  

  // Datos del Usuario  
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

  // Traer chats del usuario
  useEffect(() => {
    if (userData) {
      const unsubscribe = suscribirseAChats(userData.uid, (chatsData) => {
        setChat(chatsData); // Guarda los chats en el estado
      });

      return () => unsubscribe && unsubscribe();
    }
  }, [userData]);

  // Traer PYMEs
  useEffect(() => {
    const unsubscribe = suscribirseAPymes((pymesData) => {
      const pymesOrdenadas = pymesData.sort((a, b) =>
        a.nombre_pyme.localeCompare(b.nombre_pyme)
      );
      setPymes(pymesOrdenadas);
    });

    return () => unsubscribe && unsubscribe();
  }, []);  

  // Escuchar mensajes y actualizar el último mensaje
  useEffect(() => {
    chat.forEach(chatItem => {
      const unsubscribe = suscribirseAMensajes(chatItem.id, (mensajes:any) => {
        if (mensajes.length > 0) {
          const ultimoMensaje = mensajes[mensajes.length - 1]; // Obtiene el último mensaje
          setChats(prevChats => prevChats.map(c => 
            c.id === chatItem.id 
              ? { ...c, ultimoMensaje: ultimoMensaje.mensaje, hora: ultimoMensaje.timestamp } 
              : c
          ));
        }
      });

      return () => unsubscribe && unsubscribe();
    });
  }, [chat]); 

  // Combinar chats con PYMEs
  useEffect(() => {
    const chatsConInfo = chat.map(chatItem => {
      const pyme = pymes.find(p => p.id === chatItem.idPyme);
      return {
        id: chatItem.id,
        idPyme: chatItem.idPyme,
        idUser: chatItem.idUser,
        img: pyme ? pyme.imagen1 : "",
        nombre: pyme ? pyme.nombre_pyme : "PYME no encontrada",
        ultimoMensaje: chatItem.ultimoMensaje,
        hora: chatItem.hora || new Date().toISOString(),
      };
    }).sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

    setChats(chatsConInfo);
  }, [chat, pymes]); 
  

  return (
    <View style={{flex:1}}>
      {chats.length > 0 ? (
        <Chatlist users={chats} />
      ) : (
        <View>
          <ActivityIndicator size={"large"} />
        </View>
      )}
    </View>
  );
};

export default Chat;
