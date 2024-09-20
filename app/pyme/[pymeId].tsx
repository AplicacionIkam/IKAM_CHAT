import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import Carousel from "pinar";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, ikam } from "@/firebase/config-ikam";
import { obtenerDetallesPyme } from "@/services/services";
import { Pyme } from "@/models/Pyme";
import colorsIkam from "@/assets/estilos";

const GOOGLE_MAPS_API_KEY = "AIzaSyB_4HimG5-kkuSiz8dOoIgi6n_myRZcxVo";

function LogoTitle() {
  return (
    <Image
      style={styles.image}
      source={require("@/assets/images/ikam-logo.png")}
    />
  );
}

const VistaDetallesPymes = () => {
  const { pymeId } = useLocalSearchParams();
  const [pyme, setPyme] = useState<Pyme | null>(null);
  const [play, setPlay] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);

  // Hook mapa
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  useEffect(() => {
    const fetchPymeDetails = async () => {
      const details = await obtenerDetallesPyme(pymeId as string);
      const combined:Pyme = {
        ...details, // Datos del documento de Firestore
        id: pymeId, // Añadir el `pymeId`
      };
      setPyme(combined);

      if (details && details.direccion) {
        extractCoordinates(details.direccion);
      }
    };
    fetchPymeDetails();
  }, [pymeId]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return; // Asegúrate de que el usuario esté autenticado

    const likesCollection = collection(ikam, "likes");
    const q = query(
      likesCollection,
      where("userId", "==", user.uid),
      where("pymeId", "==", pymeId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        // Si hay al menos un documento, la pyme está en los favoritos
        setIsFavorite(true);
      } else {
        // No se encontró el documento, la pyme no está en los favoritos
        setIsFavorite(false);
      }
    });

    // Cleanup: Desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, [pymeId]);

  const addLike = async (pymeId: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const likesCollectionRef = collection(ikam, "likes");
        await addDoc(likesCollectionRef, {
          userId: user.uid,
          pymeId: pymeId,
        });
        console.log("Like added");
      } else {
        console.log("No user is signed in");
      }
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  const removeLike = async (pymeId: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const likesCollectionRef = collection(ikam, "likes");
        const q = query(
          likesCollectionRef,
          where("userId", "==", user.uid),
          where("pymeId", "==", pymeId)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        console.log("Like removed");
      } else {
        console.log("No user is signed in");
      }
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  const extractCoordinates = async (address: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );
      // console.log(`API Response: ${JSON.stringify(response.data)}`);
      const { results } = response.data;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      } else {
        console.error("No results found");
      }
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
    }
  };

  // Método genérico para abrir cualquier URL
  const abrirEnNavegador = (url: any) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("No se pudo abrir la URL:", err)
      );
    }
  };

  const makeCall = () => {
    if (pyme && pyme.num_cel) {
      Linking.openURL(`tel:${pyme.num_cel}`);
    }
  };

  const abrirWhatsApp = (numero: any) => {
    const mensaje = "Hola me comunico desde Ikam Multitiendas";
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    abrirEnNavegador(url);
  };

  const openChat = (item: any) => {
    setPlay(false);
    router.push({ pathname: "/chat/chatNuevo", params: item });
  };

  return (
    <View style={estilos.areaSegura}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colorsIkam.rojo.backgroundColor },
          headerTitle: "Ikam Multitiendas",
          headerTintColor: "white",
          headerRight: () => <LogoTitle />,
          headerBackTitle: "Volver",
          headerShown: true,
        }}
      />

      {pyme ? (
        <>
          <View style={estilos.imagenContenedor}>
            <Carousel
              dotStyle={estilos.dotStyle}
              activeDotStyle={estilos.activeDotStyle}
              controlsTextStyle={estilos.controlesCarrusel}
              style={{ zIndex: 5 }}
            >
              <View style={[estilos.videoContainer, { zIndex: 15 }]}>
                <Video
                  source={{ uri: pyme.video }} // URL del video
                  style={estilos.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={play} // Reproduce automáticamente
                  isLooping // Repite el video continuamente
                />
              </View>
              <Image
                source={{ uri: pyme.imagen1 }}
                style={estilos.imagenDetalle}
              />
              <Image
                source={{ uri: pyme.imagen2 }}
                style={estilos.imagenDetalle}
              />
              <Image
                source={{ uri: pyme.imagen3 }}
                style={estilos.imagenDetalle}
              />
              <Image
                source={{ uri: pyme.imagen4 }}
                style={estilos.imagenDetalle}
              />
              <Image
                source={{ uri: pyme.imagen5 }}
                style={estilos.imagenDetalle}
              />
            </Carousel>
            <View style={[estilos.botonesContenedor, {zIndex:10}]}>
              {/* <TouchableOpacity
                style={estilos.botonIzquierda}
                onPress={() => openChat(pyme)}
              >
                <FontAwesome5 name="comment" size={25} color="#C61919" />
              </TouchableOpacity> */}

              {isFavorite ? (
                <TouchableOpacity
                  style={estilos.botonFlotanteI}
                  onPress={() => {
                    removeLike(pymeId);
                  }}
                >
                  <FontAwesome5 name="heart" size={25} color="#C61919" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={estilos.botonFlotanteI}
                  onPress={() => {
                    addLike(pymeId);
                  }}
                >
                  <FontAwesome5 name="heart" size={25} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <ScrollView>
            <View style={estilos.detalleContenedor}>
              <Text style={estilos.tituloDetalle}>{pyme.nombre_pyme}</Text>
              {/* <Text style={estilos.categoriaDetalle}>
                {pyme.nombreSubcate ? pyme.nombreSubcate : "Sin categoría"}
              </Text> */}
              <View style={estilos.descContenedor}>
                <Text style={estilos.descTitulo}>                  
                  {pyme.descripcion}
                </Text>
              </View>

              <View style={estilos.descripcionContenedor}>
                <FontAwesome5 name="clock" size={29} color="#000" solid />
                <View style={estilos.textoContenedor}>
                  <Text style={estilos.descripcionTitulo}>Te atendemos</Text>
                  <Text style={estilos.descripcionDetalle}>
                    {pyme.horario_apertura}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={estilos.descripcionContenedorTel}
                onPress={makeCall}
              >
                <FontAwesome5 name="phone" size={29} color="#000" solid />
                <View style={estilos.textoContenedor}>
                  <Text style={estilos.descripcionTitulo}>Llámanos al</Text>
                  <Text style={estilos.descripcionDetalle}>
                    {pyme.num_local}
                  </Text>
                  <Text style={estilos.descripcionDetalle}>{pyme.num_cel}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => abrirEnNavegador(pyme.url_maps)}>
                <View style={estilos.descripcionContenedor}>
                  <FontAwesome5 name="map-marker-alt" size={33} color="#000" />
                  <View style={estilos.textoContenedor}>
                    <Text style={estilos.descripcionTitulo}>
                      Encuéntranos en
                    </Text>
                    <Text style={estilos.descripcionDetalle}>
                      {pyme.direccion}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={estilos.mapContainer}>
                {mapRegion && (
                  <MapView style={estilos.map} region={mapRegion}>
                    <Marker coordinate={mapRegion} />
                  </MapView>
                )}
              </View>
              <View style={estilos.contenedorRedes}>
                <Text style={estilos.descripcionRedes}>
                  También contáctanos
                </Text>
                <View style={estilos.iconosContenedor}>
                  {pyme.url_facebook && (
                    <TouchableOpacity
                      onPress={() => abrirEnNavegador(pyme.url_facebook)}
                    >
                      <FontAwesome5
                        name="facebook-f"
                        size={29}
                        color="#0165E1"
                        style={estilos.icono}
                      />
                    </TouchableOpacity>
                  )}
                  {pyme.url_instagram && (
                    <TouchableOpacity
                      onPress={() => abrirEnNavegador(pyme.url_instagram)}
                    >
                      <FontAwesome5
                        name="instagram"
                        size={37}
                        color="#E1306C"
                        style={estilos.icono}
                      />
                    </TouchableOpacity>
                  )}
                  {pyme.num_cel && (
                    <TouchableOpacity
                      onPress={() => abrirWhatsApp(pyme.num_cel)}
                    >
                      <FontAwesome5
                        name="whatsapp"
                        size={37}
                        color="green"
                        style={estilos.icono}
                      />
                    </TouchableOpacity>
                  )}
                  {pyme.url_tiktok && (
                    <TouchableOpacity
                      onPress={() => abrirEnNavegador(pyme.url_tiktok)}
                    >
                      <FontAwesome5
                        name="tiktok"
                        size={29}
                        color="#000"
                        style={estilos.icono}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={estilos.botonFlotante}
            onPress={() => openChat(pyme)}
          >
            <FontAwesome5 name="comment" size={35} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        // <Text>Cargando...</Text>
        <ActivityIndicator size="large" color="#C61919" />
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  // Detalles de PyME
  detalleContenedor: {
    // flex: 1,
    height: "auto",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  imagenContenedor: {
    position: "relative",
    width: "100%",
    height: "25%",
    resizeMode: "stretch",
  },
  imagenDetalle: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  botonesContenedor: {
    // flexDirection: "row",
    justifyContent: "flex-end",
    position: "absolute",
    top: 10,
    left: 5,
    right: 2,
    paddingHorizontal: 10,
  },
  botonFlotanteI: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 9,
    elevation: 5,    
    position: 'absolute',
    top: 3,
    right: 3,
  },
  // botonIzquierda: {
  //   backgroundColor: "#fff",
  //   borderRadius: 30,
  //   padding: 9,
  //   elevation: 5,
  //   zIndex: 15,
  // },
  // botonDerecha: {
  //   backgroundColor: "#fff",
  //   borderRadius: 30,
  //   padding: 9,
  //   elevation: 5,
  //   zIndex: 15,
  // },
  tituloDetalle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoriaDetalle: {
    textAlign: "center",
    fontSize: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  descContenedor: {
    marginVertical: 10,
    paddingEnd: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  descripcionContenedor: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingEnd: 28,
  },
  descripcionContenedorTel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  textoContenedor: {
    flexDirection: "column",
    marginLeft: 15,
  },
  descTitulo: {
    fontSize: 18,
    color: "#000",
    marginTop: 10,
    marginBottom: 20,
  },
  descripcionTitulo: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 5,
  },
  descripcionDetalle: {
    fontSize: 15,
    color: "#888",
  },
  contenedorRedes: {
    flexDirection: "column",
    height: 120,
  },
  descripcionRedes: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  iconosContenedor: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  icono: {
    marginHorizontal: 10,
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  video: {
    width: "75%",
    height: "100%",
    alignSelf: "center",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    marginVertical: 5,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  dotStyle: {
    marginHorizontal: 3,
    backgroundColor: "rgba(255, 0, 0, 0.5)", // Blanco con opacidad
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDotStyle: {
    backgroundColor: "red", // Blanco sólido
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  controlesCarrusel: {
    color: "white", // Blanco con opacidad
    fontSize: 75,
  },
  botonFlotante: {
    backgroundColor: colorsIkam.rojo.backgroundColor,
    borderRadius: 30,
    padding: 9,
    elevation: 5,
    zIndex: 15,
    position: 'absolute',
    bottom: 20,
    right: 20,
  }  
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  }  
});

export default VistaDetallesPymes;
