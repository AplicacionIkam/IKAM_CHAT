import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { ikam } from "@/firebase/config-ikam";
import { Pyme } from "@/models/Pyme";
import { Categoria } from "@/models/Categoria";
import AsyncStorage from "@react-native-async-storage/async-storage";
import user from "@/app/configuracion/perfil";

export const suscribirseAPymes = (callback: (pymes: Pyme[]) => void) => {
  try {
    const unsubscribe = onSnapshot(
      collection(ikam, "pyme"),
      (querySnapshot) => {
        const pymesArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pyme[];
        callback(pymesArray);
      }
    );

    return unsubscribe; // Devuelve la función de limpieza
  } catch (error) {
    console.error("Error suscribiéndose a las pymes:", error);
  }
};

export const suscribirseACategorias = (
  callback: (categorias: Categoria[]) => void
) => {
  try {
    // Se suscribe a la colección "categoria" y actualiza el estado cuando hay cambios
    const unsubscribe = onSnapshot(
      collection(ikam, "categoria"),
      (querySnapshot) => {
        const categoriasArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Categoria[];
        callback(categoriasArray);
      }
    );

    // Retorna la función de limpieza para cancelar la suscripción
    return unsubscribe;
  } catch (error) {
    console.error("Error suscribiéndose a las categorías:", error);
  }
};

export const suscribirseAColonias = (callback: (colonias: any[]) => void) => {
  try {
    const unsubscribe = onSnapshot(
      collection(ikam, "colonia"),
      (querySnapshot) => {
        const coloniasArray = querySnapshot.docs.map((doc) => ({
          // id: `${doc.id}-${doc.data().nombreCol}`,
          label: doc.data().nombreCol,
          value: doc.data().nombreCol,
        }));
        callback(coloniasArray);
      }
    );

    return unsubscribe; // Devuelve la función de limpieza para cancelar la suscripción
  } catch (error) {
    console.error("Error suscribiéndose a las colonias:", error);
  }
};

export const obtenerDetallesPyme = async (pymeId: string) => {
  try {
    const docRef = doc(ikam, "pyme", pymeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Pyme) : null;
  } catch (error) {
    console.error("Error obteniendo detalles de la pyme:", error);
    return null;
  }
};

export const getQuestions = async () => {
  try {
    const querySnapshot = await getDocs(collection(ikam, "preguntas"));
    const questions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

export const subscribeToQuestions = (callback: any) => {
  try {
    const unsubscribe = onSnapshot(
      collection(ikam, "preguntas"),
      (querySnapshot) => {
        const questions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(questions);
      }
    );

    return unsubscribe; // Devuelve la función de desuscripción
  } catch (error) {
    console.error("Error subscribing to questions:", error);
    return () => {}; // Retorna una función vacía en caso de error
  }
};

export const preguntaDb = async (pregunta: any, correo: any) => {
  try {
    await addDoc(collection(ikam, "preguntas"), {
      correo: correo,
      pregunta: pregunta,
      created_time: Timestamp.now(),
    });
    console.log("Documento agregado con éxito");
  } catch (error) {
    console.error("Error al agregar el documento:", error);
  }
};

export const soporte = async (asunto: any, mensaje: any, correo: any) => {
  try {
    await addDoc(collection(ikam, "soporte"), {
      correo: correo,
      asunto: asunto,
      mensaje: mensaje,
      created_time: Timestamp.now(),
    });
    console.log("Documento agregado con éxito");
  } catch (error) {
    console.error("Error al agregar el documento:", error);
  }
};

export const listenToUserChanges = (userUID: any, setUserData: any) => {
  const userDocRef = doc(ikam, "users", userUID);

  // Escuchar los cambios en el documento del usuario
  const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      console.log("Datos del usuario actualizados:", userData);

      // Combinar el `uid` con los datos obtenidos del documento
      const combinedUserData = {
        ...userData, // Datos de Firestore
        uid: userUID, // Añadir el UID del usuario
      };

      // Guardar los datos actualizados en AsyncStorage
      try {
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(combinedUserData)
        );
        console.log("Datos del usuario guardados en AsyncStorage.");
      } catch (error) {
        console.error("Error al guardar los datos en AsyncStorage:", error);
      }

      // Actualizar el estado local con los datos actualizados
      setUserData(combinedUserData);
    } else {
      console.log("El documento del usuario no existe.");
    }
  });

  // Retorna la función para cancelar la suscripción (desconectar la escucha)
  return unsubscribe;
};

export const verificarYCrearChat = async (
  chatId: string,
  userid: string,
  pymeid: string
) => {
  const chatDocRef = doc(ikam, "chat", chatId);
  const chatDoc = await getDoc(chatDocRef);
  if (!chatDoc.exists()) {
    await setDoc(chatDocRef, {
      creadoEn: new Date(),
      idPyme: pymeid,
      idUser: userid,
    });
  }
};

export const suscribirseAlChat = (
  chatId: string,
  callback: (mensajes: any[]) => void
) => {
  try {
    // Escuchar los mensajes de la subcolección `mensaje` en tiempo real
    const mensajesQuery = query(
      collection(ikam, "chat", chatId, "mensaje"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(mensajesQuery, (querySnapshot) => {
      const mensajesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(mensajesArray);
    });

    return unsubscribe; // Devuelve la función de limpieza
  } catch (error) {
    console.error("Error suscribiéndose al chat:", error);
  }
};

// Función para suscribirse a los chats del usuario
export const suscribirseAChats = (
  userId: string,
  callback: (chats: any[]) => void
) => {
  try {
    const q = query(collection(ikam, "chat"), where("idUser", "==", userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(chatsArray);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error suscribiéndose a los chats:", error);
  }
};

export const enviarMensaje = async (
  chatId: string,
  mensaje: string,
  uid: string
) => {
  if (mensaje.trim() === "") return; // No enviar si el mensaje está vacío

  try {
    // Enviar el mensaje a la subcolección `mensaje`
    await addDoc(collection(ikam, "chat", chatId, "mensaje"), {
      mensaje: mensaje, // El texto del mensaje
      timestamp: new Date(), // Marca de tiempo
      user: uid, // ID del usuario que envía el mensaje
    });

    console.log("Mensaje enviado:", mensaje);
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
};

export const suscribirseAMensajes = (chatId: any, callback: any) => {
  const mensajesRef = collection(ikam, "chat", chatId, "mensaje");
  
  const q = query(mensajesRef, orderBy("timestamp")); // Asegúrate de que el campo que usas aquí es el correcto
  
  return onSnapshot(q, (querySnapshot) => {
    const mensajes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(mensajes);
  });
};
