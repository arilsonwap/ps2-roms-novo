import React, { useEffect } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// Telas
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import AddGameScreen from "./src/screens/AddGameScreen";

// Previne o splash de sumir automaticamente
SplashScreen.preventAutoHideAsync();

// TIPAGEM do Stack Navigator (TypeScript)
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  AddGame: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// HEADER GRADIENT otimizado (fora do componente para evitar re-renderizações)
const HeaderGradient = ({ colors, reversed = false }: { colors: [string, string]; reversed?: boolean }) => (
  <LinearGradient
    colors={reversed ? [colors[1], colors[0]] : colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ flex: 1 }}
  />
);

// TEMA CUSTOMIZADO PS2-style
const PS2Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#004e92",
    background: "#000428",
    card: "#001a33",
  },
};

export default function App() {
  console.log("🔥 App carregou com sucesso!");

  // SIMPLIFICADO: Expo já carrega fonts de ícones automaticamente
  // Só use useFonts() se precisar de fonts personalizadas
  const [fontsLoaded] = useFonts({
    // Exemplo: 'PS2': require('./assets/fonts/PlayStation2.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer theme={PS2Theme}>
      <Stack.Navigator initialRouteName="Home">
        {/* TELA PRINCIPAL */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "🎮 JOGOS PS2",
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
            headerBackground: () => (
              <HeaderGradient colors={["#000428", "#004e92"]} />
            ),
          }}
        />

        {/* LOGIN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* ADICIONAR JOGO */}
        <Stack.Screen
          name="AddGame"
          component={AddGameScreen}
          options={{
            title: "➕ Adicionar Jogo",
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
            headerBackground: () => (
              <HeaderGradient colors={["#004e92", "#000428"]} reversed />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}