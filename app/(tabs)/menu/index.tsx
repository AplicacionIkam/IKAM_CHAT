import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Dimensions,
  View,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Alert,
  Text,
  Pressable,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";

import { StatusBar } from "expo-status-bar";

import Icon from "react-native-vector-icons/FontAwesome5";

import BarraBusquedaCategoriaSeleccionada from "@/components/barraBusquedaCategoriaSeleccionada";
import {
  suscribirseAPymes,
  suscribirseACategorias,
  suscribirseAColonias,
} from "@/services/services";
import BarraBusquedaCategoria from "@/components/barraBusquedaCategoria";
import BarraBusqueda from "@/components/barraBusqueda";
import ListaCategorias from "@/components/categorias";
import ModalFiltro from "@/components/modalFiltro";
import { Categoria } from "@/models/Categoria";
import ListaPymes from "@/components/pymes";
import { Pyme } from "@/models/Pyme";
import { Stack } from "expo-router";

const { width: viewportWidth } = Dimensions.get("window");
import colorsIkam from "@/assets/estilos";

function LogoTitle() {
  return (
    <Image
      style={styles.image}
      source={require("@/assets/images/ikam-logo.png")}
    />
  );
}

const App = () => {
  const [pymes, setPymes] = useState<Pyme[]>([]); // BD NO MODIFICAR
  const [pymesCol, setPymesCol] = useState<Pyme[]>([]); // pyme filtro por colonia
  const [pymesQ, setPymesQ] = useState<Pyme[]>([]); // Se ocupa como copia se hace busqueda

  const [pymeSeleccionada, setPymeSeleccionada] = useState<string | null>(null);

  const [colonia, setColonia] = useState<string>("");
  const [colonias, setColonias] = useState([
    { label: "Todas la colonias", value: "2" },
  ]);

  const [categoriasF, setCategoriasF] = useState<Categoria[]>([]); // BD NO MODIFICAR
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [categoria, setCategoria] = useState<string>("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | null
  >(null);
  const [busquedaPyme, setBusquedaPyme] = useState<string>("");

  const [busquedaCategoria, setBusquedaCategoria] = useState<string>("");

  const [vistaDetalles, setVistaDetalles] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Obtener todas las Pymes
  // useEffect(() => {
  //   const unsubscribe = suscribirseAPymes(setPymes);
  //   return () => unsubscribe && unsubscribe();
  // }, []);
  useEffect(() => {
    const unsubscribe = suscribirseAPymes((pymes) => {
      const pymesOrdenadas = pymes.sort((a, b) =>
        a.nombre_pyme.localeCompare(b.nombre_pyme)
      );
      setPymes(pymesOrdenadas);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Obtener todas las Categorias
  // useEffect(() => {
  //   const unsubscribe = suscribirseACategorias((categorias) => {
  //     setCategorias(categorias);
  //     setCategoriasF(categorias); // Guardar la lista original
  //   });
  //   return () => unsubscribe && unsubscribe();
  // }, []);
  useEffect(() => {
    const unsubscribe = suscribirseACategorias((categorias) => {
      const categoriasOrdenadas = categorias.sort((a, b) =>
        a.nombreCat.localeCompare(b.nombreCat)
      );
      setCategorias(categoriasOrdenadas);
      setCategoriasF(categoriasOrdenadas);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Obtener todas las Colonias
  useEffect(() => {
    const unsubscribe = suscribirseAColonias((nuevasColonias) => {
      const coloniasOrdenadas = nuevasColonias.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      setColonias((prevColonias) => [...prevColonias, ...coloniasOrdenadas]);
    });

    return () => unsubscribe && unsubscribe(); // Limpieza de la suscripción al desmontar el componente
  }, []);

  // Función para filtrar las pymes por colonia seleccionada y extraer las categorías sin duplicados
  const filtrarCategoriasPorColonia = (colonia: any) => {
    const pymesFiltradas = pymes.filter((pyme) => pyme.nomColonia === colonia);
    setPymesCol(pymesFiltradas);
    const categoriasNombres = pymesFiltradas.map(
      (pyme) => pyme.nombreCategoria
    );
    const categoriasUnicas = [...new Set(categoriasNombres)];
    const categoriasFiltradas = categoriasF.filter((categoriaF) =>
      categoriasUnicas.includes(categoriaF.nombreCat)
    );
    setCategorias(categoriasFiltradas);
  };

  // Colonia nula por cosa de ubicacion
  useEffect(() => {    
    setPymesCol(pymes);    
  }, [pymes]);

  useEffect(() => {    
    if (colonia != "2" && colonia != "") {      
      filtrarCategoriasPorColonia(colonia);
    } 

    if (colonia == "2") {      
      setCategorias(categoriasF);
      setPymesCol(pymes);
      return;
    }    
  }, [colonia]);

  // Filtro por nombre de pymes
  useEffect(() => {
    if (busquedaPyme) {
      const pyme = pymesCol.filter((p) =>
        p.nombre_pyme?.toLowerCase().includes(busquedaPyme.toLowerCase())
      );
      setPymesQ(pyme);
    } else {
      setPymesQ(pymesCol);
    }
  }, [busquedaPyme, pymesCol]);

  // Filtro por nombre de Categorias
  useEffect(() => {
    if (busquedaCategoria) {
      const cat = categoriasF.filter((c) =>
        c.nombreCat.toLowerCase().includes(busquedaCategoria.toLowerCase())
      );
      setCategorias(cat);
    } else {
      setCategorias(categoriasF);
    }
  }, [busquedaCategoria]);

  // Filtro por categoria
  useEffect(() => {
    if (categoriaSeleccionada) {
      if (categoriaSeleccionada !== "1") {
        const cat = categorias.find((cat) => cat.id === categoriaSeleccionada);
        setCategoria(cat?.nombreCat || "");
      } else {
        setPymesQ(pymesCol);
      }
    }
  }, [categoriaSeleccionada]);

  useEffect(() => {
    const pymesCat = pymesCol.filter((pyme) =>
      pyme.nombreCategoria.toLowerCase().includes(categoria.toLowerCase())
    );
    setPymesQ(pymesCat);
  }, [categoria]);

  // Manejar el evento de retroceso en Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (categoriaSeleccionada) {
          setCategoriaSeleccionada(null);
          setBusquedaCategoria("");
          return true;
        } else {
          Alert.alert(
            "Salir",
            "¿Estás seguro que quieres salir?",
            [
              { text: "No", onPress: () => null, style: "cancel" },
              { text: "Sí", onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false }
          );
          return true;
        }
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [categoriaSeleccionada])
  );

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={{}}
              onPress={() => setCategoriaSeleccionada(null)}
            >
              <Icon
                style={{ marginLeft: 15 }}
                name="arrow-left"
                size={24}
                color={
                  categoriaSeleccionada
                    ? "white"
                    : colorsIkam.rojo.backgroundColor
                }
                solid
              />
            </TouchableOpacity>
          ),
        }}
      />

      {categoriaSeleccionada === null ? (
        <View style={estilos.contenedorCategorias}>
          <BarraBusquedaCategoria
            busquedaCategoria={busquedaCategoria}
            setbusquedaCategoria={setBusquedaCategoria}
            colonia={colonia}
            setColonia={setColonia}
            colonias={colonias}
            setColonias={setColonias}
          />
          <ListaCategorias
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            setCategoriaSeleccionada={setCategoriaSeleccionada}
          />
        </View>
      ) : (
        <View style={estilos.contenedorPymes}>         
          <BarraBusqueda
            busquedaPyme={busquedaPyme}
            setbusquedaPyme={setBusquedaPyme}
            setModalVisible={setModalVisible}
          />          
          {pymes.length > 0 ? (
            <ListaPymes
              setPymeSeleccionada={setPymeSeleccionada}
              pymesQ={pymesQ}
              setVistaDetalles={setVistaDetalles}
            />
          ) : (
            <View style={estilos.contenedorMensaje}>
              <Text style={estilos.mensajeNoPymes}>
                No hay pymes disponibles para esta categoría
              </Text>
            </View>
          )}
        </View>
      )}
      <ModalFiltro
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        colonia={colonia}
        setColonia={setColonia}
      />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
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
    flex: 1,
    paddingHorizontal: 5,
  },
  contenedorPymes: {
    flex: 1,
    paddingHorizontal: 5,
  },
  contenedorMensaje: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mensajeNoPymes: {
    textAlign: "center",
    fontSize: 25,
    marginVertical: 20,
  },
  tarjeta: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: (viewportWidth * 0.88 - 20) / 2, // Ajusta el ancho para dos columnas
    marginVertical: 10,
    marginHorizontal: 10, // Espacio horizontal entre columnas
  },
  imagenContainer: {
    width: "100%",
    height: (viewportWidth * 0.88 - 20) / 2, // Hacer que la altura sea igual al ancho para que sea cuadrado
    position: "relative",
  },
  imagenTarjeta: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Asegura que la imagen mantenga el aspecto y cubra el contenedor
  },
  detalleTarjeta: {
    flex: 1,
    padding: 10,
  },
  tituloTarjeta: {
    textAlign: "center",
    fontSize: 16,
  },
  tarjetaTodasPymes: {
    backgroundColor: "#EFEFEF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textoTarjeta: {
    fontSize: 18,
    color: "#333",
  },
  btnPressableCat: {
    width: 115,
    height: 35,
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
    padding: 5,
  },
  contenedorPress: {
    alignContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  wrapperCustom: {
    width: "55%",
    padding: 6,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
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
  },
});

export default App;