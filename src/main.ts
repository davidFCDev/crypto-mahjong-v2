import { initRemix } from "@insidethesim/remix-dev";
import GameSettings from "./config/GameSettings";
import { MahjongScene } from "./scenes/MahjongScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { PreloadScene } from "./scenes/PreloadScene";

// SDK mock is automatically initialized by the framework (dev-init.ts)

// --- Adaptación dinámica de altura al viewport ---
// Base: 720×1080 (2:3). En full screen (9:16, 9:19.5, etc.) la altura se extiende.
const GAME_WIDTH = 720;
const BASE_HEIGHT = 1080; // 2:3 ratio
const viewportRatio = window.innerWidth / window.innerHeight;
const idealRatio = 2 / 3; // 0.6667

// Si el viewport es más alto que 2:3, extender la altura del canvas
let gameHeight: number;
if (viewportRatio < idealRatio - 0.01) {
  // Pantalla más alta que 2:3 (9:16, 9:19.5, etc.)
  gameHeight = Math.round(GAME_WIDTH / viewportRatio);
} else {
  // 2:3 o más ancha → usar altura base
  gameHeight = BASE_HEIGHT;
}

// Actualizar GameSettings para que todo el juego use la altura correcta
GameSettings.canvas.height = gameHeight;

// --- Safe area top para evitar notch/cámara en full screen ---
// En 2:3 (card en feed) no hay notch. En full screen sí.
if (gameHeight > BASE_HEIGHT) {
  GameSettings.safeAreaTop = 90; // Zona muerta para notch/cámara
}

// --- Escalado de dimensiones para modo 2:3 (card) ---
// Los tamaños base están diseñados para full screen (~1280px de alto).
// En 2:3 (1080px) se reducen proporcionalmente para que no se solapen.
const FULLSCREEN_REF_HEIGHT = 1280;
if (gameHeight < FULLSCREEN_REF_HEIGHT) {
  const s = gameHeight / FULLSCREEN_REF_HEIGHT; // ~0.84 para 2:3

  // Escalar fichas
  GameSettings.tile.width = Math.round(120 * s);
  GameSettings.tile.height = Math.round(160 * s);
  GameSettings.tile.depth = Math.round(16 * s);
  GameSettings.tile.cornerRadius = Math.round(11 * s);
  GameSettings.tile.shadowOffset = Math.round(16 * s);

  // Escalar hand slots
  GameSettings.hand.slotWidth = Math.round(108 * s);
  GameSettings.hand.slotHeight = Math.round(145 * s);

  // Escalar board
  GameSettings.board.maxHeight = Math.round(850 * s);
  GameSettings.board.layerOffsetY = Math.round(11 * s);
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GAME_WIDTH,
  height: gameHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    width: GAME_WIDTH,
    height: gameHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#000000", // Negro para el preload
  scene: [PreloadScene, MainMenuScene, MahjongScene],
  physics: {
    default: "arcade",
  },
  fps: {
    target: 60,
  },
  pixelArt: false,
  antialias: true,
};

// Create the game instance
const game = new Phaser.Game(config);

// Store globally for performance monitoring and HMR cleanup
(window as any).game = game;

// Initialize Remix framework after game is created
game.events.once("ready", () => {
  initRemix(game, {
    multiplayer: false,
  });
});
