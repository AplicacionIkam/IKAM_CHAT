import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import { auth, ikam } from "@/firebase/config-ikam";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import ListaPymes from "@/components/pymes";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

export default function App() {
  const [pymeSeleccionada, setPymeSeleccionada] = useState(null);
  const [vistaDetalles, setVistaDetalles] = useState(false);
  const [pymesLikes, setPymesLikes] = useState([]);
  const [pymesUser, setPymesUser] = useState([]);
  const [pymesQ, setPymesQ] = useState([]);
  const [pymes, setPymes] = useState([]);

  const obtenerPymes = async () => {
    obtenerAtributosColeccion();
    try {
      const querySnapshot = await getDocs(collection(ikam, "pyme"));
      const pymesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPymes(pymesArray);
    } catch (error) {
      console.error("Error fetching pymes:", error);
    }
  };

  const obtenerPymesLikes = () => {
    try {
      const user = auth.currentUser;
      if (!user) return; // Ensure the user is authenticated

      const likesCollection = collection(ikam, "likes");
      const unsubscribe = onSnapshot(likesCollection, (querySnapshot) => {
        const pymesLikesArray = querySnapshot.docs
          .filter((doc) => doc.data().userId === user.uid) // Filter likes for the current user
          .map((doc) => doc.data().pymeId); // Assuming each like document contains the pymeId

        setPymesLikes(pymesLikesArray);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  useEffect(() => {
    obtenerPymes();
    obtenerPymesLikes();
  }, []);

  useEffect(() => {
    if (pymes.length > 0 && pymesLikes.length > 0) {
      const likedPymes = pymes.filter((pyme) => pymesLikes.includes(pyme.id));
      setPymesQ(likedPymes);
    }
  }, [pymes, pymesLikes]);

  const obtenerAtributosColeccion = async () => {
    try {
      const querySnapshot = await getDocs(collection(ikam, "likes"));
      const atributos = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        Object.keys(data).forEach((key) => {
          atributos.add(key);
        });
      });

      console.log("Atributos de la colección 'pyme':", Array.from(atributos));
    } catch (error) {
      console.error(
        "Error obteniendo los atributos de la colección 'pyme':",
        error
      );
    }
  };

  const obtenerDetallesPyme = async (pymeId) => {
    const docRef = doc(ikam, "pyme", pymeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.areaSegura}>
      <StatusBar style="light" />
      <Text style={styles.textoFavoritos}>Favoritos</Text>
      <ScrollView>
        {pymesQ.length > 0 ? (
          <View>
            <View style={styles.contenedorPymes}>
              <ListaPymes
                setPymeSeleccionada={setPymeSeleccionada}
                pymesQ={pymesQ}
                setVistaDetalles={setVistaDetalles}
              />
            </View>
          </View>
        ) : (
          <View style={styles.contenedorNF}>
            <Text style={styles.noEncontrado}>¡No tienes favoritos!</Text>
            <Text style={styles.noEncontrado}>Añade algunos</Text>
            <Image
              source={require("@/assets/img/abuNotFound.png")}
              style={[styles.notfoundImg]}
            />
          </View>
        )}        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textoFavoritos: {
    marginVertical: 15,
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
  },
  areaSegura: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  cabecera: {
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
  contenedorCategorias: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  contenedorPymes: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  contenedorNF: {
    flex: 1,
    paddingTop: 25,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  notfoundImg: {
    width: 300,
    height: 300,
    marginTop: 15
  },
  noEncontrado: {
    textAlign: "center",
    fontSize: 30,
    marginVertical: 15,
  },
});
