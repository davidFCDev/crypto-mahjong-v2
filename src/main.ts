import GameSettings from "./config/GameSettings";
import { MahjongScene } from "./scenes/MahjongScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { PreloadScene } from "./scenes/PreloadScene";

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GameSettings.canvas.width,
  height: GameSettings.canvas.height,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    width: GameSettings.canvas.width,
    height: GameSettings.canvas.height,
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

// Store globally for performance monitoring
(window as any).game = game;
