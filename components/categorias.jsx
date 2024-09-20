import React, { useState } from "react";
import {
  Dimensions,
  TouchableOpacity,
  Image,
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const { width: viewportWidth } = Dimensions.get("window");

const ItemCategoria = React.memo(
  ({
    item,
    onPress,
    esSeleccionada,
    handleImageLoadStart,
    handleImageLoadEnd,
    cargandoImagenes,
  }) => {
    const imagenUrl =
      item.imagenCat && typeof item.imagenCat === "string"
        ? item.imagenCat.trim()
        : "";
    const tieneImagen = imagenUrl !== "";

    return (
      <TouchableOpacity
        style={[estilos.tarjeta, esSeleccionada && estilos.tarjetaSeleccionada]}
        onPress={() => onPress(item.id)}
      >
        <View style={estilos.imagenContainer}>
          {cargandoImagenes[item.id] && (
            <ActivityIndicator
              size="large"
              color="#CC0000"
              style={estilos.cargando}
            />
          )}
          <Image
            source={
              tieneImagen
                ? { uri: imagenUrl }
                : require("../assets/img/logo.png")
            }
            style={estilos.imagenTarjeta}
            onLoadStart={() => handleImageLoadStart(item.id)}
            onLoadEnd={() => handleImageLoadEnd(item.id)}
            onError={() => handleImageLoadEnd(item.id)}
          />
        </View>
        <View style={estilos.detalleTarjeta}>
          <Text style={estilos.tituloTarjeta}>{item.nombreCat}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

const ListaCategorias = ({
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  categorias,
}) => {
  const [cargandoImagenes, setCargandoImagenes] = useState({});

  const manejarCategoriaPresionada = (categoriaId) => {
    setCategoriaSeleccionada(categoriaId);
  };

  const handleImageLoadStart = (id) => {
    setCargandoImagenes((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id) => {
    setCargandoImagenes((prev) => ({ ...prev, [id]: false }));
  };

  const renderizarItemCategoria = ({ item }) => (
    <ItemCategoria
      item={item}
      onPress={manejarCategoriaPresionada}
      esSeleccionada={item.id === categoriaSeleccionada}
      handleImageLoadStart={handleImageLoadStart}
      handleImageLoadEnd={handleImageLoadEnd}
      cargandoImagenes={cargandoImagenes}
    />
  );

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={categorias}
        renderItem={renderizarItemCategoria}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={estilos.fila}
      />      
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 5,
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
  tarjetaSeleccionada: {
    borderColor: "#CC0000",
    borderWidth: 2,
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
  cargando: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  detalleTarjeta: {
    flex: 1,
    padding: 10,
  },
  tituloTarjeta: {
    textAlign: "center",
    fontSize: 16,
  },
  fila: {
    justifyContent: "space-between", // Ajusta el espacio entre las columnas
  },
});

export default ListaCategorias;
