import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Buscar jogo...",
}: SearchBarProps) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={20} color="#999" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        accessible={true}
        accessibilityLabel="Campo de busca de jogos"
        accessibilityHint="Digite o nome do jogo que você deseja encontrar"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          accessible={true}
          accessibilityLabel="Limpar busca"
          accessibilityRole="button"
          accessibilityHint="Remove o texto da busca"
        >
          <Ionicons name="close-circle" size={20} color="#bbb" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 16,
  },
});
