import { auth, ikam } from '../firebase/config-ikam';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { saveUserData } from "./authService";

export const registerUser = async (email, password, name, last_name) => {        
    try {
        // Registrar el usuario con Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar la información del usuario en Firestore
        const userRef = doc(collection(ikam, 'users'), user.uid);
        await setDoc(userRef, {
            display_name: name,
            last_name,
            email,
            created_time: Timestamp.now(), // Guardar la marca de tiempo actual
            isAdmin: false,
            isPyme: false,
            phone_number: '',
            photo_url: '',
            age: 0,
            uid: ''
        });
        await saveUserData(user);                        
    } catch (error) {
        throw new Error(error.message);
    }
};