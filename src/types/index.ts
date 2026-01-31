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
// Colores muy distintivos y contrastantes
export const TILE_COLORS: Record<
  TileType,
  {
    main: number;
    accent: number;
    symbol: string;
    letter: string;
    imageUrl?: string;
  }
> = {
  [TileType.BITCOIN]: {
    main: 0xf7931a, // Naranja Bitcoin
    accent: 0x4d2f00,
    symbol: "₿",
    letter: "B",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/1.png",
  },
  [TileType.ETHEREUM]: {
    main: 0x3c3cff, // Azul eléctrico
    accent: 0x0a0a4d,
    symbol: "Ξ",
    letter: "E",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/2.png",
  },
  [TileType.DOGE]: {
    main: 0xdfc850, // Amarillo dorado
    accent: 0x4d4000,
    symbol: "Ð",
    letter: "D",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/3.png",
  },
  [TileType.PEPE]: {
    main: 0x00c853, // Verde brillante
    accent: 0x003d1a,
    symbol: "🐸",
    letter: "P",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/4.png",
  },
  [TileType.SHIBA]: {
    main: 0xff6b00, // Naranja fuerte
    accent: 0x4d2000,
    symbol: "🐕",
    letter: "S",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/5.png",
  },
  [TileType.SOLANA]: {
    main: 0xaa00ff, // Morado brillante
    accent: 0x2a0050,
    symbol: "◎",
    letter: "O",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/6.png",
  },
  [TileType.CARDANO]: {
    main: 0x0066ff, // Azul puro
    accent: 0x001a4d,
    symbol: "₳",
    letter: "A",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/7.png",
  },
  [TileType.POLKADOT]: {
    main: 0xff0080, // Rosa fuerte/Magenta
    accent: 0x4d0026,
    symbol: "●",
    letter: "K",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/8.png",
  },
  [TileType.AVALANCHE]: {
    main: 0xe60000, // Rojo puro
    accent: 0x4d0000,
    symbol: "▲",
    letter: "X",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/9.png",
  },
  [TileType.CHAINLINK]: {
    main: 0x00bcd4, // Cyan/Turquesa
    accent: 0x003d42,
    symbol: "⬡",
    letter: "L",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/10.png",
  },
  [TileType.POLYGON]: {
    main: 0x7b1fa2, // Púrpura oscuro
    accent: 0x2a0a38,
    symbol: "⬢",
    letter: "M",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/11.png",
  },
  [TileType.LITECOIN]: {
    main: 0x607d8b, // Gris azulado
    accent: 0x1a2327,
    symbol: "Ł",
    letter: "C",
    imageUrl:
      "https://raw.githubusercontent.com/davidFCDev/crypto-mahjong-v2/main-astrocade/public/assets/tiles/12.png",
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
  coverageRate: number; // Porcentaje de cobertura de capas superiores (0.5 - 0.95)
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
