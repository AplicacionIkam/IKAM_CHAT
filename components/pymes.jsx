import { Link } from "expo-router";
import React, { useState } from "react";
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";

const { width: viewportWidth } = Dimensions.get("window");

const ListaPymes = ({ setPymeSeleccionada, pymesQ, setVistaDetalles }) => {
  const [loadingImage, setLoadingImage] = useState({});

  const manejarPymePresionada = (pymeId) => {
    setPymeSeleccionada(pymeId);
    setVistaDetalles(true);
  };

  const renderizarItemPyme = ({ item }) => (
    <Link
      asChild
      href={{
        pathname: "/pyme/[pymeId]",
        params: { pymeId: item.id },
      }}
    >
      <TouchableOpacity
        style={estilos.tarjeta}
        // onPress={() => manejarPymePresionada(item.id)}
      >
        <View style={estilos.imagenContenedor}>
          {loadingImage[item.id] && (
            <ActivityIndicator
              size="large"
              color="#CC0000"
              style={estilos.indicadorCarga}
            />
          )}
          <Image
            source={{ uri: item.imagen1 }}
            style={estilos.imagenTarjeta}
            onLoadStart={() =>
              setLoadingImage((prevState) => ({
                ...prevState,
                [item.id]: true,
              }))
            }
            onLoadEnd={() =>
              setLoadingImage((prevState) => ({
                ...prevState,
                [item.id]: false,
              }))
            }
          />
        </View>
        <View style={estilos.detalleTarjeta}>
          <Text style={estilos.tituloTarjeta}>{item.nombre_pyme}</Text>
          <Text style={estilos.subtituloTarjeta}>{item.direccion}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <FlatList
      data={pymesQ}
      renderItem={renderizarItemPyme}
      keyExtractor={(item) => item.id}
    />
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 33,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: viewportWidth * 0.9,
    marginVertical: 10,
    alignSelf: "center",
  },
  imagenContenedor: {
    width: viewportWidth * 0.9,
    height: 250,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  imagenTarjeta: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 10,
    resizeMode: "stretch",
  },
  detalleTarjeta: {
    flex: 1,
    padding: 15,
  },
  tituloTarjeta: {
    textAlign: "center",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtituloTarjeta: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  indicadorCarga: {
    position: "absolute",
  },
});

export default ListaPymes;
