import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import ModalTerminosCondiciones from "@/components/modalPoliticas"; // Asegúrate de que la ruta sea correcta

import Icon from "react-native-vector-icons/FontAwesome5";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUserCircle,
  faShieldAlt,
  faBell,
  faLock,
  faSignOutAlt,
  faGavel,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { getUserData, clearUserData } from "@/auth/authService";
import { Link, useRouter } from "expo-router";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { auth, ikam } from "@/firebase/config-ikam";
import { deleteUser } from "firebase/auth";
import { listenToUserChanges } from "@/services/services";
import { User } from "@/models/User";

export default function App() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<User | null>();

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

  useEffect(() => {
    library.add(
      faUserCircle,
      faShieldAlt,
      faBell,
      faLock,
      faSignOutAlt,
      faGavel,
      faUserTimes
    );
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleSignIn = () => {
    router.replace("/LoginScreen");
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contenedorPerfil}>
          <View style={styles.contenedorPerfilColumnas}>
            <Icon name="user-circle" size={70} color="black" solid />
            <View style={styles.textoPerfilContainer}>
              <Text style={styles.textoPerfil}>Invitado</Text>
            </View>
          </View>
        </View>
        <ScrollView style={styles.contenedorOpciones}>
          <RenderOption
            icon="gavel"
            text="Política Privacidad"
            onPress={() => setModalVisible(true)}
          />
          <RenderOption
            icon="sign-in-alt"
            text="Iniciar Sesión"
            onPress={handleSignIn}
          />
        </ScrollView>
        <ModalTerminosCondiciones
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que desea cerrar tu sesión?",
      [
        { text: "No", onPress: () => null, style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              await clearUserData();
              router.replace("/WelcomeScreen");
            } catch (error) {
              console.error("Error signing out:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeletAccount = () => {
    Alert.alert(
      "¿Estás seguro que desea eliminar su cuenta?",
      "Esta acción eliminara su cuenta, aunque puede volver a crear una nueva con su correo",
      [
        { text: "No", onPress: () => null, style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              const user = auth.currentUser;

              if (user) {
                const userId = user.uid;
                // Elimina los datos del usuario en Firestore
                const userDocRef = doc(ikam, "users", user.uid);
                await deleteDoc(userDocRef);

                // Eliminar todos los documentos en la colección 'likes' donde userId coincide
                const likesCollectionRef = collection(ikam, "likes");
                const q = query(
                  likesCollectionRef,
                  where("userId", "==", userId)
                );
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach(async (doc) => {
                  await deleteDoc(doc.ref);
                });

                // Elimina la cuenta de Firebase Authentication
                await deleteUser(user);

                // Redirige a la pantalla de bienvenida
                router.replace("/WelcomeScreen");
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              router.replace("/WelcomeScreen");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contenedorPerfil}>
        <View style={styles.contenedorPerfilColumnas}>
          <Icon name="user-circle" size={70} color="black" solid />
          <View style={styles.textoPerfilContainer}>
            <Text style={styles.textoPerfil}>
              {userData.display_name.toUpperCase() +
                " " +
                userData.last_name.toUpperCase()}
            </Text>
            <Text style={styles.textoCorreo}>{userData.email}</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.contenedorOpciones}>
        <Link asChild href={"/configuracion/perfil"}>
          <RenderOption icon="user" text="Datos de la cuenta" onPress={null}/>
        </Link>
        <Link asChild href={"/configuracion/preguntas"}>
          <RenderOption icon="question" text="Preguntas Frecuentes" onPress={null}/>
        </Link>
        <Link asChild href={"/configuracion/contacto"}>
          <RenderOption icon="id-card-alt" text="Contacto Ikam Multitiendas" onPress={null}/>
        </Link>
        <Text style={styles.textoSubTitulo}>Politica de ikam Multitiendas</Text>
        {/* <RenderOption
          icon="lock"
          text="Aviso de privacidad"
          onPress={() => setModalVisible(true)}
        /> */}
        <RenderOption
          icon="file-alt"
          text="Aviso de privacidad, Terminos y Condiciones"
          onPress={() => setModalVisible(true)}
        />
        {/* <Text style={styles.textoSubTitulo}>
          Forma parte de Ikam Multitiendas
        </Text>
        <Link asChild href={"/configuracion/perfil"}>
          <RenderOption icon="store" text="Anuncia tu Negocio" onPress={null}/>
        </Link> */}
        <RenderOption
          icon="sign-out-alt"
          text="Cerrar Sesión"
          onPress={handleSignOut}
        />
        <RenderOption
          icon="user-times"
          text="Eliminar Cuenta"
          onPress={handleDeletAccount}
        />
      </ScrollView>
      <ModalTerminosCondiciones
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </SafeAreaView>
  );
}

const RenderOption = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.elementoOpcion} onPress={onPress}>
    <Icon name={icon} size={24} color="#888" solid />
    <Text style={styles.textoOpcion}>{text}</Text>
    <Text style={styles.flecha}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    backgroundColor: "#CC0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 85,
    height: 85,
    resizeMode: "contain",
  },
  contenedorPerfil: {
    // backgroundColor: "#222C57",
    paddingVertical: 20,
    paddingLeft: 25,
  },
  contenedorPerfilColumnas: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoPerfilContainer: {
    marginLeft: 20,
  },
  textoPerfil: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  textoCorreo: {
    fontSize: 17,
    color: "black",
  },
  contenedorOpciones: {
    paddingHorizontal: 20,
  },
  elementoOpcion: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  textoOpcion: {
    marginLeft: 15,
    fontSize: 20,
  },
  flecha: {
    fontSize: 35,
    color: "#888",
    marginLeft: "auto",
  },
  textoSubTitulo: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});
