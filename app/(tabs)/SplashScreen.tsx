import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

import { getUserData, clearUserData } from "@/auth/authService";
import { ikam } from "@/firebase/config-ikam";
import colorsIkam from "@/assets/estilos";

const SplashScreen = () => {
  const router = useRouter();
  const edges = useSafeAreaInsets();

  // Animation Values.....
  const startAnimation = useRef(new Animated.Value(0)).current;
  const scaleLogo = useRef(new Animated.Value(1)).current;
  const moveLogo = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const animation = () => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(startAnimation, {
          toValue: -Dimensions.get("window").height + (edges.top + 13),
          useNativeDriver: true,
        }),
        Animated.timing(scaleLogo, {
          toValue: 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(moveLogo, {
          toValue: {
            x: 0,
            y: Dimensions.get("window").height / 2 - 25,
          },
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace("menu");
      });
    }, 500);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const userData = await getUserData();
      if (userData) {
        try {
          const userDocRef = doc(ikam, "users", userData.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            animation();
            // router.replace('(tabs)');
          } else {
            await clearUserData();
            router.replace("/WelcomeScreen");
          }
        } catch (error) {
          console.error("Error verifying user data:", error);
          await clearUserData();
          router.replace("/WelcomeScreen");
        }
      } else {
        router.replace("/WelcomeScreen");
      }
    };
    setTimeout(checkAuthStatus, 2000);
  }, []);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: startAnimation }],
          },
        ]}
      >
        <Animated.View style={[styles.containerImagenLogo]}>
          <Animated.Image
            source={require("@/assets/img/logo.png")}
            style={[
              styles.imagenLogo,
              {
                transform: [
                  { translateX: moveLogo.x },
                  { translateY: moveLogo.y },
                  { scale: scaleLogo },
                ],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    ...colorsIkam.rojo,
  },
  containerImagenLogo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imagenLogo: {
    width: 400,
    height: 400,
  },
  // container: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     ...colorsIkam.azul
  // },
  // imagenLogo: {
  //     width: 400,
  //     height: 400
  // },
});

export default SplashScreen;
