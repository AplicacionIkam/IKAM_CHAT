import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View, StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get("window");

const BarraBusqueda = ({ busquedaPyme, setbusquedaPyme, setModalVisible }) => {
    return (
        <View style={estilos.barraBusqueda}>
            <FontAwesome5
                name="search"
                size={25}
                color="#222C57"
                style={estilos.iconoBusqueda}
            />
            <TextInput
                style={estilos.entradaBusqueda}
                placeholder="¿Qué lugar es de tu interés?"
                placeholderTextColor="#222C57"
                value={busquedaPyme}
                onChangeText={setbusquedaPyme}
            />
            {busquedaPyme &&
                <FontAwesome5
                    name="times"
                    size={25}
                    color="#C61919"
                    style={estilos.iconoBusqueda}
                    onPress={() => {
                        setbusquedaPyme("");
                    }}
                />
            }
            <FontAwesome5
                name="filter"
                size={25}
                color="#222C57"
                style={estilos.iconoBusqueda}
                onPress={() => {
                    setModalVisible(true);
                }}
            />
        </View>
    )
}

const estilos = StyleSheet.create({
    barraBusqueda: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
        width: width * 0.9,
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 20,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        alignSelf: "center",
    },
    iconoBusqueda: {
        marginRight: 10,
        marginLeft: 10,
    }, entradaBusqueda: {
        flex: 1,
        fontSize: 16,
        textAlign: "center"
    },
})
export default BarraBusqueda;