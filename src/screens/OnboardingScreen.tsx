import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const STORAGE_KEY = "@onboarding_completo";

interface OnboardingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingItem[] = [
  /* … mesmos 6 objetos … */
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  /* ---------- Handlers ---------- */
  const finalizarOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
    } finally {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      try {
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      } catch {}
    } else {
      finalizarOnboarding();
    }
  }, [currentIndex, finalizarOnboarding]);

  const handleSkip = useCallback(finalizarOnboarding, [finalizarOnboarding]);

  /* -------- Viewability & Layout -------- */
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length) setCurrentIndex(viewableItems[0].index ?? 0);
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    []
  );

  /* ---------- Render ---------- */
  const renderItem = useCallback(
    ({ item }: { item: OnboardingItem }) => (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={80} color="#fff" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    ),
    []
  );

  /* ---------- Pagination Dots ---------- */
  const dots = useMemo(
    () =>
      slides.map((_, i) => {
        const input = [(i - 1) * width, i * width, (i + 1) * width];
        const widthAnim = scrollX.interpolate({
          inputRange: input,
          outputRange: [10, 30, 10],
          extrapolate: "clamp",
        });
        const colorAnim = scrollX.interpolate({
          inputRange: input,
          outputRange: ["#555", "#1e90ff", "#555"],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            key={i}
            style={[styles.dot, { width: widthAnim, backgroundColor: colorAnim }]}
          />
        );
      }),
    [scrollX]
  );

  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.flex1}>
      <SafeAreaView style={styles.flex1}>
        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Pular onboarding"
        >
          <RNText style={styles.skipText}>Pular</RNText>
        </TouchableOpacity>

        {/* Slides */}
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig.current}
          getItemLayout={getItemLayout}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.pagination}>{dots}</View>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Avançar slide"
          >
            <RNText style={styles.nextText}>
              {currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
            </RNText>
            <Ionicons
              name={currentIndex === slides.length - 1 ? "checkmark" : "arrow-forward"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  skipButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  skipText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 20 },
  description: { fontSize: 16, color: "#ccc", textAlign: "center", lineHeight: 24 },
  footer: { paddingHorizontal: 40, paddingBottom: 50 },
  pagination: { flexDirection: "row", justifyContent: "center", marginBottom: 30 },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 5 },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});