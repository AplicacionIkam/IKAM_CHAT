import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, StatusBar, ScrollView, Linking } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../firebase/config-ikam';
import { Politicas } from "@/models/Politicas";

const db = getFirestore(app);

const ModalTerminosCondiciones = ({ modalVisible, setModalVisible }) => {
    const [politica, setPolitica] = useState<Politicas | null>(null);

    const obtenerPoliticas = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'politica'));
            const politicas = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                // Convertir el Timestamp a Date y formatear
                const fechaVigor = data.fecha_vigor?.toDate();
                return {
                    id: doc.id,
                    ...data,
                    fecha_vigor: fechaVigor,
                };
            });
            setPolitica(politicas);
        } catch (error) {
            console.error('Error obteniendo las políticas:', error);
        }
    }, []);

    useEffect(() => {
        obtenerPoliticas();
    }, [obtenerPoliticas]);

    // Función para formatear la fecha
    const formatDate = (date) => {
        if (!date) return 'No hay contenido disponible';
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Función para abrir la aplicación de correo con el destinatario
    const abrirGmail = (correo) => {
        if (correo) {
            const mailtoUrl = `mailto:${correo}`;
            Linking.openURL(mailtoUrl).catch(() => {
                console.error('No se pudo abrir la aplicación de correo');
            });
        }
    };

    // Función para hacer llamadas
    const makeCall = (numero) => {
        if (numero) {
            Linking.openURL(`tel:${numero}`).catch(() => {
                console.error('No se pudo realizar la llamada');
            });
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
                StatusBar.setHidden(false);
            }}
        >
            <View style={estilos.modalBackground}>
                <View style={estilos.modalView}>
                    <ScrollView contentContainerStyle={estilos.scrollView}>
                        {politica?.length > 0 ? (
                            politica.map((item) => (
                                <View key={item.id}>
                                    <Text style={estilos.modalText}>{item.privacidad_nombre}</Text>
                                    <Text style={estilos.modalContent}>
                                        {item.privacidad || 'No hay contenido disponible'}
                                    </Text>
                                    <Text style={estilos.modalText}>{item.terminosNombre}</Text>
                                    <Text style={estilos.modalContent}>
                                        {item.terminos || 'No hay contenido disponible'}
                                    </Text>
                                    <Text style={estilos.modalText}>Contacto:</Text>
                                    <TouchableOpacity
                                        onPress={() => abrirGmail(item.correo)}
                                    >
                                        <Text style={estilos.modalContent}>
                                            Correo: {item.correo || 'No hay contenido disponible'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => makeCall(item.telefono)}
                                    >
                                        <Text style={estilos.modalContent}>
                                            Teléfono: {item.telefono || 'No hay contenido disponible'}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={estilos.modalContent}>
                                        Fecha entrada: {formatDate(item.fecha_vigor)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={estilos.modalContent}>Cargando...</Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity
                        style={[estilos.button, estilos.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                    >
                        <Text style={estilos.textStyle}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const estilos = StyleSheet.create({
    textStyle: {
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        width: '80%',
        height: '75%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        marginTop: 20,
        backgroundColor: '#41DFD1',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
    },
    modalContent: {
        fontSize: 16,
        textAlign: 'justify',
        marginBottom: 20,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 10,
    },
});

export default ModalTerminosCondiciones;
