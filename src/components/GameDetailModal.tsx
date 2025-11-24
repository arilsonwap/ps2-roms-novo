import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { capasMap } from "../data/capasMap";

interface JogoPS2Processado {
  nome: string;
  tamanho_gb: number;
  codigos?: string[] | string;
  descricao?: string;
  capa_url?: string;
  nomeFormatado: string;
  bandeira: string;
  nomeParaBusca: string;
}

interface GameDetailModalProps {
  jogo: JogoPS2Processado | null;
  onClose: () => void;
}

export default function GameDetailModal({ jogo, onClose }: GameDetailModalProps) {
  if (!jogo) return null;

  const codigo = Array.isArray(jogo.codigos)
    ? jogo.codigos[0]?.toUpperCase()
    : (jogo.codigos as string | undefined)?.toUpperCase();

  const capa =
    jogo.capa_url && jogo.capa_url.startsWith("http")
      ? { uri: jogo.capa_url }
      : codigo
      ? (capasMap as Record<string, any>)[codigo]
      : undefined;

  return (
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        {capa ? (
          <ExpoImage
            source={capa}
            style={styles.capa}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.capa, styles.semCapa]}>
            <Ionicons name="image-outline" size={40} color="#666" />
          </View>
        )}
        <Text style={styles.titulo}>{jogo.nomeFormatado}</Text>
        <ScrollView style={styles.descScroll}>
          <Text style={styles.descricao}>
            {jogo.descricao || "Descrição não disponível para este jogo."}
          </Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.fecharButton}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Fechar detalhes do jogo"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 16,
    width: "85%",
    alignItems: "center",
  },
  capa: {
    width: 150,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  semCapa: {
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  descScroll: {
    maxHeight: 160,
    alignSelf: "stretch",
  },
  descricao: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fecharButton: {
    marginTop: 14,
    backgroundColor: "#ff5555",
    padding: 10,
    borderRadius: 30,
  },
});
