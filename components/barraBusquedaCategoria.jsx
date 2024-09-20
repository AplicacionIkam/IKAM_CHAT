import { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { ikam } from "../firebase/config-ikam";

const { width: viewportWidth } = Dimensions.get("window");

const BarraBusquedaCategoria = ({
  busquedaCategoria,
  setbusquedaCategoria,
  colonia,
  setColonia,
  colonias,
  setColonias
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.contenedorBusqueda}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={colonia}
        setValue={setColonia}
        items={colonias}
        setItems={setColonias}
        placeholder="Selecciona una colonia"
        style={styles.dropDownPicker}
        dropDownContainerStyle={styles.dropDownContainer}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.barraBusqueda}>
        <FontAwesome5 name="search" size={25} color="#222C57" />
        <TextInput
          style={styles.entradaBusqueda}
          placeholder="¿Qué desea buscar hoy?"
          placeholderTextColor="#222C57"
          value={busquedaCategoria}
          onChangeText={setbusquedaCategoria}
        />
        {busquedaCategoria ? (
          <FontAwesome5
            name="times"
            size={25}
            color="#C61919"
            onPress={() => setbusquedaCategoria("")}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedorBusqueda: {
    width: viewportWidth * 0.9,
    alignSelf: "center",
    marginVertical: 10,
    zIndex:1001
  },
  dropDownPicker: {
    marginBottom: 15,
    borderRadius: 20,
    borderColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dropDownContainer: {
    borderColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    
    
  },
  barraBusqueda: {
    flexDirection: "row",
    alignItems: "center",
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
});

export default BarraBusquedaCategoria;

  // const [colonias, setColonias] = useState([
  //   { label: "Todas las colonias", value: "" },
  // ]);

  // useEffect(() => {
  //   const obtenerAtributosColeccion = async () => {
  //     try {
  //       console.log("de nuevo")
  //       const querySnapshot = await getDocs(collection(ikam, "colonia"));
  //       const coloniasArray = querySnapshot.docs.map((doc) => ({
  //         id: `${doc.id}-${doc.data().nombreCol}`, // Genera una clave única combinada
  //         label: doc.data().nombreCol,
  //         value: doc.data().nombreCol,
  //       }));
  //       setColonias((prevColonias) => [...prevColonias, ...coloniasArray]);
  //     } catch (error) {
  //       console.error(
  //         "Error obteniendo los atributos de la colección 'colonia':",
  //         error
  //       );
  //     }
  //   };
  //   obtenerAtributosColeccion();
  // }, []);

