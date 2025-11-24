import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { signInWithEmail, saveCredentials } from "../services/AuthService";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, password: string) => void;
}

const ADMIN_EMAIL = "arilsonwap@gmail.com";

export default function LoginModal({
  visible,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput | null>(null);

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha e-mail e senha.");
      return;
    }

    if (email.trim() !== ADMIN_EMAIL) {
      Alert.alert("Acesso Restrito", "Este app é exclusivo do administrador.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      await saveCredentials(email, password);

      onLoginSuccess(email, password);
      onClose();

      Alert.alert("Bem-vindo", "Login realizado com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao fazer login";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose} // botão voltar Android
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <View style={styles.loginBox}>

                {/* Cabeçalho */}
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person" size={26} color="#1e90ff" />
                  </View>
                  <Text style={styles.title}>Bem-vindo de volta</Text>
                  <Text style={styles.subtitle}>Faça login para continuar</Text>
                </View>

                {/* INPUT EMAIL */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "email" && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#888"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Seu e-mail"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus?.()}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {/* INPUT SENHA */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "password" && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#888"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Sua senha"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                  />

                  <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                    <Ionicons
                      name={secureText ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {/* BOTÃO ENTRAR */}
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    loading && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.confirmText}>Entrar</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#fff"
                        style={{ marginLeft: 8 }}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* CANCELAR */}
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/* ---------------- ESTILOS ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: {
    width: "100%",
    alignItems: "center",
  },
  loginBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 26,
  },
  iconContainer: {
    width: 62,
    height: 62,
    backgroundColor: "rgba(30, 144, 255, 0.12)",
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputFocused: {
    backgroundColor: "#2A2A2A",
    borderColor: "#1e90ff",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  confirmButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    height: 56,
    width: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 20,
    padding: 12,
  },
  cancelText: {
    color: "#777",
    fontSize: 15,
  },
});
