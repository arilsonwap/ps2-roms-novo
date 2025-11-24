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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { addJogoNovo } from "../services/FirestoreService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// --- Types ---
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

// --- Helpers ---
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

  // --- State ---
  const [form, setForm] = useState<AddGameForm>({
    nome: "",
    codigo: "",
    tamanho: "",
    descricao: "",
    capaUrl: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof AddGameForm | null>(null);

  // --- Handlers ---
  const updateField = (field: keyof AddGameForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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
      Alert.alert("Campos Obrigatórios", "Por favor, preencha Nome, Código e Tamanho.");
      return;
    }

    if (capaUrl.trim() && !isValidUrl(capaUrl.trim())) {
      Alert.alert("URL Inválida", "O link da capa deve começar com http:// ou https://");
      return;
    }

    const tamanhoNum = parseFloat(tamanho);
    if (isNaN(tamanhoNum)) {
      Alert.alert("Formato Inválido", "O tamanho deve ser um número (ex: 4.5).");
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
      Alert.alert("Sucesso", "Jogo adicionado à biblioteca!", [
        { text: "OK", onPress: voltarParaHome }
      ]);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      const message = err instanceof Error ? err.message : "Falha ao salvar.";
      Alert.alert("Erro", message);
    } finally {
      setSalvando(false);
    }
  }, [form, voltarParaHome]);

  // --- Render Helpers ---
  const renderInput = (
    field: keyof AddGameForm,
    placeholder: string,
    icon: keyof typeof Ionicons.glyphMap,
    keyboardType: "default" | "decimal-pad" = "default",
    multiline = false,
    autoCap = "sentences" as any
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
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
          placeholderTextColor="#555"
          value={form[field]}
          onChangeText={(v) => updateField(field, v)}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          autoCapitalize={autoCap}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#0f0c29", "#302b63", "#24243e"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={voltarParaHome} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Novo Jogo</Text>
            <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.card}>
              
              {/* Formulário */}
              {renderInput("nome", "Ex: God of War II", "game-controller-outline", "default", false, "words")}
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    {renderInput("codigo", "Ex: SLUS-20751", "barcode-outline", "default", false, "characters")}
                </View>
                <View style={{ flex: 0.8 }}>
                    {renderInput("tamanho", "Ex: 4.37", "save-outline", "decimal-pad")}
                </View>
              </View>

              {renderInput("descricao", "Sinopse do jogo...", "document-text-outline", "default", true)}
              
              {renderInput("capaUrl", "https://...", "image-outline", "default", false, "none")}

              {/* Preview Dinâmico */}
              {form.capaUrl.trim() && isValidUrl(form.capaUrl.trim()) ? (
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
              ) : null}

              {/* Botão de Salvar */}
              <TouchableOpacity
                style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                    <Text style={styles.saveText}>Salvando...</Text>
                ) : (
                    <>
                        <Text style={styles.saveText}>Salvar na Coleção</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "rgba(30, 30, 30, 0.6)", // Glass effect sutil
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    backgroundColor: "#1a1a1a",
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 16,
    borderRadius: 16,
  },
  previewLabel: {
    color: "#1e90ff",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  imageFrame: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  previewImage: {
    width: 140,
    height: 200, // Aspect ratio de capa de DVD/Game
    borderRadius: 6,
    backgroundColor: "#222",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e90ff",
    height: 56,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#1a3b5c",
    opacity: 0.7,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});