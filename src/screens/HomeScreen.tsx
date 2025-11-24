import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
  ScrollView,
  ListRenderItemInfo,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import FloatingPanel from "../components/FloatingPanel";
import CoachMark from "./CoachMark";
import romsData from "../../roms_ps2_unido.json";
import { capasMap } from "../data/capasMap";
import { getJogosNovos } from "../services/FirestoreService";
import {
  signInWithEmail,
  saveCredentials,
  clearSavedCredentials,
  getSavedCredentials,
} from "../services/AuthService";

/* ---------- Tipos ---------- */
interface JogoPS2 {
  nome: string;
  tamanho_gb: number;
  codigos?: string[] | string;
  descricao?: string;
  capa_url?: string;
}

/* ---------- Item ---------- */
const JogoItem = React.memo(
  ({
    item,
    selecionado,
    toggleSelecao,
    formatarNome,
    mostrarCapas,
    abrirDetalhe,
  }: {
    item: JogoPS2;
    selecionado: boolean;
    toggleSelecao: (nome: string) => void;
    formatarNome: (nome: string) => { nome: string; bandeira: string };
    mostrarCapas: boolean;
    abrirDetalhe: (jogo: JogoPS2) => void;
  }) => {
    const { nome: nomeFormatado, bandeira } = formatarNome(item.nome);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    }, [scaleAnim]);
    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handleToggle = useCallback(() => toggleSelecao(item.nome), [toggleSelecao, item.nome]);
    const handleOpenDetail = useCallback(() => abrirDetalhe(item), [abrirDetalhe, item]);

    const code = useMemo(() => {
      const c = Array.isArray(item.codigos) ? item.codigos[0] : item.codigos;
      return c?.toUpperCase();
    }, [item.codigos]);

    const capaLocal = code ? (capasMap as Record<string, any>)[code] : undefined;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.item, selecionado && { backgroundColor: "#1e90ff55" }]}
        >
          {mostrarCapas &&
            (item.capa_url ? (
              <ExpoImage
                source={{ uri: item.capa_url }}
                style={styles.capa}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : capaLocal ? (
              <ExpoImage
                source={capaLocal}
                style={styles.capa}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.capa, styles.semCapa]}>
                <Ionicons name="image-outline" size={28} color="#666" />
              </View>
            ))}

          <View style={styles.infoBox}>
            <View style={styles.nomeBox}>
              <Text style={styles.nome} numberOfLines={1}>
                {nomeFormatado}
              </Text>
              {!!bandeira && <Text style={styles.flag}> {bandeira}</Text>}
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.tamanho}>{item.tamanho_gb} GB</Text>
              <TouchableOpacity style={styles.olhoButton} onPress={handleOpenDetail}>
                <Ionicons name="eye-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const ITEM_HEIGHT = 100;
const ITEM_MARGIN_BOTTOM = 6;
const ROW_LENGTH = ITEM_HEIGHT + ITEM_MARGIN_BOTTOM;

