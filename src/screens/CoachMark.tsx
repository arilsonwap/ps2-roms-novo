import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  target: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tooltipPosition: "top" | "bottom" | "left" | "right";
}

interface CoachMarkProps {
  visible: boolean;
  onComplete: () => void;
}

export default function CoachMark({ visible, onComplete }: CoachMarkProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // 📍 Defina as posições dos elementos que você quer destacar
  const steps: TutorialStep[] = [
    {
      id: 1,
      title: "Buscar Jogos 🔍",
      description: "Use a barra de busca para encontrar jogos rapidamente pelo nome!",
      target: { x: 10, y: 180, width: width - 60, height: 45 },
      tooltipPosition: "bottom",
    },
    {
      id: 2,
      title: "Mostrar Capas 🎨",
      description: "Ative/desative a visualização das capas dos jogos aqui!",
      target: { x: width - 80, y: 130, width: 60, height: 30 },
      tooltipPosition: "left",
    },
    {
      id: 3,
      title: "Selecionar Jogos ✅",
      description: "Toque nos jogos para selecioná-los. Jogos selecionados ficam destacados em azul!",
      target: { x: 10, y: 240, width: width - 20, height: 100 },
      tooltipPosition: "bottom",
    },
    {
      id: 4,
      title: "Ver Detalhes 👁️",
      description: "Toque no ícone do olho para ver a descrição completa e capa do jogo!",
      target: { x: width - 60, y: 300, width: 40, height: 40 },
      tooltipPosition: "left",
    },
    {
      id: 5,
      title: "Limpar Seleção 🗑️",
      description: "Use este botão para desmarcar todos os jogos selecionados de uma vez!",
      target: { x: width - 60, y: 180, width: 50, height: 45 },
      tooltipPosition: "left",
    },
    {
      id: 6,
      title: "Painel de Controle 💾",
      description: "Aqui você vê o total de GB selecionado, configura o tamanho do pendrive e exporta sua lista!",
      target: { x: 20, y: height - 180, width: width - 40, height: 160 },
      tooltipPosition: "top",
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finalizarTutorial();
    }
  };

  const handleSkip = async () => {
    finalizarTutorial();
  };

  const finalizarTutorial = async () => {
    try {
      await AsyncStorage.setItem("@tutorial_completo", "true");
      onComplete();
    } catch (error) {
      console.error("Erro ao salvar tutorial:", error);
      onComplete();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Overlay escuro com recorte */}
        <View style={styles.overlay}>
          {/* Top */}
          <View style={[styles.overlayPart, { height: step.target.y }]} />

          {/* Middle row */}
          <View style={{ flexDirection: "row", height: step.target.height }}>
            {/* Left */}
            <View style={[styles.overlayPart, { width: step.target.x }]} />

            {/* Spotlight (área transparente) */}
            <View
              style={{
                width: step.target.width,
                height: step.target.height,
                borderWidth: 3,
                borderColor: "#1e90ff",
                borderRadius: 12,
                backgroundColor: "transparent",
              }}
            />

            {/* Right */}
            <View style={[styles.overlayPart, { flex: 1 }]} />
          </View>

          {/* Bottom */}
          <View style={[styles.overlayPart, { flex: 1 }]} />
        </View>

        {/* Tooltip (balão explicativo) */}
        <View
          style={[
            styles.tooltip,
            getTooltipPosition(step.target, step.tooltipPosition),
          ]}
        >
          {/* Seta do balão */}
          <View style={[styles.arrow, getArrowStyle(step.tooltipPosition)]} />

          <View style={styles.tooltipContent}>
            <Text style={styles.tooltipTitle}>{step.title}</Text>
            <Text style={styles.tooltipDescription}>{step.description}</Text>

            <View style={styles.tooltipFooter}>
              <View style={styles.pagination}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentStep && styles.dotActive,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>Pular</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                  <Text style={styles.nextText}>
                    {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
                  </Text>
                  <Ionicons
                    name={currentStep === steps.length - 1 ? "checkmark" : "arrow-forward"}
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Calcula posição do tooltip baseado no target
function getTooltipPosition(
  target: TutorialStep["target"],
  position: TutorialStep["tooltipPosition"]
) {
  const padding = 20;

  switch (position) {
    case "top":
      return {
        top: target.y - 200,
        left: 20,
        right: 20,
      };
    case "bottom":
      return {
        top: target.y + target.height + 20,
        left: 20,
        right: 20,
      };
    case "left":
      return {
        top: target.y,
        right: width - target.x + padding,
        maxWidth: 250,
      };
    case "right":
      return {
        top: target.y,
        left: target.x + target.width + padding,
        maxWidth: 250,
      };
  }
}

// Estilo da seta do tooltip
function getArrowStyle(position: TutorialStep["tooltipPosition"]) {
  const arrowSize = 12;

  switch (position) {
    case "top":
      return {
        bottom: -arrowSize,
        left: "50%",
        marginLeft: -arrowSize,
        borderTopColor: "#1c1c1c",
        borderTopWidth: arrowSize,
        borderLeftWidth: arrowSize,
        borderRightWidth: arrowSize,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
      };
    case "bottom":
      return {
        top: -arrowSize,
        left: "50%",
        marginLeft: -arrowSize,
        borderBottomColor: "#1c1c1c",
        borderBottomWidth: arrowSize,
        borderLeftWidth: arrowSize,
        borderRightWidth: arrowSize,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
      };
    case "left":
      return {
        right: -arrowSize,
        top: 20,
        borderLeftColor: "#1c1c1c",
        borderLeftWidth: arrowSize,
        borderTopWidth: arrowSize,
        borderBottomWidth: arrowSize,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
      };
    case "right":
      return {
        left: -arrowSize,
        top: 20,
        borderRightColor: "#1c1c1c",
        borderRightWidth: arrowSize,
        borderTopWidth: arrowSize,
        borderBottomWidth: arrowSize,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayPart: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
  },
  tooltipContent: {
    gap: 12,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  tooltipDescription: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  tooltipFooter: {
    gap: 12,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
  },
  dotActive: {
    backgroundColor: "#1e90ff",
    width: 24,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: "#999",
    fontSize: 14,
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    gap: 8,
  },
  nextText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
