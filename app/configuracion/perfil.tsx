import { Stack } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import colorsIkam from "@/assets/estilos";

const user = () => {
  return (
    <View>
      <Stack.Screen
        options={{
          headerStyle: {backgroundColor: colorsIkam.rojo.backgroundColor},
          headerTitle: "Datos de la cuenta",          
          headerTitleAlign: 'center',
          headerTintColor: "white",   
          headerBackTitle: "Perfil",       
          headerShown: true
        }}
      />
        <Text>El contenido que debe llevar va aqui </Text>
        
    </View>
 )
}

export default user