import { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { ikam } from "../firebase/config-ikam";

const { width: viewportWidth } = Dimensions.get("window");

const BarraBusquedaCategoriaSeleccionada = ({
  categorias,
  setCategoriaSeleccionada,
  categoriaSeleccionada
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categoria, setCategoria] = useState([
    { label: "Todas las Categorias", value: "1" },
  ]);

  useEffect(() => {
    // Actualizamos el estado `categoria` con las categorías recibidas como prop
    const nuevasCategorias = [
      { label: "Todas las Categorias", value: "1" },
      ...categorias.map((categoria) => ({
        label: categoria.nombreCat,
        value: categoria.id,
      })),
    ];
    setCategoria(nuevasCategorias);    
  }, [categorias]);     
    
  const handleValueChange = (value) => {
    setSelectedCategoria(value);
    setCategoriaSeleccionada(value);
  };

  return (
    <View style={styles.contenedorBusqueda}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={selectedCategoria}
        setValue={handleValueChange}
        items={categoria}
        setItems={setCategoria}
        placeholder="Selecciona una categoría"
        style={styles.dropDownPicker}
        dropDownContainerStyle={styles.dropDownContainer}
        keyExtractor={(item) => item.value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedorBusqueda: {
    width: viewportWidth * 0.9,
    alignSelf: "center",
    marginVertical: 10,
    zIndex: 1001
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
});

export default BarraBusquedaCategoriaSeleccionada;
