import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import React from "react";

import colorsIkam from "@/assets/estilos";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const [fontsLoaded] = useFonts({
    Space: require("@/assets/fonts/SpaceMono-Regular.ttf"),    
    SansItalic: require("@/assets/fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf"),
    SansVar: require("@/assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"),
  });

  const ruta = useRouter();

  if (!fontsLoaded) {
    return null; // You can add a loading indicator here
  }

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.contenedorTitulo}>
        <Text style={[estilos.tituloGen, estilos.titulo]}>Bienvenido a</Text>
        <Text style={[estilos.tituloGen, estilos.subtitulo]}>
          IKAM Multitiendas
        </Text>
        <Text style={[estilos.tituloGen, estilos.label]}>
          Todo lo que buscas, a tu alcance
        </Text>
      </View>
      <View style={estilos.contenedorImg}>
        <Image
          source={require("@/assets/img/bienvenida.png")}
          style={estilos.imagen}
        />
      </View>
      <View style={estilos.contenedorTitulo}>
        <Text style={[estilos.tituloGen, estilos.labelBtn]}>
          "Tu éxito es nuestro objetivo"
        </Text>
      </View>
      <View style={estilos.contenedorBtn}>
        <Pressable
          // title="Login"
          style={estilos.btn}
          onPress={() => ruta.push("/LoginScreen")}
        >
          <Text style={estilos.btnText}>Comienza YA</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  contenedorTitulo: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tituloGen: {
    fontFamily: "SansVar",
    textAlign: "center",
  },
  titulo: {
    fontSize: width * 0.1,
    fontWeight: "bold",
    color: colorsIkam.azulTex.color,
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: width * 0.075,
    fontWeight: "900",
    marginBottom: 10,
  },
  label: {
    fontSize: width * 0.04,
    marginBottom: 20,
  },
  contenedorImg: {
    alignItems: "center",
    paddingVertical: 15,
  },
  imagen: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
  },
  contenedorBtn: {
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  labelBtn: {
    fontSize: width * 0.05,
    fontStyle: "italic",
    color: colorsIkam.rojoTex.color,
    marginBottom: 20,
  },
  btn: {
    width: "80%",
    padding: 15,
    borderRadius: 40,
    backgroundColor: colorsIkam.cian.backgroundColor,
    alignItems: "center",
  },
  btnText: {
    fontSize: width * 0.05,
    color: "white",
  },
});

export default WelcomeScreen;
