import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { addJogoNovo } from "../services/FirestoreService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  AddGame: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AddGameForm {
  nome: string;
  codigo: string;
  tamanho: string;
  descricao: string;
  capaUrl: string;
}

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export default function AddGameScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [form, setForm] = useState<AddGameForm>({
    nome: "",
    codigo: "",
    tamanho: "",
    descricao: "",
    capaUrl: "",
  });
  const [salvando, setSalvando] = useState(false);

  const voltarParaHome = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  }, [navigation]);

  const handleSalvar = useCallback(async () => {
    const { nome, codigo, tamanho, descricao, capaUrl } = form;

    if (!nome.trim() || !codigo.trim() || !tamanho.trim()) {
      Alert.alert("⚠️ Atenção", "Preencha ao menos nome, código e tamanho.");
      return;
    }

    if (capaUrl.trim() && !isValidUrl(capaUrl.trim())) {
      Alert.alert("❌ URL inválida", "A URL da capa deve começar com http:// ou https://");
      return;
    }

    const tamanhoNum = parseFloat(tamanho);
    if (isNaN(tamanhoNum)) {
      Alert.alert("❌ Erro", "O campo tamanho deve ser um número (em GB).");
      return;
    }

    const novoJogo = {
      nome: nome.trim(),
      codigos: [codigo.trim().toUpperCase()],
      tamanho_gb: tamanhoNum,
      descricao: descricao.trim() || "Sem descrição.",
      capa_url: capaUrl.trim(),
    };

    try {
      setSalvando(true);
      await addJogoNovo(novoJogo);
      Alert.alert("✅ Sucesso", "Jogo adicionado com sucesso!");
      voltarParaHome();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      const message = err instanceof Error ? err.message : "Falha ao salvar jogo no Firebase.";
      Alert.alert("❌ Erro", message);
    } finally {
      setSalvando(false);
    }
  }, [form, navigation]);

  const updateField = (field: keyof AddGameForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🕹️ Adicionar Novo Jogo</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do jogo"
          placeholderTextColor="#888"
          value={form.nome}
          onChangeText={(v) => updateField("nome", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Código (ex: SLUS-20751)"
          placeholderTextColor="#888"
          value={form.codigo}
          onChangeText={(v) => updateField("codigo", v)}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Tamanho em GB"
          placeholderTextColor="#888"
          keyboardType="decimal-pad"
          value={form.tamanho}
          onChangeText={(v) => updateField("tamanho", v)}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Descrição"
          placeholderTextColor="#888"
          multiline
          textAlignVertical="top"
          value={form.descricao}
          onChangeText={(v) => updateField("descricao", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="URL da capa (https://i.postimg.cc/...)"
          placeholderTextColor="#888"
          value={form.capaUrl}
          onChangeText={(v) => updateField("capaUrl", v)}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.saveButton, salvando && { opacity: 0.6 }]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Ionicons name="save-outline" size={22} color="#fff" />
          <Text style={styles.saveText}>{salvando ? "Salvando..." : "Salvar Jogo"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={voltarParaHome}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#1c1c1c",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  cancelText: {
    color: "#ccc",
    fontSize: 15,
    marginLeft: 6,
  },
});