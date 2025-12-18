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

// Configuración de colores y símbolos para cada tipo de ficha (temática crypto)
export const TILE_COLORS: Record<
  TileType,
  { main: number; accent: number; symbol: string; letter: string }
> = {
  [TileType.BITCOIN]: {
    main: 0xf7931a,
    accent: 0x4d2f00,
    symbol: "₿",
    letter: "B",
  },
  [TileType.ETHEREUM]: {
    main: 0x627eea,
    accent: 0x1a1a4d,
    symbol: "Ξ",
    letter: "E",
  },
  [TileType.DOGE]: {
    main: 0xc3a634,
    accent: 0x4d4000,
    symbol: "Ð",
    letter: "D",
  },
  [TileType.PEPE]: {
    main: 0x3cb043,
    accent: 0x0d3010,
    symbol: "🐸",
    letter: "P",
  },
  [TileType.SHIBA]: {
    main: 0xffa000,
    accent: 0x4d3000,
    symbol: "🐕",
    letter: "S",
  },
  [TileType.SOLANA]: {
    main: 0x9945ff,
    accent: 0x2a0050,
    symbol: "◎",
    letter: "O",
  },
  [TileType.CARDANO]: {
    main: 0x0033ad,
    accent: 0x000d33,
    symbol: "₳",
    letter: "A",
  },
  [TileType.POLKADOT]: {
    main: 0xe6007a,
    accent: 0x400022,
    symbol: "●",
    letter: "K",
  },
  [TileType.AVALANCHE]: {
    main: 0xe84142,
    accent: 0x400d0d,
    symbol: "▲",
    letter: "X",
  },
  [TileType.CHAINLINK]: {
    main: 0x2a5ada,
    accent: 0x0a1a40,
    symbol: "⬡",
    letter: "L",
  },
  [TileType.POLYGON]: {
    main: 0x8247e5,
    accent: 0x200d40,
    symbol: "⬢",
    letter: "M",
  },
  [TileType.LITECOIN]: {
    main: 0x345d9d,
    accent: 0x0d1a33,
    symbol: "Ł",
    letter: "C",
  },
};

// Posición de una ficha en el tablero
export interface TilePosition {
  x: number; // Columna
  y: number; // Fila
  z: number; // Capa (0 = base, mayor = más arriba)
}

// Estado de una ficha
export interface TileState {
  id: string;
  type: TileType;
  position: TilePosition;
  isAccessible: boolean;
  isSelected: boolean;
  isInHand: boolean;
  isMatched: boolean;
}

// Slot de la mano
export interface HandSlot {
  index: number;
  tile: TileState | null;
  isOccupied: boolean;
}

// Configuración de un nivel
export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  layers: number;
  tileTypes: number; // Cantidad de tipos diferentes de fichas
  tilesPerType: number; // Siempre debe ser múltiplo de 3
}

// Estado del juego
export interface GameState {
  currentLevel: number;
  score: number;
  tiles: TileState[];
  hand: HandSlot[];
  isPlaying: boolean;
  isGameOver: boolean;
  isWin: boolean;
}

// Dimensiones de las fichas
export interface TileDimensions {
  width: number;
  height: number;
  depth: number; // Para el efecto 3D
  padding: number;
}

// Evento de ficha clickeada
export interface TileClickEvent {
  tile: TileState;
  screenX: number;
  screenY: number;
}

// Resultado de un match
export interface MatchResult {
  matched: boolean;
  tiles: TileState[];
  scoreGained: number;
}
