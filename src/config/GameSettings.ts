/**
 * Game Settings for Crypto Mahjong
 * Centralized configuration for all tunable game parameters
 */

import type { LevelConfig, TileDimensions } from '../types'

export const GameSettings = {
  // Canvas configuration
  canvas: {
    width: 720,
    height: 1280,
  },

  // Tile dimensions and styling
  tile: {
    width: 70,
    height: 90,
    depth: 12,        // Profundidad 3D
    padding: 4,
    cornerRadius: 8,
    shadowOffset: 4,
    // Colores base de la ficha
    colors: {
      face: 0xffffff,
      side: 0xcccccc,
      bottom: 0x999999,
      border: 0x333333,
      blocked: 0x666666,
      blockedOverlay: 0x000000,
      blockedAlpha: 0.4,
    },
  } as TileDimensions & { cornerRadius: number; shadowOffset: number; colors: Record<string, number> },

  // Board configuration
  board: {
    offsetY: 120,     // Offset desde arriba para dejar espacio al UI
    maxWidth: 680,    // Ancho máximo del tablero
    maxHeight: 800,   // Alto máximo del tablero
  },

  // Hand configuration
  hand: {
    maxSlots: 5,
    slotWidth: 80,
    slotHeight: 100,
    slotPadding: 10,
    bottomMargin: 80,
    backgroundColor: 0x2a2a2a,
    slotColor: 0x3a3a3a,
    slotBorderColor: 0x555555,
  },

  // Game rules
  rules: {
    matchCount: 3,    // Fichas necesarias para hacer match
    scorePerMatch: 100,
    bonusPerLevel: 50,
    animationSpeed: 300,  // ms para animaciones
  },

  // Level progression - generates config based on level
  getLevelConfig: (level: number): LevelConfig => {
    // Incremento progresivo de dificultad
    const baseRows = 4
    const baseCols = 5
    const baseLayers = 2
    const baseTileTypes = 4

    // Cada 3 niveles aumenta la complejidad
    const difficultyTier = Math.floor((level - 1) / 3)
    
    const rows = Math.min(baseRows + difficultyTier, 8)
    const cols = Math.min(baseCols + difficultyTier, 8)
    const layers = Math.min(baseLayers + Math.floor(difficultyTier / 2), 5)
    const tileTypes = Math.min(baseTileTypes + difficultyTier, 12)

    // Calcular cantidad de fichas (debe ser múltiplo de 3)
    const totalPositions = rows * cols * layers
    const tilesPerType = 3  // Siempre grupos de 3
    const totalTileTypes = Math.min(tileTypes, Math.floor(totalPositions / tilesPerType))

    return {
      level,
      rows,
      cols,
      layers,
      tileTypes: totalTileTypes,
      tilesPerType,
    }
  },

  // UI configuration
  ui: {
    headerHeight: 100,
    fontSize: {
      title: 32,
      score: 24,
      level: 20,
      button: 18,
    },
    colors: {
      background: 0x1a1a2e,
      primary: 0x16213e,
      secondary: 0x0f3460,
      accent: 0xe94560,
      text: 0xffffff,
      textSecondary: 0xaaaaaa,
    },
  },
}

export default GameSettings
