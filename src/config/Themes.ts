/**
 * Theme System for Crypto Mahjong
 * Define visual themes for UI elements
 */

export interface GameTheme {
  name: string;
  displayName: string;

  // Background colors
  background: {
    main: string; // Hex string for Phaser config
    mainHex: number; // Hex number for graphics
    pattern: {
      color1: number;
      color2: number;
    };
  };

  // Badge/UI element colors
  badge: {
    main: number;
    border: number;
    depth3D: number;
    textStroke: string;
  };

  // Hand/Accumulator colors
  hand: {
    background: number;
    slot: number;
    slotBorder: number;
  };

  // Modal colors
  modal: {
    main: number;
    border: number;
    titleColor: string;
    titleStroke: string;
    textColor: string;
    buttonTextColor: string;
  };

  // Power-up button colors
  powerUps: {
    undo: { main: number; border: number };
    clock: { main: number; border: number };
    key: { main: number; border: number };
  };

  // Lives/Hearts colors
  lives: {
    color: string;
    stroke: string;
  };

  // Tile colors (optional override)
  tile?: {
    face: number;
    side: number;
    bottom: number;
    border: number;
    sideLight: number;
    bottomLight: number;
  };
}

/**
 * Classic Theme - The original cartoon style
 */
export const classicTheme: GameTheme = {
  name: "classic",
  displayName: "Classic",

  background: {
    main: "#f5deb3", // Wheat
    mainHex: 0xf5deb3,
    pattern: {
      color1: 0xf5deb3, // Wheat base
      color2: 0xdeb887, // Burlywood contrast
    },
  },

  badge: {
    main: 0x3cb371, // Medium Sea Green
    border: 0x2e8b57, // Sea Green
    depth3D: 16,
    textStroke: "#1a3a1a",
  },

  hand: {
    background: 0x3cb371, // Medium Sea Green
    slot: 0x2e8b57, // Sea Green
    slotBorder: 0x228b22, // Forest Green
  },

  modal: {
    main: 0x3cb371, // Medium Sea Green (same as badge)
    border: 0x2e8b57, // Sea Green
    titleColor: "#ffffff",
    titleStroke: "#1a3a1a",
    textColor: "#1a1a1a",
    buttonTextColor: "#1a1a1a",
  },

  powerUps: {
    undo: { main: 0x3498db, border: 0x2980b9 }, // Blue
    clock: { main: 0xf1c40f, border: 0xd4a800 }, // Yellow/Gold
    key: { main: 0xe74c3c, border: 0x8b0000 }, // Red
  },

  lives: {
    color: "#e74c3c",
    stroke: "#8b0000",
  },

  tile: {
    face: 0xffffff,
    side: 0xd4b896,
    bottom: 0xc4a878,
    border: 0xb49868,
    sideLight: 0xe0c8a8,
    bottomLight: 0xd0b898,
  },
};

// All available themes
export const themes: Record<string, GameTheme> = {
  classic: classicTheme,
};

// Current active theme
let currentTheme: GameTheme = classicTheme;

/**
 * Get the current active theme
 */
export function getCurrentTheme(): GameTheme {
  return currentTheme;
}

/**
 * Set the active theme by name
 */
export function setTheme(themeName: string): boolean {
  if (themes[themeName]) {
    currentTheme = themes[themeName];
    return true;
  }
  return false;
}

/**
 * Get list of available theme names
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}

export default getCurrentTheme;
