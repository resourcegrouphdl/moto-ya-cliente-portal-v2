import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Mismo proyecto Firebase (`motoya-form`) que admin-v2 y Aliado Comercial —
// Firebase Auth sigue siendo el único IdP (ADR-005), aquí solo cambia el pool
// de usuarios (`cliente`) contra el que se autentica esta app.
// El apiKey no es secreto por diseño (la seguridad real la dan las Security
// Rules + Firebase Auth), es normal que quede visible en el bundle del cliente.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const GATEWAY_BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_BASE_URL ?? "http://localhost:8000";
