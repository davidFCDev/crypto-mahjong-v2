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
    width: 125,
    height: 125,
    depth: 10, // Profundidad 3D para efecto de capas
    padding: 2,
    cornerRadius: 14,
    shadowOffset: 6,
    // Colores base de la ficha
    colors: {
      face: 0xfaf6f0, // Marfil suave
      side: 0x5a8f5a, // Verde lateral
      bottom: 0x3d6b3d, // Verde oscuro base
      border: 0x4a7a4a, // Borde verde
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
    layerOffsetX: 0, // Sin desplazamiento X - solo efecto 3D vertical
    layerOffsetY: 6, // Desplazamiento Y por capa (efecto 3D hacia abajo)
  },

  // Hand configuration - Acumulador estilo minimalista
  hand: {
    maxSlots: 5,
    slotWidth: 130,
    slotHeight: 130,
    slotPadding: 6,
    bottomMargin: 120,
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
  // El ancho (cols) se mantiene constante, aumentan filas y capas
  getLevelConfig: (level: number): LevelConfig => {
    const BASE_COLS = 5; // Ancho fijo del tablero
    
    const configs = [
      { rows: 4, cols: BASE_COLS, layers: 2, tileTypes: 5 },  // Nivel 1: Introducción con 2 capas
      { rows: 4, cols: BASE_COLS, layers: 3, tileTypes: 5 },  // Nivel 2: Tercera capa
      { rows: 5, cols: BASE_COLS, layers: 3, tileTypes: 6 },  // Nivel 3: Más filas
      { rows: 5, cols: BASE_COLS, layers: 4, tileTypes: 6 },  // Nivel 4: Cuarta capa
      { rows: 5, cols: BASE_COLS, layers: 4, tileTypes: 7 },  // Nivel 5: Más tipos
      { rows: 6, cols: BASE_COLS, layers: 4, tileTypes: 7 },  // Nivel 6: Más filas
      { rows: 6, cols: BASE_COLS, layers: 5, tileTypes: 8 },  // Nivel 7: Quinta capa
      { rows: 6, cols: BASE_COLS, layers: 5, tileTypes: 8 },  // Nivel 8: Todos los tipos
      { rows: 7, cols: BASE_COLS, layers: 5, tileTypes: 8 },  // Nivel 9: Más filas
      { rows: 7, cols: BASE_COLS, layers: 6, tileTypes: 8 },  // Nivel 10+: Máxima dificultad
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
      badge: 0xc94a4a, // Rojo para el badge
      badgeBorder: 0x8a2a2a, // Borde del badge
    },
  },
};

export default GameSettings;
