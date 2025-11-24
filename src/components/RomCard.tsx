import React, { memo, useRef, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { capasMap } from "../data/capasMap";

// ============================
// 📘 Tipagem
// ============================
export interface JogoPS2 {
  nome: string;
  tamanho_gb: number;
  codigo?: string;
}

// ============================
// 🎮 Componente otimizado
// ============================
interface RomCardProps {
  item: JogoPS2;
  selecionado: boolean;
  toggleSelecao: (nome: string) => void;
  formatarNome: (nome: string) => { nome: string; bandeira: string };
}

const RomCard = memo(({ item, selecionado, toggleSelecao, formatarNome }: RomCardProps) => {
  const { nome: nomeFormatado, bandeira } = formatarNome(item.nome);

  // ✅ useRef garante que o Animated.Value não seja recriado a cada render
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handleToggle = useCallback(() => toggleSelecao(item.nome), [item.nome, toggleSelecao]);

  // ⚙️ Busca da capa (memoizada)
  const capaLocal = useMemo(() => {
    const codigoBase = item.codigo || nomeFormatado.toUpperCase();
    return (capasMap as Record<string, any>)[codigoBase] || null;
  }, [item.codigo, nomeFormatado]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.item, selecionado && styles.itemSelecionado]}
      >
        {capaLocal ? (
          <ExpoImage
            source={capaLocal}
            style={styles.capa}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            onError={() => console.warn(`❌ Erro ao carregar capa local: ${item.nome}`)}
          />
        ) : (
          <View style={[styles.capa, styles.capaFallback]}>
            <Ionicons name="image-outline" size={28} color="#666" />
          </View>
        )}

        <View style={styles.infoBox}>
          <View style={styles.nomeBox}>
            <Text style={styles.nome} numberOfLines={1}>
              {nomeFormatado}
            </Text>
            {bandeira ? <Text style={styles.flag}> {bandeira}</Text> : null}
          </View>
          <Text style={styles.tamanho}>{item.tamanho_gb} GB</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default RomCard;

// ============================
// 🎨 Estilos
// ============================
const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  itemSelecionado: { backgroundColor: "#1e90ff55" },
  capa: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  capaFallback: {
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: { flex: 1 },
  nomeBox: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  nome: { color: "#fff", fontSize: 15, fontWeight: "500", flexShrink: 1 },
  flag: { color: "#fff", fontSize: 15 },
  tamanho: { color: "#ccc", fontSize: 13, marginTop: 4 },
});
