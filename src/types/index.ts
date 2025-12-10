/**
 * Types and interfaces for Crypto Mahjong game
 */

// Tipos de fichas disponibles (cryptomemes)
export enum TileType {
  BITCOIN = 0,
  ETHEREUM = 1,
  DOGE = 2,
  PEPE = 3,
  SHIBA = 4,
  SOLANA = 5,
  CARDANO = 6,
  POLKADOT = 7,
  AVALANCHE = 8,
  CHAINLINK = 9,
  POLYGON = 10,
  LITECOIN = 11,
}

// Configuración de colores para cada tipo de ficha
export const TILE_COLORS: Record<TileType, { main: number; accent: number; symbol: string }> = {
  [TileType.BITCOIN]: { main: 0xf7931a, accent: 0xffa726, symbol: '₿' },
  [TileType.ETHEREUM]: { main: 0x627eea, accent: 0x7c4dff, symbol: 'Ξ' },
  [TileType.DOGE]: { main: 0xc3a634, accent: 0xfdd835, symbol: 'Ð' },
  [TileType.PEPE]: { main: 0x3cb043, accent: 0x66bb6a, symbol: '🐸' },
  [TileType.SHIBA]: { main: 0xffa000, accent: 0xffca28, symbol: '🐕' },
  [TileType.SOLANA]: { main: 0x9945ff, accent: 0x14f195, symbol: '◎' },
  [TileType.CARDANO]: { main: 0x0033ad, accent: 0x2196f3, symbol: '₳' },
  [TileType.POLKADOT]: { main: 0xe6007a, accent: 0xf06292, symbol: '●' },
  [TileType.AVALANCHE]: { main: 0xe84142, accent: 0xef5350, symbol: '▲' },
  [TileType.CHAINLINK]: { main: 0x2a5ada, accent: 0x42a5f5, symbol: '⬡' },
  [TileType.POLYGON]: { main: 0x8247e5, accent: 0xab47bc, symbol: '⬢' },
  [TileType.LITECOIN]: { main: 0xbfbbbb, accent: 0xe0e0e0, symbol: 'Ł' },
}

// Posición de una ficha en el tablero
export interface TilePosition {
  x: number      // Columna
  y: number      // Fila
  z: number      // Capa (0 = base, mayor = más arriba)
}

// Estado de una ficha
export interface TileState {
  id: string
  type: TileType
  position: TilePosition
  isAccessible: boolean
  isSelected: boolean
  isInHand: boolean
  isMatched: boolean
}

// Slot de la mano
export interface HandSlot {
  index: number
  tile: TileState | null
  isOccupied: boolean
}

// Configuración de un nivel
export interface LevelConfig {
  level: number
  rows: number
  cols: number
  layers: number
  tileTypes: number  // Cantidad de tipos diferentes de fichas
  tilesPerType: number  // Siempre debe ser múltiplo de 3
}

// Estado del juego
export interface GameState {
  currentLevel: number
  score: number
  tiles: TileState[]
  hand: HandSlot[]
  isPlaying: boolean
  isGameOver: boolean
  isWin: boolean
}

// Dimensiones de las fichas
export interface TileDimensions {
  width: number
  height: number
  depth: number  // Para el efecto 3D
  padding: number
}

// Evento de ficha clickeada
export interface TileClickEvent {
  tile: TileState
  screenX: number
  screenY: number
}

// Resultado de un match
export interface MatchResult {
  matched: boolean
  tiles: TileState[]
  scoreGained: number
}
