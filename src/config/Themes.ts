/**
 * Theme System for Crypto Mahjong
 * Define visual themes for UI elements
 */

export type PatternType =
  | "diamonds"
  | "waves"
  | "hexagons"
  | "circles"
  | "polkadots";

export interface GameTheme {
  name: string;
  displayName: string;

  // Background colors
  background: {
    main: string; // Hex string for Phaser config
    mainHex: number; // Hex number for graphics
    backgroundImage?: string; // URL de imagen de fondo (opcional)
    pattern: {
      type: PatternType;
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
    backgroundImage:
      "https://remix.gg/blob/zS0QCi0PfUjO/11%20%281%29-5rWcZQAXCAHAxPIlyY1z0F0WTVTLxD.webp?G141",
    pattern: {
      type: "diamonds",
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
  displayName: "Ocean",

  background: {
    main: "#1a3a4a", // Deep ocean blue
    mainHex: 0x1a3a4a,
    backgroundImage:
      "https://remix.gg/blob/zS0QCi0PfUjO/ocean-gFx3EBS1vC6C2L6tsUBmPi26t4oL9C.webp?Cc2P",
    pattern: {
      type: "waves",
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
  displayName: "Sunset",

  background: {
    main: "#ffb347", // Naranja cálido
    mainHex: 0xffb347,
    backgroundImage:
      "https://remix.gg/blob/zS0QCi0PfUjO/atardecer-5hf7bIPQYd72dNAL5etCf8ztM7XqgP.webp?FPWJ",
    pattern: {
      type: "polkadots", // Lunares
      color1: 0xffb347, // Naranja base
      color2: 0xffffff, // Blanco para los lunares
    },
  },

  badge: {
    main: 0xffe066, // Amarillo crema brillante
    border: 0xe6c84a, // Amarillo mostaza suave
    depth3D: 16,
    textStroke: "#8b6914",
  },

  hand: {
    background: 0xffe066, // Amarillo crema brillante
    slot: 0xe6c84a, // Amarillo mostaza suave
    slotBorder: 0xd4b23a, // Amarillo dorado
  },

  modal: {
    main: 0xffe066, // Amarillo crema brillante
    border: 0xe6c84a, // Amarillo mostaza suave
    titleColor: "#6b4c00",
    titleStroke: "#ffe066",
    textColor: "#5d4500",
    buttonTextColor: "#5d4500",
  },

  powerUps: {
    undo: { main: 0xfff176, border: 0xe6c84a }, // Amarillo limón
    clock: { main: 0xffd700, border: 0xdaa520 }, // Gold
    key: { main: 0xffb347, border: 0xe6a030 }, // Naranja suave
  },

  lives: {
    color: "#e74c3c",
    stroke: "#8b0000",
  },

  tile: {
    face: 0xfffff0, // Ivory
    side: 0xfff59d, // Amarillo claro
    bottom: 0xffe082, // Amarillo ámbar claro
    border: 0xe6c84a,
    sideLight: 0xfffde7,
    bottomLight: 0xfff59d,
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
    backgroundImage:
      "https://remix.gg/blob/zS0QCi0PfUjO/sakura-ATSX9unarKHj5GvQP94CVzXvEjF4HZ.webp?f9jk",
    pattern: {
      type: "circles",
      color1: 0xfce4ec, // Pale pink base
      color2: 0xf8bbd9, // Slightly darker pink
    },
  },

  badge: {
    main: 0xf06292, // Rosa vibrante
    border: 0xd81b60, // Rosa intenso
    depth3D: 16,
    textStroke: "#5a0a25",
  },

  hand: {
    background: 0xf06292, // Rosa vibrante
    slot: 0xd81b60, // Rosa intenso
    slotBorder: 0xad1457, // Magenta oscuro
  },

  modal: {
    main: 0xf06292, // Rosa vibrante
    border: 0xd81b60, // Rosa intenso
    titleColor: "#ffffff",
    titleStroke: "#5a0a25",
    textColor: "#3a1a25",
    buttonTextColor: "#3a1a25",
  },

  powerUps: {
    undo: { main: 0x81c784, border: 0x66bb6a }, // Verde hoja
    clock: { main: 0xffb74d, border: 0xffa726 }, // Naranja suave
    key: { main: 0xf06292, border: 0xd81b60 }, // Rosa
  },

  lives: {
    color: "#e74c3c",
    stroke: "#8b0000",
  },

  tile: {
    face: 0xffffff,
    side: 0xf8bbd0, // Rosa claro
    bottom: 0xf48fb1, // Rosa medio
    border: 0xec407a,
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

/**
 * Cycles to the next available theme
 */
export function cycleTheme(): GameTheme {
  const themeNames = Object.keys(themes);
  const currentIndex = themeNames.indexOf(currentTheme.name);
  const nextIndex = (currentIndex + 1) % themeNames.length;
  currentTheme = themes[themeNames[nextIndex]];
  return currentTheme;
}

export default getCurrentTheme;
