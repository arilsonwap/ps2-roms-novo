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
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
  ListRenderItemInfo,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import FloatingPanel from "../components/FloatingPanel";
import CoachMark from "./CoachMark";
import SkeletonLoader from "../components/SkeletonLoader";
import SearchBar from "../components/SearchBar";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import LoginModal from "../components/LoginModal";
import GameDetailModal from "../components/GameDetailModal";
import romsData from "../../roms_ps2_unido.json";
import { capasMap } from "../data/capasMap";
import { getJogosNovos } from "../services/FirestoreService";
import {
  clearSavedCredentials,
  getSavedCredentials,
  signInWithEmail,
} from "../services/AuthService";

/* ---------- Tipos ---------- */
interface JogoPS2 {
  nome: string;
  tamanho_gb: number;
  codigos?: string[] | string;
  descricao?: string;
  capa_url?: string;
}

interface JogoPS2Processado extends JogoPS2 {
  nomeFormatado: string;
  bandeira: string;
  nomeParaBusca: string; // nome em lowercase para busca
}

/* ---------- Item ---------- */
const JogoItem = React.memo(
  ({
    item,
    selecionado,
    toggleSelecao,
    mostrarCapas,
    abrirDetalhe,
    index,
  }: {
    item: JogoPS2Processado;
    selecionado: boolean;
    toggleSelecao: (nome: string) => void;
    mostrarCapas: boolean;
    abrirDetalhe: (jogo: JogoPS2Processado) => void;
    index: number;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // 🎬 Animação de entrada com stagger
    useEffect(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          delay: index * 50, // Efeito cascata
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index, translateY, opacity]);

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
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY }], opacity }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.item, selecionado && { backgroundColor: "#1e90ff55" }]}
          accessible={true}
          accessibilityLabel={`${item.nomeFormatado}, ${item.tamanho_gb} gigabytes, ${
            selecionado ? "selecionado" : "não selecionado"
          }`}
          accessibilityRole="button"
          accessibilityState={{ selected: selecionado }}
          accessibilityHint="Toque para selecionar ou desselecionar este jogo"
        >
          {mostrarCapas &&
            (item.capa_url ? (
              <ExpoImage
                source={{ uri: item.capa_url }}
                style={styles.capa}
                contentFit="cover"
                cachePolicy="memory-disk"
                accessible={true}
                accessibilityLabel={`Capa do jogo ${item.nomeFormatado}`}
              />
            ) : capaLocal ? (
              <ExpoImage
                source={capaLocal}
                style={styles.capa}
                contentFit="cover"
                cachePolicy="memory-disk"
                accessible={true}
                accessibilityLabel={`Capa do jogo ${item.nomeFormatado}`}
              />
            ) : (
              <View style={[styles.capa, styles.semCapa]} accessible={true} accessibilityLabel="Sem capa disponível">
                <Ionicons name="image-outline" size={28} color="#666" />
              </View>
            ))}

          <View style={styles.infoBox}>
            <View style={styles.nomeBox}>
              <Text style={styles.nome} numberOfLines={1}>
                {item.nomeFormatado}
              </Text>
              {!!item.bandeira && <Text style={styles.flag}> {item.bandeira}</Text>}
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.tamanho}>{item.tamanho_gb} GB</Text>
              <TouchableOpacity
                style={styles.olhoButton}
                onPress={handleOpenDetail}
                accessible={true}
                accessibilityLabel={`Ver detalhes de ${item.nomeFormatado}`}
                accessibilityRole="button"
                accessibilityHint="Abre uma tela com descrição completa do jogo"
              >
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
  const [logado, setLogado] = useState(false);
  const [mostrarCapas, setMostrarCapas] = useState(true);
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [penDriveInfo, setPenDriveInfo] = useState<{ tamanho?: number; real?: number } | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [jogoDetalhe, setJogoDetalhe] = useState<JogoPS2Processado | null>(null);
  const [jogosFirebase, setJogosFirebase] = useState<JogoPS2[]>([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);
  const [errorFirebase, setErrorFirebase] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const carregarJogosFirebase = useCallback(async (tentativa = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = [1000, 2000, 4000]; // Exponential backoff

    try {
      setLoadingFirebase(true);
      setErrorFirebase(null);

      const novos = await getJogosNovos();
      setJogosFirebase(novos);
      setLoadingFirebase(false);
      setRetryCount(0);
    } catch (err) {
      console.error("Erro ao carregar jogos do Firebase (tentativa " + (tentativa + 1) + "):", err);

      // Retry automático
      if (tentativa < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(tentativa + 1);
          carregarJogosFirebase(tentativa + 1);
        }, RETRY_DELAY[tentativa] || 4000);
      } else {
        // Falha após todas as tentativas
        setLoadingFirebase(false);
        setErrorFirebase(
          "Não foi possível carregar os jogos do servidor. Verifique sua conexão com a internet."
        );
      }
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
        try {
          await signInWithEmail(creds.email, creds.password);
          setLogado(true);
        } catch {}
      }
    })();
  }, []);

  // 💾 Carregar seleções salvas
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("@selected_games");
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          setSelecionados(parsed);
        }
      } catch (err) {
        console.error("Erro ao carregar seleções salvas:", err);
      }
    })();
  }, []);

  // 💾 Salvar seleções quando mudam
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("@selected_games", JSON.stringify(selecionados));
      } catch (err) {
        console.error("Erro ao salvar seleções:", err);
      }
    })();
  }, [selecionados]);

  const handleLoginSuccess = () => {
    setLogado(true);
    setLoginVisible(false);
  };

  const handleLogout = async () => {
    await clearSavedCredentials();
    setLogado(false);
    Alert.alert("Logout", "Você saiu da conta com sucesso!");
  };

  const handleRetryManual = () => {
    setRetryCount(0);
    carregarJogosFirebase(0);
  };

  // 🔄 Pull to Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const novos = await getJogosNovos();
      setJogosFirebase(novos);
      setErrorFirebase(null);
    } catch (err) {
      console.error("Erro ao atualizar jogos:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  // 🚀 Função para processar um jogo e adicionar campos pré-calculados
  const processarJogo = useCallback((jogo: JogoPS2): JogoPS2Processado => {
    const { nome: nomeFormatado, bandeira } = formatarNome(jogo.nome);
    return {
      ...jogo,
      nomeFormatado,
      bandeira,
      nomeParaBusca: nomeFormatado.toLowerCase(),
    };
  }, [formatarNome]);

  const romsLocal = useMemo(
    () =>
      (romsData as JogoPS2[])
        .map(processarJogo)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })),
    [processarJogo]
  );

  const roms = useMemo(
    () =>
      [...romsLocal, ...jogosFirebase.map(processarJogo)].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      ),
    [romsLocal, jogosFirebase, processarJogo]
  );

  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput.trim()), 200);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const filtradosAll = useMemo(() => {
    if (!busca) return roms;
    const b = busca.toLowerCase();
    return roms.filter((jogo) => jogo.nomeParaBusca.includes(b));
  }, [busca, roms]);

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
  const keyExtractor = useCallback((item: JogoPS2Processado) => item.nome, []);
  const getItemLayout = useCallback(
    (_: ArrayLike<JogoPS2Processado> | null | undefined, index: number) => ({
      length: ROW_LENGTH,
      offset: ROW_LENGTH * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<JogoPS2Processado>) => (
      <JogoItem
        item={item}
        index={index}
        selecionado={selecionadosSet.has(item.nome)}
        toggleSelecao={toggleSelecao}
        mostrarCapas={mostrarCapas}
        abrirDetalhe={setJogoDetalhe}
      />
    ),
    [selecionadosSet, toggleSelecao, mostrarCapas]
  );

  /* ---------- UI ---------- */
  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
      <View style={styles.topInfo}>
        <Text style={styles.totalText}>Total de jogos: {roms.length}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {logado && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("AddGame")}
              accessible={true}
              accessibilityLabel="Adicionar novo jogo"
              accessibilityRole="button"
              accessibilityHint="Abre tela para cadastrar um novo jogo no catálogo"
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 4 }}>Adicionar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.loginButton, { marginLeft: 10 }]}
            onPress={() => (logado ? handleLogout() : setLoginVisible(true))}
            accessible={true}
            accessibilityLabel={logado ? "Sair da conta" : "Fazer login"}
            accessibilityRole="button"
            accessibilityHint={logado ? "Desconecta sua conta" : "Abre tela de login"}
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
          accessible={true}
          accessibilityLabel="Mostrar capas dos jogos"
          accessibilityRole="switch"
          accessibilityState={{ checked: mostrarCapas }}
          accessibilityHint={mostrarCapas ? "Toque para ocultar as capas" : "Toque para exibir as capas"}
        />
      </View>

      {/* 🔍 Busca + Limpar seleção */}
      <View style={styles.searchRow}>
        <SearchBar
          value={buscaInput}
          onChangeText={setBuscaInput}
          onClear={() => setBuscaInput("")}
        />

        {selecionados.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={limparSelecao}
            accessible={true}
            accessibilityLabel={`Limpar seleção de ${selecionados.length} ${selecionados.length === 1 ? "jogo" : "jogos"}`}
            accessibilityRole="button"
            accessibilityHint="Remove todos os jogos da seleção atual"
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* 🔄 Loading Skeleton */}
      {loadingFirebase && retryCount === 0 && (
        <View style={{ flex: 1 }}>
          <SkeletonLoader count={8} mostrarCapas={mostrarCapas} />
        </View>
      )}

      {/* ⚠️ Erro com retry */}
      {errorFirebase && !loadingFirebase && (
        <ErrorState message={errorFirebase} onRetry={handleRetryManual} />
      )}

      {/* 🔄 Loading durante retry */}
      {loadingFirebase && retryCount > 0 && (
        <View style={styles.retryingContainer}>
          <Ionicons name="sync-outline" size={32} color="#1e90ff" />
          <Text style={styles.retryingText}>
            Tentando reconectar... (tentativa {retryCount}/3)
          </Text>
        </View>
      )}

      {/* 📋 Lista de jogos */}
      {!loadingFirebase && !errorFirebase && filtrados.length > 0 && (
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
          accessible={false}
          accessibilityLabel={`Lista de ${filtrados.length} jogos`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1e90ff"]}
              tintColor="#1e90ff"
              title="Atualizando..."
              titleColor="#1e90ff"
            />
          }
        />
      )}

      {/* 🔍 Empty state - busca sem resultados */}
      {!loadingFirebase && !errorFirebase && filtrados.length === 0 && busca.length > 0 && (
        <EmptyState searchTerm={busca} onClearSearch={() => setBuscaInput("")} />
      )}

      <FloatingPanel
        totalGB={totalGB}
        quantidade={selecionados.length}
        ultrapassou={ultrapassou}
        onPenDriveChange={setPenDriveInfo}
        selecionados={roms
          .filter((j) => selecionadosSet.has(j.nome))
          .map((j) => ({ nome: j.nomeFormatado, tamanho_gb: j.tamanho_gb, bandeira: j.bandeira }))}
      />

      <GameDetailModal jogo={jogoDetalhe} onClose={() => setJogoDetalhe(null)} />

      <LoginModal
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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

  // 🔄 Loading durante retry
  retryingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  retryingText: {
    color: "#1e90ff",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
});