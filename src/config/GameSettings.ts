/**
 * Game Settings for Crypto Mahjong
 * Centralized configuration for all tunable game parameters
 */

import type { LevelConfig, TileDimensions } from "../types";
import { getCurrentTheme } from "./Themes";

// Helper to get current theme
const getTheme = () => getCurrentTheme();

export const GameSettings = {
  // Canvas configuration
  canvas: {
    width: 720,
    height: 1280,
  },

  // Get current theme (for dynamic access)
  get theme() {
    return getCurrentTheme();
  },

  // Tile dimensions and styling - Forma vertical estilo Mahjong clásico
  tile: {
    width: 120,
    height: 160,
    depth: 16, // Profundidad 3D sutil
    padding: 2,
    cornerRadius: 11,
    shadowOffset: 16,
    // Colores de la ficha - usa tema si existe, sino defaults
    get colors() {
      const theme = getTheme();
      return (
        theme.tile || {
          face: 0xffffff,
          side: 0xd4b896,
          bottom: 0xc4a878,
          border: 0xb49868,
          highlight: 0xffffff,
          blocked: 0x888888,
          blockedOverlay: 0x000000,
          blockedAlpha: 0.45,
          sideLight: 0xe0c8a8,
          bottomLight: 0xd0b898,
        }
      );
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
    layerOffsetX: 0, // Sin offset X (solo 3D vertical)
    layerOffsetY: 11, // Desplazamiento Y por capa (efecto 3D hacia abajo)
  },

  // Hand configuration - usa colores del tema
  hand: {
    maxSlots: 5,
    slotWidth: 108,
    slotHeight: 145,
    slotPadding: 8,
    bottomMargin: 130,
    get backgroundColor() {
      return getTheme().hand.background;
    },
    get slotColor() {
      return getTheme().hand.slot;
    },
    get slotBorderColor() {
      return getTheme().hand.slotBorder;
    },
  },

  // Game rules
  rules: {
    matchCount: 3, // Fichas necesarias para hacer match
    scorePerMatch: 1000,
    bonusPerLevel: 500,
    animationSpeed: 150, // ms para animaciones (muy rápido)
  },

  // Level progression - generates config based on level
  // Máximo 4x4 grid, aumentan capas y tipos de forma infinita
  // Las columnas siempre están llenas uniformemente
  getLevelConfig: (level: number): LevelConfig => {
    const ROWS = 4;
    const COLS = 4;
    const MAX_TILE_TYPES = 12; // Máximo de tipos de fichas disponibles

    // Fórmula progresiva:
    // - Capas: empieza en 2, aumenta cada nivel (sin límite)
    // - Tipos: empieza en 4, aumenta gradualmente hasta 12
    const layers = Math.min(2 + Math.floor(level / 2), 2 + level); // 2, 2, 3, 3, 4, 4, 5...
    const tileTypes = Math.min(MAX_TILE_TYPES, 4 + Math.floor(level / 2)); // 4, 4, 5, 5, 6, 6...

    // Niveles 1-5: más fáciles con menos capas
    // Niveles 6+: dificultad real que escala infinitamente
    let finalLayers: number;
    let finalTypes: number;

    if (level <= 2) {
      // Tutorial: 2 capas, 4 tipos
      finalLayers = 2;
      finalTypes = 4;
    } else if (level <= 4) {
      // Fácil: 3 capas, 5 tipos
      finalLayers = 3;
      finalTypes = 5;
    } else if (level <= 6) {
      // Transición: 4 capas, 6-7 tipos
      finalLayers = 4;
      finalTypes = 5 + Math.floor((level - 4) / 2);
    } else if (level <= 10) {
      // Intermedio: 5-6 capas, 7-9 tipos
      finalLayers = 4 + Math.floor((level - 6) / 2);
      finalTypes = 7 + Math.floor((level - 6) / 2);
    } else {
      // Infinito: capas crecen sin límite, tipos hasta 12
      finalLayers = 6 + Math.floor((level - 10) / 2);
      finalTypes = Math.min(MAX_TILE_TYPES, 9 + Math.floor((level - 10) / 3));
    }

    return {
      level,
      rows: ROWS,
      cols: COLS,
      layers: finalLayers,
      tileTypes: finalTypes,
      tilesPerType: 3,
      coverageRate: 1.0, // Siempre columnas llenas
    };
  },

  // UI configuration - usa colores del tema
  ui: {
    headerHeight: 0, // Sin header
    fontSize: {
      title: 28,
      score: 22,
      level: 20,
      button: 18,
    },
    get colors() {
      const theme = getTheme();
      return {
        background: theme.background.mainHex,
        primary: theme.badge.main,
        secondary: 0x66cdaa, // Aquamarine
        accent: 0xffd700, // Dorado
        text: 0xfff8dc, // Crema
        textSecondary: 0xaaaaaa,
        // Badges - desde el tema
        badge: theme.badge.main,
        badgeBorder: theme.badge.border,
      };
    },
  },
};

export default GameSettings;
