import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  title?: string;
}

export default function ErrorState({
  message,
  onRetry,
  title = "Ops! Algo deu errado",
}: ErrorStateProps) {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Erro ao carregar jogos"
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline-outline" size={64} color="#ff5555" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessible={true}
        accessibilityLabel="Tentar novamente carregar jogos"
        accessibilityRole="button"
        accessibilityHint="Tenta reconectar ao servidor para carregar os jogos"
      >
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.retryText}>Tentar Novamente</Text>
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
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
