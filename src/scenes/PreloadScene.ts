/**
 * PreloadScene - Escena de precarga del juego Crypto Mahjong
 * Carga los assets mínimos necesarios mientras muestra el sprite animado
 */

import { themes } from "../config/Themes";
import { SoundManager } from "../systems/SoundManager";

export class PreloadScene extends Phaser.Scene {
  private assetsLoaded: boolean = false;
  private fontsLoaded: boolean = false;
  private animationComplete: boolean = false;
  private bootSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: "PreloadScene" });
  }

  init(): void {
    this.cameras.main.setBackgroundColor("#000000");
  }

  preload(): void {
    // SOLO el sprite aquí (es pequeño, carga rápido)
    this.load.spritesheet(
      "bootSprite",
      "https://remix.gg/blob/13e738d9-e135-454e-9d2a-e456476a0c5e/sprite-start-oVCq0bchsVLwbLqAPbLgVOrQqxcVh5.webp?Cbzd",
      { frameWidth: 241, frameHeight: 345 }
    );
  }

  create(): void {
    // Crear animación
    const frames = this.anims.generateFrameNumbers("bootSprite", {
      start: 0,
      end: 17, // 18 frames - 1
    });

    // Hacer que el último frame dure más (ej. 500ms) para mejor efecto visual
    if (frames.length > 0) {
      frames[frames.length - 1].duration = 500;
    }

    this.anims.create({
      key: "boot",
      frames: frames,
      frameRate: 12,
      repeat: 0, // Una sola vez, se queda en último frame
    });

    // Mostrar sprite centrado con proporción correcta
    const { width, height } = this.scale;
    this.bootSprite = this.add.sprite(width / 2, height / 2, "bootSprite");

    // Calcular escala manteniendo proporción (241x345 es el tamaño del frame)
    const spriteWidth = 241;
    const spriteHeight = 345;
    const maxWidth = width * 0.6;
    const maxHeight = height * 0.6;
    const scaleX = maxWidth / spriteWidth;
    const scaleY = maxHeight / spriteHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);
    this.bootSprite.setScale(scale);
    this.bootSprite.play("boot");

    // Cuando termine la animación
    this.bootSprite.on("animationcomplete", () => {
      this.animationComplete = true;
      this.checkTransition();
    });

    // Cargar el resto de assets prioritarios
    this.loadRemainingAssets();
  }

  private loadRemainingAssets(): void {
    // WebFont loader para fuentes
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    // Iniciar carga de fuentes cuando el script esté listo
    this.load.on("filecomplete-script-webfont", () => {
      // @ts-ignore
      if (window.WebFont) {
        // @ts-ignore
        window.WebFont.load({
          google: {
            families: ["Fredoka One"],
          },
          active: () => {
            console.log("Fonts loaded");
            this.fontsLoaded = true;
            this.checkTransition();
          },
          inactive: () => {
            console.warn("Fonts failed to load");
            this.fontsLoaded = true; // Continuar aunque falle
            this.checkTransition();
          },
        });
      }
    });

    // --- ASSETS PRIORITARIOS ---

    // Imagen de fondo del menú principal
    this.load.image(
      "menu-bg",
      "https://remix.gg/blob/zS0QCi0PfUjO/mahjong-xLbaEqVFKWEylPL92Zn4ScyqpnczG8.webp?w5dj"
    );

    // Cargar imágenes de fondo de todos los temas
    Object.values(themes).forEach((theme) => {
      if (theme.background.backgroundImage) {
        this.load.image(`bg-${theme.name}`, theme.background.backgroundImage);
      }
    });

    this.load.on("complete", () => {
      // Inicializar SoundManager y precargar sonidos + primera pista
      SoundManager.preloadPrimaryTrack();

      this.assetsLoaded = true;
      this.checkTransition();
    });

    this.load.start();
  }

  private checkTransition(): void {
    // Aseguramos que:
    // 1. La animación de carga terminó
    // 2. Todos los assets de la cola de Phaser cargaron
    // 3. Las fuentes web cargaron
    if (this.animationComplete && this.assetsLoaded && this.fontsLoaded) {
      this.scene.start("MainMenuScene");
    }
  }
}

// Lazy load de música extra (se llama desde MahjongScene después del primer nivel)
export function loadExtraMusic(): void {
  // Las pistas adicionales se cargan via SoundManager con lazy load automático
  // No necesitamos hacer nada aquí, SoundManager ya lo maneja
}
