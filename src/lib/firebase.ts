import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCVQ5ZSkH2HPVqKEGcEh5bU7yR0TzwskaY",
    authDomain: "lojinha-dasgracas.firebaseapp.com",
    projectId: "lojinha-dasgracas",
    storageBucket: "lojinha-dasgracas.firebasestorage.app",
    messagingSenderId: "242796769867",
    appId: "1:242796769867:web:7247ca7185bba10c6913ce",
    measurementId: "G-VBXZY3ZF4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
