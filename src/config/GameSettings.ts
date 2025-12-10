/**
 * Game Settings for Crypto Mahjong
 * Centralized configuration for all tunable game parameters
 */

import type { LevelConfig, TileDimensions } from "../types";

export const GameSettings = {
  // Canvas configuration
  canvas: {
    width: 720,
    height: 1280,
  },

  // Tile dimensions and styling
  tile: {
    width: 70,
    height: 80,
    depth: 8, // Profundidad 3D para efecto de capas
    padding: 2,
    cornerRadius: 8,
    shadowOffset: 4,
    // Colores base de la ficha - Estilo elegante
    colors: {
      face: 0xfaf6f0, // Marfil suave
      side: 0xc9b896, // Beige cálido
      bottom: 0xa89070, // Marrón suave
      border: 0x8b7355, // Borde marrón dorado
      highlight: 0xffffff, // Brillo
      blocked: 0x666666,
      blockedOverlay: 0x000000,
      blockedAlpha: 0.45,
    },
  } as TileDimensions & {
    cornerRadius: number;
    shadowOffset: number;
    colors: Record<string, number>;
  },

  // Board configuration
  board: {
    offsetY: 80, // Offset desde arriba para dejar espacio al UI
    maxWidth: 650, // No usar todo el ancho
    maxHeight: 850, // Alto disponible
    layerOffsetX: 6, // Desplazamiento X por capa (efecto 3D)
    layerOffsetY: 6, // Desplazamiento Y por capa
  },

  // Hand configuration - Estilo Cartoon
  hand: {
    maxSlots: 7,
    slotWidth: 75,
    slotHeight: 85,
    slotPadding: 4,
    bottomMargin: 95,
    backgroundColor: 0x4a3728, // Marrón madera
    slotColor: 0x6b5344, // Slot madera clara
    slotBorderColor: 0x8b7355, // Borde dorado
  },

  // Game rules
  rules: {
    matchCount: 3, // Fichas necesarias para hacer match
    scorePerMatch: 100,
    bonusPerLevel: 50,
    animationSpeed: 250, // ms para animaciones (más rápido)
  },

  // Level progression - generates config based on level
  getLevelConfig: (level: number): LevelConfig => {
    // Con fichas de 70x80 caben más en pantalla
    // Sistema de capas estilo Mahjong clásico
    const configs = [
      { rows: 6, cols: 8, layers: 3, tileTypes: 6 }, // Nivel 1
      { rows: 7, cols: 8, layers: 3, tileTypes: 7 }, // Nivel 2
      { rows: 7, cols: 9, layers: 3, tileTypes: 8 }, // Nivel 3
      { rows: 8, cols: 9, layers: 4, tileTypes: 9 }, // Nivel 4
      { rows: 8, cols: 10, layers: 4, tileTypes: 10 }, // Nivel 5
      { rows: 8, cols: 10, layers: 4, tileTypes: 11 }, // Nivel 6
      { rows: 9, cols: 10, layers: 5, tileTypes: 12 }, // Nivel 7
      { rows: 9, cols: 10, layers: 5, tileTypes: 12 }, // Nivel 8+
    ];

    const configIndex = Math.min(level - 1, configs.length - 1);
    const config = configs[configIndex];

    return {
      level,
      rows: config.rows,
      cols: config.cols,
      layers: config.layers,
      tileTypes: config.tileTypes,
      tilesPerType: 3,
    };
  },

  // UI configuration - Estilo Cartoon Mahjong
  ui: {
    headerHeight: 70,
    fontSize: {
      title: 28,
      score: 26,
      level: 26,
      button: 18,
    },
    colors: {
      background: 0x1a472a, // Verde bambú oscuro
      primary: 0x2d5a27, // Verde bosque
      secondary: 0x3d7a3d, // Verde claro
      accent: 0xffd700, // Dorado
      text: 0xfff8dc, // Crema
      textSecondary: 0xaaaaaa,
    },
  },
};

export default GameSettings;
