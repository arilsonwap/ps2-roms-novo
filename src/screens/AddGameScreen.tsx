import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { addJogoNovo } from "../services/FirestoreService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/* ----------------------------
    Types
----------------------------- */
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

/* ----------------------------
    Helper - valida URL
----------------------------- */
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
  const [focusedField, setFocusedField] = useState<keyof AddGameForm | null>(null);

  /* ----------------------------
      Update Field
  ----------------------------- */
  const updateField = (field: keyof AddGameForm, value: string) => {
    if (field === "codigo") value = value.toUpperCase();
    if (field === "tamanho") value = value.replace(/[^0-9.]/g, "");

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ----------------------------
      Voltar
  ----------------------------- */
  const voltarParaHome = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Home");
  }, [navigation]);

  /* ----------------------------
      Salvar
  ----------------------------- */
  const handleSalvar = useCallback(async () => {
    const { nome, codigo, tamanho, descricao, capaUrl } = form;

    if (!nome.trim() || !codigo.trim() || !tamanho.trim()) {
      Alert.alert("Campos Obrigatórios", "Preencha Nome, Código e Tamanho.");
      return;
    }

    if (capaUrl.trim() && !isValidUrl(capaUrl.trim())) {
      Alert.alert("URL Inválida", "O link da capa deve começar com http:// ou https://");
      return;
    }

    const tamanhoNum = parseFloat(tamanho);
    if (isNaN(tamanhoNum)) {
      Alert.alert("Formato Inválido", "O tamanho deve ser um número (ex: 4.37).");
      return;
    }

    const novoJogo = {
      nome: nome.trim(),
      codigos: [codigo.trim()],
      tamanho_gb: tamanhoNum,
      descricao: descricao.trim() || "Sem descrição.",
      capa_url: capaUrl.trim(),
    };

    try {
      setSalvando(true);
      await addJogoNovo(novoJogo);
      Alert.alert("Sucesso", "Jogo adicionado à biblioteca!", [
        { text: "OK", onPress: voltarParaHome },
      ]);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      const message = err instanceof Error ? err.message : "Erro ao salvar.";
      Alert.alert("Erro", message);
    } finally {
      setSalvando(false);
    }
  }, [form, voltarParaHome]);

  /* ----------------------------
      Render Input
  ----------------------------- */
  const renderInput = (
    field: keyof AddGameForm,
    placeholder: string,
    icon: keyof typeof Ionicons.glyphMap,
    keyboardType: "default" | "decimal-pad" = "default",
    multiline = false,
    autoCap: "none" | "words" | "sentences" | "characters" = "sentences"
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{field.toUpperCase()}</Text>

      <View
        style={[
          styles.inputWrapper,
          focusedField === field && styles.inputWrapperFocused,
          multiline && { height: 100, alignItems: "flex-start" },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focusedField === field ? "#1e90ff" : "#666"}
          style={[styles.inputIcon, multiline && { marginTop: 12 }]}
        />

        <TextInput
          style={[styles.input, multiline && { height: "100%", paddingTop: 10 }]}
          placeholder={placeholder}
          placeholderTextColor="#777"
          value={form[field]}
          onChangeText={(v) => updateField(field, v)}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCap}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );

  /* ----------------------------
      Render
  ----------------------------- */
  return (
    <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={voltarParaHome} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Adicionar Jogo</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* FORM (CORRIGIDO) */}
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            
            {renderInput("nome", "Ex: God of War II", "game-controller-outline", "default", false, "words")}

            {/* ROW: Código + Tamanho */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                {renderInput("codigo", "SLUS-20751", "barcode-outline", "default", false, "characters")}
              </View>
              <View style={{ flex: 0.8 }}>
                {renderInput("tamanho", "4.37", "save-outline", "decimal-pad")}
              </View>
            </View>

            {renderInput("descricao", "Sinopse do jogo...", "document-text-outline", "default", true)}

            {renderInput("capaUrl", "https://...", "image-outline", "default", false, "none")}

            {/* PREVIEW */}
            {form.capaUrl.trim() && isValidUrl(form.capaUrl.trim()) && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Pré-visualização da Capa</Text>

                <View style={styles.imageFrame}>
                  <ExpoImage
                    source={{ uri: form.capaUrl.trim() }}
                    style={styles.previewImage}
                    contentFit="cover"
                    transition={500}
                  />
                </View>
              </View>
            )}

            {/* BOTÃO SALVAR */}
            <TouchableOpacity
              style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              <Text style={styles.saveText}>
                {salvando ? "Salvando..." : "Salvar na Coleção"}
              </Text>

              {!salvando && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ----------------------------
    Styles
----------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  card: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  label: {
    color: "#aaa",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#333",
  },

  inputWrapperFocused: {
    borderColor: "#1e90ff",
    backgroundColor: "#1c1c1c",
    shadowColor: "#1e90ff",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },

  previewContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.16)",
  },

  previewLabel: {
    color: "#1e90ff",
    fontSize: 12,
    marginBottom: 10,
    fontWeight: "bold",
  },

  imageFrame: {
    elevation: 8,
  },

  previewImage: {
    width: 140,
    height: 200,
    borderRadius: 6,
    backgroundColor: "#222",
  },

  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
