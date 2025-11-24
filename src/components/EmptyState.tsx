import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

export default function EmptyState({ searchTerm, onClearSearch }: EmptyStateProps) {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={`Nenhum jogo encontrado para a busca ${searchTerm}`}
      accessibilityRole="text"
    >
      <Ionicons name="search-outline" size={64} color="#666" />
      <Text style={styles.title}>Nenhum jogo encontrado</Text>
      <Text style={styles.message}>
        Não encontramos jogos com o termo "{searchTerm}"
      </Text>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onClearSearch}
        accessible={true}
        accessibilityLabel="Limpar busca"
        accessibilityRole="button"
        accessibilityHint="Remove o termo de busca e exibe todos os jogos novamente"
      >
        <Text style={styles.clearText}>Limpar busca</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    color: "#999",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  clearText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
