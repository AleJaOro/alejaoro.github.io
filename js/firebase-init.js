/**
 * Inicialización Firebase (Auth + Firestore)
 * Proyecto: pagofacil-574ac
 * Nota: no usamos Storage (pide plan Blaze). Archivos = enlaces en Firestore.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDrg5KrFjOtPpJMglKZmQomQ-q3NfA0g2M",
  authDomain: "pagofacil-574ac.firebaseapp.com",
  projectId: "pagofacil-574ac",
  storageBucket: "pagofacil-574ac.firebasestorage.app",
  messagingSenderId: "622323751416",
  appId: "1:622323751416:web:23658895b04ded39611e0d",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** App secundaria: crear clientes sin cerrar sesión del admin */
export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
