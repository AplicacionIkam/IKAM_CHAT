import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { Stack } from "expo-router";
import colorsIkam from "@/assets/estilos";
import { getQuestions, subscribeToQuestions } from "@/services/services";
import { Preguntas } from "@/models/preguntas";
import ModalPassword from "@/components/modalPassword";
import ModalPregunta from "@/components/modalPregunta";

const preguntas = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<Preguntas[]>(
    []
  );

  useEffect(() => {
    const unsubscribe = subscribeToQuestions((questions: any) => {
      setQuestionsAndAnswers(questions);
    });

    // Limpia la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colorsIkam.rojo.backgroundColor },
          headerTitle: "Preguntas Frecuentes",
          headerTitleAlign: "center",
          headerTintColor: "white",
          headerBackTitle: "Perfil",
          headerShown: true,
        }}
      />
      <View style={styles.addButtonContainer}>
        <Pressable style={styles.addButton}
        onPress={()=> setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Agregar pregunta</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {questionsAndAnswers
          .filter((item) => item.respuesta) // Filtrar las preguntas con respuesta
          .map((item) => (
            <View key={item.id} style={styles.qaCard}>
              <Text style={styles.question}>{item.pregunta}</Text>
              <Text style={styles.answer}>{item.respuesta}</Text>
              <Text style={styles.date}>
                Fecha: {item.created_time.toDate().toLocaleDateString()}
              </Text>
            </View>
          ))}
        <ModalPregunta
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  addButtonContainer: {
    position: "absolute",
    right: 10,
    bottom: 10,
    zIndex: 1, // Asegura que el botón esté sobre otros elementos
  },
  addButton: {
    backgroundColor: colorsIkam.rojo.backgroundColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 15,
  },
  qaCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#888",
    textAlign: "right",
  },
});

export default preguntas;
