// src/services/FirestoreService.ts
import { db } from "./FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore";

/* ------------------------------------------------------------
 * 🔹 Tipo base dos jogos PS2
 * ------------------------------------------------------------ */
export interface JogoPS2 {
  nome: string;
  tamanho_gb: number;
  codigos: string[];
  descricao: string;
  capa_url?: string;
}

/* ------------------------------------------------------------
 * 🔹 Adicionar novo jogo ao Firestore
 * ------------------------------------------------------------ */
export async function addJogoNovo(jogo: JogoPS2) {
  try {
    const colRef = collection(db, "jogos_novos");
    const docRef = await addDoc(colRef, jogo);
    console.log("✅ Jogo adicionado com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao adicionar jogo:", error);
    throw error;
  }
}

/* ------------------------------------------------------------
 * 🔹 Obter todos os jogos da coleção
 * ------------------------------------------------------------ */
export async function getJogosNovos(): Promise<(JogoPS2 & { id: string })[]> {
  try {
    const colRef = collection(db, "jogos_novos");
    const q = query(colRef, orderBy("nome"));
    const snapshot = await getDocs(q);

    const jogos: (JogoPS2 & { id: string })[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      jogos.push({ id: doc.id, ...(data as JogoPS2) });
    });

    console.log(`📦 ${jogos.length} jogos carregados do Firebase`);
    return jogos;
  } catch (error) {
    console.error("❌ Erro ao buscar jogos:", error);
    return [];
  }
}

/* ------------------------------------------------------------
 * 🔹 Função opcional de teste (debug local)
 * ------------------------------------------------------------ */
export async function testarConexaoFirestore() {
  try {
    console.log("⏳ Testando conexão com Firestore...");
    const lista = await getJogosNovos();
    console.log("✅ Firestore respondeu com:", lista.length, "documentos.");
  } catch (error) {
    console.error("⚠️ Erro na conexão com Firestore:", error);
  }
}
