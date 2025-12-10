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

  // Tile dimensions and styling - FICHAS GRANDES
  tile: {
    width: 110,
    height: 130,
    depth: 6, // Profundidad 3D sutil
    padding: 4,
    cornerRadius: 10,
    shadowOffset: 3,
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

  // Board configuration - Maximizar uso del canvas
  board: {
    offsetY: 75, // Offset desde arriba para dejar espacio al UI
    maxWidth: 710, // Usar casi todo el ancho
    maxHeight: 950, // Usar más altura disponible
  },

  // Hand configuration - Estilo Cartoon
  hand: {
    maxSlots: 5,
    slotWidth: 115,
    slotHeight: 135,
    slotPadding: 6,
    bottomMargin: 100,
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
    // Con fichas de 110x130 y padding 4, cada ficha = 114x134px
    // Canvas 720px ancho -> ~6 columnas máximo
    const configs = [
      { rows: 4, cols: 5, layers: 2, tileTypes: 4 }, // Nivel 1: 2 capas
      { rows: 4, cols: 6, layers: 2, tileTypes: 5 }, // Nivel 2
      { rows: 5, cols: 6, layers: 2, tileTypes: 6 }, // Nivel 3
      { rows: 5, cols: 6, layers: 3, tileTypes: 6 }, // Nivel 4
      { rows: 6, cols: 6, layers: 3, tileTypes: 7 }, // Nivel 5
      { rows: 6, cols: 6, layers: 3, tileTypes: 8 }, // Nivel 6
      { rows: 6, cols: 6, layers: 3, tileTypes: 9 }, // Nivel 7
      { rows: 6, cols: 6, layers: 4, tileTypes: 10 }, // Nivel 8+
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
