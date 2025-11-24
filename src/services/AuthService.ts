// src/services/AuthService.ts
import { auth } from "./FirebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import * as SecureStore from "expo-secure-store";

/* ------------------------------------------------------------
 * 🔑 Chaves para SecureStore
 * ------------------------------------------------------------ */
const EMAIL_KEY = "ps2_email";
const PASS_KEY = "ps2_pass";

/* ------------------------------------------------------------
 * 🔐 Login com email e senha
 * ------------------------------------------------------------ */
export async function signInWithEmail(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    console.log("✅ Login bem-sucedido:", credential.user.email);
    return credential.user;
  } catch (err: any) {
    console.error("❌ Erro no login Firebase:", err.message);
    throw err;
  }
}

/* ------------------------------------------------------------
 * 🚪 Logout
 * ------------------------------------------------------------ */
export async function signOut() {
  try {
    await fbSignOut(auth);
    console.log("👋 Usuário desconectado com sucesso");
  } catch (err) {
    console.warn("⚠️ Erro ao deslogar:", err);
  }
}

/* ------------------------------------------------------------
 * 💾 Salvar credenciais com segurança
 * ------------------------------------------------------------ */
export async function saveCredentials(email: string, password: string) {
  try {
    await SecureStore.setItemAsync(EMAIL_KEY, email);
    await SecureStore.setItemAsync(PASS_KEY, password);
    console.log("💾 Credenciais salvas com sucesso");
  } catch (err) {
    console.warn("⚠️ Erro ao salvar credenciais:", err);
  }
}

/* ------------------------------------------------------------
 * 🧹 Remover credenciais salvas
 * ------------------------------------------------------------ */
export async function clearSavedCredentials() {
  try {
    await SecureStore.deleteItemAsync(EMAIL_KEY);
    await SecureStore.deleteItemAsync(PASS_KEY);
    console.log("🧹 Credenciais limpas");
  } catch (err) {
    console.warn("⚠️ Erro ao limpar credenciais:", err);
  }
}

/* ------------------------------------------------------------
 * 📦 Obter credenciais salvas
 * ------------------------------------------------------------ */
export async function getSavedCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  try {
    const email = await SecureStore.getItemAsync(EMAIL_KEY);
    const password = await SecureStore.getItemAsync(PASS_KEY);
    if (email && password) return { email, password };
    return null;
  } catch (err) {
    console.warn("⚠️ Erro ao ler credenciais:", err);
    return null;
  }
}
