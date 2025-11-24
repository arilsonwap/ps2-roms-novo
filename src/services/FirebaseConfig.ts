// src/services/FirebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_CONFIG, ADMIN_EMAIL } from "./firebase.config.js";


/* ------------------------------------------------------------
 * ⚙️ Configuração do Firebase
 * ------------------------------------------------------------ */
console.log("🔄 Inicializando Firebase...");

// Validação
if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
  throw new Error("❌ Configuração do Firebase está incompleta!");
}

/* ------------------------------------------------------------
 * 🧩 Inicializa Firebase uma única vez
 * ------------------------------------------------------------ */
const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

/* ------------------------------------------------------------
 * 🔐 Inicializa Auth
 * NOTA: O Firebase detecta automaticamente o AsyncStorage quando
 * instalado e usa para persistência. Não precisa configuração
 * explícita no React Native!
 * ------------------------------------------------------------ */
const auth = getAuth(app);

console.log("✅ Firebase inicializado com sucesso!");

/* ------------------------------------------------------------
 * 🔐 Exportações
 * ------------------------------------------------------------ */
export { app, db, auth, ADMIN_EMAIL };
