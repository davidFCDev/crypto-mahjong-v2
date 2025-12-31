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
  displayName: "Clásico",

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

/**
 * Ocean Theme - Deep sea blues and teals
 */
export const oceanTheme: GameTheme = {
  name: "ocean",
  displayName: "Océano",

  background: {
    main: "#1a3a4a", // Deep ocean blue
    mainHex: 0x1a3a4a,
    pattern: {
      color1: 0x1a3a4a, // Deep blue base
      color2: 0x0f2a38, // Darker contrast
    },
  },

  badge: {
    main: 0x20b2aa, // Light Sea Green
    border: 0x008b8b, // Dark Cyan
    depth3D: 16,
    textStroke: "#0a3030",
  },

  hand: {
    background: 0x20b2aa, // Light Sea Green
    slot: 0x008b8b, // Dark Cyan
    slotBorder: 0x006666, // Darker Teal
  },

  modal: {
    main: 0x20b2aa, // Light Sea Green
    border: 0x008b8b, // Dark Cyan
    titleColor: "#ffffff",
    titleStroke: "#0a3030",
    textColor: "#e0ffff", // Light Cyan
    buttonTextColor: "#0a3030",
  },

  powerUps: {
    undo: { main: 0x4169e1, border: 0x2a4b9b }, // Royal Blue
    clock: { main: 0x00ced1, border: 0x008b8b }, // Dark Turquoise
    key: { main: 0xff6b6b, border: 0xc44d4d }, // Coral Red
  },

  lives: {
    color: "#ff6b6b",
    stroke: "#c44d4d",
  },

  tile: {
    face: 0xe0ffff, // Light Cyan
    side: 0x5f9ea0, // Cadet Blue
    bottom: 0x4a8a8c, // Darker Teal
    border: 0x3a7a7c,
    sideLight: 0x7fb8ba,
    bottomLight: 0x6aa8aa,
  },
};

/**
 * Sunset Theme - Warm oranges and purples
 */
export const sunsetTheme: GameTheme = {
  name: "sunset",
  displayName: "Atardecer",

  background: {
    main: "#2d1b3d", // Deep purple
    mainHex: 0x2d1b3d,
    pattern: {
      color1: 0x2d1b3d, // Deep purple base
      color2: 0x1f1229, // Darker purple
    },
  },

  badge: {
    main: 0xff7f50, // Coral
    border: 0xcd5c3c, // Dark Coral
    depth3D: 16,
    textStroke: "#4a1a0a",
  },

  hand: {
    background: 0xff7f50, // Coral
    slot: 0xcd5c3c, // Dark Coral
    slotBorder: 0xa04830, // Darker
  },

  modal: {
    main: 0xff7f50, // Coral
    border: 0xcd5c3c, // Dark Coral
    titleColor: "#ffffff",
    titleStroke: "#4a1a0a",
    textColor: "#fff0e6", // Light peach
    buttonTextColor: "#4a1a0a",
  },

  powerUps: {
    undo: { main: 0x9370db, border: 0x7b5dc2 }, // Medium Purple
    clock: { main: 0xffd700, border: 0xb8a000 }, // Gold
    key: { main: 0xff4500, border: 0xcc3700 }, // Orange Red
  },

  lives: {
    color: "#ff4500",
    stroke: "#cc3700",
  },

  tile: {
    face: 0xfff5ee, // Seashell
    side: 0xdda0a0, // Rosy
    bottom: 0xc89090, // Darker Rosy
    border: 0xb88080,
    sideLight: 0xedc0c0,
    bottomLight: 0xddb0b0,
  },
};

/**
 * Sakura Theme - Japanese cherry blossom pink
 */
export const sakuraTheme: GameTheme = {
  name: "sakura",
  displayName: "Sakura",

  background: {
    main: "#fce4ec", // Pale pink
    mainHex: 0xfce4ec,
    pattern: {
      color1: 0xfce4ec, // Pale pink base
      color2: 0xf8bbd9, // Slightly darker pink
    },
  },

  badge: {
    main: 0xe91e63, // Pink
    border: 0xc2185b, // Dark Pink
    depth3D: 16,
    textStroke: "#4a0a20",
  },

  hand: {
    background: 0xe91e63, // Pink
    slot: 0xc2185b, // Dark Pink
    slotBorder: 0x9c1450, // Darker
  },

  modal: {
    main: 0xe91e63, // Pink
    border: 0xc2185b, // Dark Pink
    titleColor: "#ffffff",
    titleStroke: "#4a0a20",
    textColor: "#3a1a25", // Dark text for readability
    buttonTextColor: "#3a1a25",
  },

  powerUps: {
    undo: { main: 0x8bc34a, border: 0x689f38 }, // Light Green (leaf)
    clock: { main: 0xffeb3b, border: 0xc8b900 }, // Yellow
    key: { main: 0xff5722, border: 0xc43c00 }, // Deep Orange
  },

  lives: {
    color: "#ff5722",
    stroke: "#c43c00",
  },

  tile: {
    face: 0xffffff,
    side: 0xf8bbd0, // Light pink
    bottom: 0xf48fb1, // Medium pink
    border: 0xe57399,
    sideLight: 0xfce4ec,
    bottomLight: 0xf8bbd0,
  },
};

// All available themes
export const themes: Record<string, GameTheme> = {
  classic: classicTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  sakura: sakuraTheme,
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