/* ---------- Tela ---------- */
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logado, setLogado] = useState(false);
  const [mostrarCapas, setMostrarCapas] = useState(true);
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [penDriveInfo, setPenDriveInfo] = useState<{ tamanho?: number; real?: number } | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [jogoDetalhe, setJogoDetalhe] = useState<JogoPS2 | null>(null);
  const [jogosFirebase, setJogosFirebase] = useState<JogoPS2[]>([]);

  const carregarJogosFirebase = useCallback(async () => {
    try {
      const novos = await getJogosNovos();
      setJogosFirebase(novos);
    } catch (err) {
      console.log("Erro ao carregar jogos do Firebase:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarJogosFirebase();
    }, [carregarJogosFirebase])
  );

  useEffect(() => {
    (async () => {
      const tutorialCompleto = await AsyncStorage.getItem("@tutorial_completo");
      if (tutorialCompleto !== "true") {
        setTimeout(() => setMostrarTutorial(true), 500);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const creds = await getSavedCredentials();
      if (creds?.email && creds?.password) {
        setEmail(creds.email);
        setPassword(creds.password);
        try {
          await signInWithEmail(creds.email, creds.password);
          setLogado(true);
        } catch {}
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (email.trim() !== "arilsonwap@gmail.com") {
      Alert.alert("Acesso negado", "Somente o e-mail autorizado pode entrar.");
      return;
    }
    try {
      await signInWithEmail(email, password);
      await saveCredentials(email, password);
      setLogado(true);
      setLoginVisible(false);
      Alert.alert("✅ Sucesso", "Login realizado com sucesso!");
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Falha ao fazer login");
    }
  };

  const handleLogout = async () => {
    await clearSavedCredentials();
    setLogado(false);
    Alert.alert("Logout", "Você saiu da conta com sucesso!");
  };

  const romsLocal = useMemo(
    () => (romsData as JogoPS2[]).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    ),
    []
  );

  const roms = useMemo(
    () =>
      [...romsLocal, ...jogosFirebase].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      ),
    [romsLocal, jogosFirebase]
  );

  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput.trim()), 200);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const formatarNome = useCallback((nome: string) => {
    let nomeLimpo = nome.replace(/\.iso$/i, "").trim();
    let bandeira = "";
    if (/\(BR\)/i.test(nomeLimpo)) bandeira = "🇧🇷";
    else if (/\(USA\)|\(US\)/i.test(nomeLimpo)) bandeira = "🇺🇸";
    else if (/\(PT\)/i.test(nomeLimpo)) bandeira = "🇵🇹";
    else if (/\(JP\)/i.test(nomeLimpo)) bandeira = "🇯🇵";
    nomeLimpo = nomeLimpo.replace(/\(BR\)|\(USA\)|\(US\)|\(PT\)|\(JP\)/gi, "").trim();
    return { nome: nomeLimpo, bandeira };
  }, []);

  const filtradosAll = useMemo(() => {
    if (!busca) return roms;
    const b = busca.toLowerCase();
    return roms.filter((jogo) => formatarNome(jogo.nome).nome.toLowerCase().includes(b));
  }, [busca, roms, formatarNome]);

  const filtrados = useMemo(() => filtradosAll.slice(0, page * 40), [filtradosAll, page]);
  const selecionadosSet = useMemo(() => new Set(selecionados), [selecionados]);

  const toggleSelecao = useCallback((nome: string) => {
    setSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );
  }, []);

  const limparSelecao = useCallback(() => setSelecionados([]), []);
  const totalGB = useMemo(() => {
    let soma = 0;
    for (const j of roms) if (selecionadosSet.has(j.nome)) soma += j.tamanho_gb;
    return soma.toFixed(2);
  }, [selecionadosSet, roms]);

  const ultrapassou = !!(penDriveInfo?.real && parseFloat(totalGB) > penDriveInfo.real);
  const handleEndReached = useCallback(() => {
    if (filtrados.length < filtradosAll.length) setPage((p) => p + 1);
  }, [filtrados.length, filtradosAll.length]);
  const keyExtractor = useCallback((item: JogoPS2) => item.nome, []);
  const getItemLayout = useCallback(
    (_: JogoPS2[] | null | undefined, index: number) => ({
      length: ROW_LENGTH,
      offset: ROW_LENGTH * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<JogoPS2>) => (
      <JogoItem
        item={item}
        selecionado={selecionadosSet.has(item.nome)}
        toggleSelecao={toggleSelecao}
        formatarNome={formatarNome}
        mostrarCapas={mostrarCapas}
        abrirDetalhe={setJogoDetalhe}
      />
    ),
    [selecionadosSet, toggleSelecao, formatarNome, mostrarCapas]
  );

  /* ---------- UI ---------- */
  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
      <View style={styles.topInfo}>
        <Text style={styles.totalText}>Total de jogos: {roms.length}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {logado && (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddGame")}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 4 }}>Adicionar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.loginButton, { marginLeft: 10 }]}
            onPress={() => (logado ? handleLogout() : setLoginVisible(true))}
          >
            <Ionicons
              name={logado ? "log-out-outline" : "person-circle-outline"}
              size={26}
              color="#fff"
            />
            <Text style={{ color: "#fff", marginLeft: 6 }}>{logado ? "Sair" : "Login"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Mostrar capas</Text>
        <Switch
          value={mostrarCapas}
          onValueChange={setMostrarCapas}
          thumbColor={mostrarCapas ? "#1e90ff" : "#555"}
        />
      </View>

      {/* 🔍 Busca + Limpar seleção */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.input}
            placeholder="Buscar jogo..."
            placeholderTextColor="#999"
            value={buscaInput}
            onChangeText={setBuscaInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {buscaInput.length > 0 && (
            <TouchableOpacity onPress={() => setBuscaInput("")}>
              <Ionicons name="close-circle" size={20} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        {selecionados.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={limparSelecao}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        initialNumToRender={20}
        maxToRenderPerBatch={12}
        windowSize={7}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <FloatingPanel
        totalGB={totalGB}
        quantidade={selecionados.length}
        ultrapassou={ultrapassou}
        onPenDriveChange={setPenDriveInfo}
        selecionados={roms
          .filter((j) => selecionadosSet.has(j.nome))
          .map((j) => ({ ...j, ...formatarNome(j.nome) }))}
      />

      {jogoDetalhe && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {(() => {
              const codigo = Array.isArray(jogoDetalhe.codigos)
                ? jogoDetalhe.codigos[0]?.toUpperCase()
                : (jogoDetalhe.codigos as string | undefined)?.toUpperCase();
              const capa =
                jogoDetalhe.capa_url && jogoDetalhe.capa_url.startsWith("http")
                  ? { uri: jogoDetalhe.capa_url }
                  : codigo
                  ? (capasMap as Record<string, any>)[codigo]
                  : undefined;

              return capa ? (
                <ExpoImage source={capa} style={styles.modalCapa} contentFit="cover" cachePolicy="memory-disk" />
              ) : (
                <View style={[styles.modalCapa, styles.semCapa]}>
                  <Ionicons name="image-outline" size={40} color="#666" />
                </View>
              );
            })()}
            <Text style={styles.modalTitulo}>{formatarNome(jogoDetalhe.nome).nome}</Text>
            <ScrollView style={styles.descScroll}>
              <Text style={styles.modalDescricao}>
                {jogoDetalhe.descricao || "Descrição não disponível para este jogo."}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.fecharButton} onPress={() => setJogoDetalhe(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Login */}
      <Modal visible={loginVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.loginBox}>
            <Text style={styles.loginTitle}>🔐 Login</Text>
            <TextInput
              style={styles.inputLogin}
              placeholder="E-mail"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.inputLogin}
              placeholder="Senha"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.loginConfirm} onPress={handleLogin}>
              <Text style={styles.loginText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginCancel} onPress={() => setLoginVisible(false)}>
              <Text style={{ color: "#fff" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CoachMark visible={mostrarTutorial} onComplete={() => setMostrarTutorial(false)} />
    </LinearGradient>
  );
}

/* ---------- Estilos ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  topInfo: {
    marginBottom: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e90ff44",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a74566",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111c",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  toggleText: { color: "#fff", fontSize: 14 },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
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
  clearButton: {
    marginLeft: 10,
    backgroundColor: "#ff5555",
    padding: 10,
    borderRadius: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    height: 100,
  },
  capa: { width: 60, height: 80, borderRadius: 6, marginRight: 10 },
  semCapa: { backgroundColor: "#222", justifyContent: "center", alignItems: "center" },
  infoBox: { flex: 1 },
  nomeBox: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  nome: { color: "#fff", fontSize: 15, fontWeight: "500", flexShrink: 1 },
  flag: { color: "#fff", fontSize: 15 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  tamanho: { color: "#ccc", fontSize: 13 },
  olhoButton: { padding: 6 },
  modalOverlay: {
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
  modalCapa: { width: 150, height: 200, borderRadius: 8, marginBottom: 10 },
  modalTitulo: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  descScroll: { maxHeight: 160, alignSelf: "stretch" },
  modalDescricao: { color: "#ccc", fontSize: 14, textAlign: "center", lineHeight: 20 },
  fecharButton: { marginTop: 14, backgroundColor: "#ff5555", padding: 10, borderRadius: 30 },
  loginBox: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  loginTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  inputLogin: {
    width: "100%",
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  loginConfirm: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 5,
  },
  loginText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  loginCancel: { marginTop: 10 },
});
