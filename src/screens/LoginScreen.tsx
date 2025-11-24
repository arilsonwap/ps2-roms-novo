import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  signInWithEmail,
  getSavedCredentials,
  saveCredentials,
  clearSavedCredentials,
} from "../services/AuthService";
import { ADMIN_EMAIL } from "../services/FirebaseConfig";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [loading, setLoading] = useState(true);

  // 🔹 Carrega credenciais salvas ao abrir
  useEffect(() => {
    const carregarCredenciais = async () => {
      try {
        const credenciais = await getSavedCredentials();
        if (credenciais) {
          setEmail(credenciais.email);
          setPassword(credenciais.password);
        }
      } catch (e) {
        console.log("Erro ao carregar credenciais:", e);
      } finally {
        setLoading(false);
      }
    };
    carregarCredenciais();
  }, []);

  async function handleLogin() {
    // Validação de acesso admin
    if (email.trim() !== ADMIN_EMAIL) {
      Alert.alert(
        "🚫 Acesso negado",
        "Somente o administrador autorizado pode acessar."
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert("⚠️ Atenção", "Por favor, digite sua senha.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email, password);

      // Salva credenciais se o usuário marcou "lembrar"
      if (lembrar) {
        await saveCredentials(email, password);
      }

      Alert.alert("✅ Sucesso", "Login realizado com sucesso!");
      navigation.replace("Home"); // usar replace em vez de navigate
    } catch (err: any) {
      let errorMessage = "Falha ao fazer login";

      // Mensagens de erro mais amigáveis
      if (err.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      }

      Alert.alert("❌ Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const limparCredenciais = async () => {
    try {
      await clearSavedCredentials();
      setEmail("");
      setPassword("");
      Alert.alert("🧹 Limpo", "Credenciais apagadas com sucesso!");
    } catch (e) {
      Alert.alert("⚠️ Erro", "Não foi possível limpar as credenciais.");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
      <View style={styles.box}>
        <Ionicons name="lock-closed-outline" size={50} color="#fff" />
        <Text style={styles.title}>🔐 Login Administrativo</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setLembrar(!lembrar)}
        >
          <Ionicons
            name={lembrar ? "checkbox" : "square-outline"}
            size={24}
            color="#1e90ff"
          />
          <Text style={styles.checkboxText}>Lembrar credenciais</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={limparCredenciais}>
          <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
          <Text style={styles.clearText}>Apagar login salvo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="arrow-back" size={20} color="#ccc" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "85%",
    backgroundColor: "#111c",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  checkboxText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 15,
  },
  btn: {
    backgroundColor: "#1e90ff",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  clearText: {
    color: "#ff6b6b",
    marginLeft: 6,
    fontSize: 14,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  backText: {
    color: "#ccc",
    marginLeft: 6,
    fontSize: 14,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});