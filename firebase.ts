
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Substitua pelas suas credenciais do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAs-SUA-CHAVE-AQUI",
  authDomain: "devaro-crm.firebaseapp.com",
  projectId: "devaro-crm",
  storageBucket: "devaro-crm.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
