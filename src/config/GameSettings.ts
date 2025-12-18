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

  // Tile dimensions and styling - Forma vertical estilo Mahjong clásico
  tile: {
    width: 95,
    height: 128,
    depth: 18, // Profundidad 3D más pronunciada
    padding: 2,
    cornerRadius: 8,
    shadowOffset: 12,
    // Colores base de la ficha estilo Mahjong
    colors: {
      face: 0xfefcf8, // Blanco marfil
      side: 0xd4c4a8, // Beige lateral
      bottom: 0x8b7355, // Marrón base
      border: 0x6b5344, // Borde marrón oscuro
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
    maxWidth: 620, // No usar todo el ancho
    maxHeight: 850, // Alto disponible
    layerOffsetX: 4, // Pequeño offset X por capa (efecto 3D)
    layerOffsetY: 8, // Desplazamiento Y por capa (efecto 3D hacia arriba)
  },

  // Hand configuration - Acumulador estilo minimalista
  hand: {
    maxSlots: 5,
    slotWidth: 100,
    slotHeight: 134,
    slotPadding: 8,
    bottomMargin: 130,
    backgroundColor: 0x2d5a3d, // Verde oscuro
    slotColor: 0x3d7a4d, // Verde slot
    slotBorderColor: 0x5a9a6a, // Borde verde claro
  },

  // Game rules
  rules: {
    matchCount: 3, // Fichas necesarias para hacer match
    scorePerMatch: 100,
    bonusPerLevel: 50,
    animationSpeed: 150, // ms para animaciones (muy rápido)
  },

  // Level progression - generates config based on level
  // Máximo 5 filas y 5 columnas, aumentan capas y tipos para dificultad
  getLevelConfig: (level: number): LevelConfig => {
    const MAX_ROWS = 5;
    const MAX_COLS = 5;

    const configs = [
      { rows: 4, cols: 4, layers: 3, tileTypes: 4 }, // Nivel 1: Fácil con 3 capas
      { rows: 4, cols: 5, layers: 3, tileTypes: 5 }, // Nivel 2
      { rows: 5, cols: 5, layers: 3, tileTypes: 5 }, // Nivel 3: Tablero completo
      { rows: 5, cols: 5, layers: 4, tileTypes: 5 }, // Nivel 4: Cuarta capa
      { rows: 5, cols: 5, layers: 4, tileTypes: 6 }, // Nivel 5: Más variedad
      { rows: 5, cols: 5, layers: 5, tileTypes: 6 }, // Nivel 6: Quinta capa
      { rows: 5, cols: 5, layers: 5, tileTypes: 7 }, // Nivel 7: Más variedad
      { rows: 5, cols: 5, layers: 6, tileTypes: 7 }, // Nivel 8: Sexta capa
      { rows: 5, cols: 5, layers: 6, tileTypes: 8 }, // Nivel 9: Máxima variedad
      { rows: 5, cols: 5, layers: 7, tileTypes: 8 }, // Nivel 10+: Máxima dificultad
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

  // UI configuration - Minimalista
  ui: {
    headerHeight: 0, // Sin header
    fontSize: {
      title: 28,
      score: 22,
      level: 20,
      button: 18,
    },
    colors: {
      background: 0xd4c4a8, // Beige cálido
      primary: 0x2d5a27, // Verde bosque
      secondary: 0x3d7a3d, // Verde claro
      accent: 0xffd700, // Dorado
      text: 0xfff8dc, // Crema
      textSecondary: 0xaaaaaa,
      badge: 0x6b5b95, // Morado suave
      badgeBorder: 0x4a3d6b, // Borde morado oscuro
    },
  },
};

export default GameSettings;
