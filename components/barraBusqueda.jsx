import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { TextInput, View, StyleSheet, Dimensions } from "react-native";
const { width: viewportWidth } = Dimensions.get("window");

const BarraBusqueda = ({ busquedaPyme, setbusquedaPyme, setModalVisible }) => {
  return (
    <View style={estilos.contenedorBusqueda}>
      <View style={estilos.barraBusqueda}>
        <FontAwesome5 name="search" size={25} color="#222C57" />
        <TextInput
          style={estilos.entradaBusqueda}
          placeholder="¿Qué lugar es de tu interés?"
          placeholderTextColor="#222C57"
          value={busquedaPyme}
          onChangeText={setbusquedaPyme}
        />
        {busquedaPyme ? (
          <FontAwesome5
            name="times"
            size={25}
            color="#C61919"
            onPress={() => setbusquedaPyme("")}
          />
        ) : null}
      </View>
      {/* <FontAwesome5
        name="filter"
        size={25}
        color="#222C57"
        style={estilos.iconoFiltro}
        onPress={() => {
          setModalVisible(true);
          setbusquedaPyme("");
        }}
      /> */}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedorBusqueda: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: viewportWidth * 0.9,
    alignSelf: "center",
    marginVertical: 10,
  },
  barraBusqueda: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  entradaBusqueda: {
    marginStart: 15,
    flex: 1,
    fontSize: 16,
  },
  iconoFiltro: {
    marginLeft: 12,
  },
});
export default BarraBusqueda;
