import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, router } from "expo-router";

const Chatlist = ({ users }) => {
  const openChat = (item: any) => {
    router.push({ pathname: "/chat/chat", params: item });
  };

  const ChatItem = (item: any) => {
    return (
      <View>
        <TouchableOpacity
          style={estilos.touchable}
          onPress={() => openChat(item)}
        >
          <Image source={{ uri: item.img }} style={estilos.tarjetaImg} />
          <View style={estilos.textContainer}>
            <View style={estilos.headerContainer}>
              <Text style={estilos.nameText}>{item.nombre}</Text>
              <Text style={estilos.timeText}>
                {item.hora
                  ? new Date(item.hora.seconds * 1000).toLocaleDateString([], {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }) +
                    " " +
                    new Date(item.hora.seconds * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
            </View>
            <Text style={estilos.messageText}>{item.ultimoMensaje}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const chatsFiltrados = users.filter((user: any) => user.ultimoMensaje);  

  const chatsOrdenados = chatsFiltrados.sort(
    (a:any, b:any) =>
      new Date(b.hora.seconds * 1000).getTime() -
      new Date(a.hora.seconds * 1000).getTime()
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={chatsOrdenados} // Usa el array filtrado aquí
        contentContainerStyle={{ paddingVertical: 6 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => ChatItem(item)} // Asegúrate de pasar el item
        keyExtractor={(item) => item.id.toString()} // Usa un id único
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  touchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  tarjetaImg: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameText: {
    fontWeight: "bold",
  },
  timeText: {
    color: "#888",
  },
  messageText: {
    color: "#555",
  },
});

export default Chatlist;
