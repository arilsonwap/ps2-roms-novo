import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface SkeletonLoaderProps {
  count?: number;
  mostrarCapas?: boolean;
}

export default function SkeletonLoader({ count = 8, mostrarCapas = true }: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View key={index} style={[styles.item, { opacity }]}>
          {mostrarCapas && <View style={styles.capa} />}
          <View style={styles.infoBox}>
            <View style={styles.nomePlaceholder} />
            <View style={styles.detalhesRow}>
              <View style={styles.tamanhoPlaceholder} />
              <View style={styles.iconPlaceholder} />
            </View>
          </View>
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    height: 100,
  },
  capa: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#333",
  },
  infoBox: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  nomePlaceholder: {
    height: 16,
    width: "80%",
    backgroundColor: "#333",
    borderRadius: 4,
    marginBottom: 8,
  },
  detalhesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tamanhoPlaceholder: {
    height: 14,
    width: 60,
    backgroundColor: "#333",
    borderRadius: 4,
  },
  iconPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
  },
});