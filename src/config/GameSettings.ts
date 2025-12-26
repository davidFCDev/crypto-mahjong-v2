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
    width: 120,
    height: 160,
    depth: 16, // Profundidad 3D sutil
    padding: 2,
    cornerRadius: 11,
    shadowOffset: 16,
    // Colores base de la ficha estilo Mahjong
    colors: {
      face: 0xfefcf8, // Blanco marfil
      side: 0xd4c4a8, // Beige lateral
      bottom: 0x2d5a3d, // Verde base
      border: 0x1e4a2d, // Borde verde oscuro
      highlight: 0xffffff, // Brillo
      blocked: 0x666666,
      blockedOverlay: 0x000000,
      blockedAlpha: 0.45,
      // Colores claros para fichas accesibles
      sideLight: 0xe8dcc8, // Beige claro lateral
      bottomLight: 0x3d7a4d, // Verde claro base
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

  // Hand configuration - Acumulador estilo minimalista
  hand: {
    maxSlots: 5,
    slotWidth: 108,
    slotHeight: 145,
    slotPadding: 8,
    bottomMargin: 130,
    backgroundColor: 0xd83843, // Rojo
    slotColor: 0xe85a64, // Rojo slot más claro
    slotBorderColor: 0xb82833, // Borde rojo oscuro
  },

  // Game rules
  rules: {
    matchCount: 3, // Fichas necesarias para hacer match
    scorePerMatch: 100,
    bonusPerLevel: 50,
    animationSpeed: 150, // ms para animaciones (muy rápido)
  },

  // Level progression - generates config based on level
  // Máximo 4x4 grid, aumentan capas, tipos y densidad para dificultad
  // A partir del nivel 3 la dificultad sube significativamente
  getLevelConfig: (level: number): LevelConfig => {
    const MAX_ROWS = 4;
    const MAX_COLS = 4;

    // Configuración: más tileTypes = menos tríos repetidos = más difícil
    // Más capas = fichas más dispersas verticalmente = más difícil
    const configs = [
      // Niveles introductorios (1-2): pocos tipos, muchos tríos repetidos
      { rows: 4, cols: 4, layers: 3, tileTypes: 3, coverageRate: 0.55 }, // Nivel 1: Muy fácil
      { rows: 4, cols: 4, layers: 3, tileTypes: 4, coverageRate: 0.6 }, // Nivel 2: Fácil

      // Niveles intermedios (3-5): dificultad creciente
      { rows: 4, cols: 4, layers: 4, tileTypes: 6, coverageRate: 0.7 }, // Nivel 3: Salto de dificultad
      { rows: 4, cols: 4, layers: 5, tileTypes: 7, coverageRate: 0.75 }, // Nivel 4
      { rows: 4, cols: 4, layers: 5, tileTypes: 8, coverageRate: 0.78 }, // Nivel 5

      // Niveles avanzados (6-8): alta dificultad
      { rows: 4, cols: 4, layers: 6, tileTypes: 9, coverageRate: 0.8 }, // Nivel 6
      { rows: 4, cols: 4, layers: 6, tileTypes: 10, coverageRate: 0.82 }, // Nivel 7
      { rows: 4, cols: 4, layers: 7, tileTypes: 11, coverageRate: 0.85 }, // Nivel 8

      // Niveles experto (9-10+): máxima dificultad
      { rows: 4, cols: 4, layers: 8, tileTypes: 12, coverageRate: 0.88 }, // Nivel 9
      { rows: 4, cols: 4, layers: 9, tileTypes: 12, coverageRate: 0.9 }, // Nivel 10+: Máxima dificultad
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
      coverageRate: config.coverageRate,
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
      // Badges - mismo color que el acumulador
      badge: 0xd83843, // Rojo (igual que hand.backgroundColor)
      badgeBorder: 0xb82833, // Borde rojo (igual que hand.slotBorderColor)
    },
  },
};

export default GameSettings;
