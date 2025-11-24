import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// Ícones usados
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  Entypo,
  Feather,
} from "@expo/vector-icons";

// Telas
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import AddGameScreen from "./src/screens/AddGameScreen"; // 👈 nova importação

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  console.log("🔥 App carregou com sucesso!");

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...Entypo.font,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator initialRouteName="Home">
        {/* --- TELA PRINCIPAL --- */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "🎮 JOGOS PS2",
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
            headerBackground: () => (
              <LinearGradient
                colors={["#000428", "#004e92"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            ),
          }}
        />

        {/* --- LOGIN --- */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* --- ADICIONAR JOGO --- */}
        <Stack.Screen
          name="AddGame"
          component={AddGameScreen}
          options={{
            title: "➕ Adicionar Jogo",
            headerTintColor: "#fff",
            headerTitleAlign: "center",
            headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
            headerBackground: () => (
              <LinearGradient
                colors={["#004e92", "#000428"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
