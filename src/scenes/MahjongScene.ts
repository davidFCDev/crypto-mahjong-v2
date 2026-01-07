/**
 * MahjongScene - Escena principal del juego Crypto Mahjong
 * Integra todos los sistemas: tablero, fichas 3D, mano y UI
 */

import type { FarcadeSDK } from "@farcade/game-sdk";
import GameSettings from "../config/GameSettings";
import { cycleTheme, getCurrentTheme, themes } from "../config/Themes";
import { Tile3D } from "../objects/Tile3D";

import { BoardGenerator } from "../systems/BoardGenerator";
import { GameUI } from "../systems/GameUI";
import { HandManager } from "../systems/HandManager";
import { SoundManager } from "../systems/SoundManager";
import {
  TILE_COLORS,
  TileType,
  type GameState,
  type LevelConfig,
  type TileState,
} from "../types";

declare global {
  interface Window {
    FarcadeSDK: FarcadeSDK;
  }
}

export class MahjongScene extends Phaser.Scene {
  // Sistemas
  private handManager!: HandManager;
  private gameUI!: GameUI;

  // Estado del juego
  private gameState: GameState = {
    currentLevel: 1,
    score: 0,
    tiles: [],
    hand: [],
    isPlaying: false,
    isGameOver: false,
    isWin: false,
  };

  // Componentes visuales
  private tileSprites: Map<string, Tile3D> = new Map();
  private boardContainer!: Phaser.GameObjects.Container;
  private backgroundObject:
    | Phaser.GameObjects.Image
    | Phaser.GameObjects.Graphics
    | null = null;
  private currentLevelConfig!: LevelConfig;

  // Bounds del tablero - Centrado verticalmente entre score y mano
  // Score badge: Y=55, altura=95 → termina en Y=150
  // Mano: empieza en Y = 1080 - 130 - 77 = 873
  // Área disponible: desde 150 hasta 873
  private boardBounds = {
    x: 5,
    y: 145, // Después del score badge (un poco más arriba)
    width: GameSettings.canvas.width - 10,
    height:
      GameSettings.canvas.height -
      160 - // Espacio superior (score)
      GameSettings.hand.bottomMargin -
      GameSettings.hand.slotHeight / 2 -
      30, // Margen inferior
  };

  // Estado de animación
  private isAnimating: boolean = false;

  // Estado de items comprados
  private hasExclusiveThemes: boolean = false;
  private hasJustATip: boolean = false;

  constructor() {
    super({ key: "MahjongScene" });
  }

  preload(): void {
    // Cargar imágenes de los tiles que tienen imageUrl
    Object.values(TileType).forEach((type) => {
      if (typeof type === "number") {
        const tileConfig = TILE_COLORS[type as TileType];
        if (tileConfig.imageUrl) {
          this.load.image(`tile-icon-${type}`, tileConfig.imageUrl);
        }
      }
    });

    // Cargar imágenes de fondo de todos los temas
    Object.values(themes).forEach((theme) => {
      if (theme.background.backgroundImage) {
        this.load.image(`bg-${theme.name}`, theme.background.backgroundImage);
      }
    });
  }

  create(): void {
    // Resetear estado del juego al iniciar una nueva partida
    this.gameState = {
      currentLevel: 1,
      score: 0,
      tiles: [],
      hand: [],
      isPlaying: false,
      isGameOver: false,
      isWin: false,
    };

    // Resetear estado de animación
    this.isAnimating = false;

    // Verificar si tiene temas exclusivos
    this.checkExclusiveThemes();

    // Crear fondo
    this.createBackground();

    // Procesar imágenes de tiles para tener esquinas redondeadas
    this.createRoundedTileImages();

    // Inicializar sistemas
    this.handManager = new HandManager();
    this.gameUI = new GameUI(this);

    // Configurar callbacks de power-ups
    this.gameUI.setPowerUpCallbacks({
      onUndo: () => this.handleUndo(),
      onPauseTime: () => this.handlePauseTime(),
      onHint: () => this.handleHint(),
      onChangeTheme: () => this.handleThemeChange(),
      onTip: () => this.handleTip(),
    });

    // Ocultar botón de tip si ya lo tiene
    if (this.hasJustATip) {
      this.gameUI.hideTipButton();
    }

    // Escuchar evento de tiempo agotado
    this.gameUI.on("time-up", () => {
      this.handleTimeUp();
    });

    // Crear contenedor del tablero
    this.boardContainer = this.add.container(0, 0);

    // Configurar callback para "Play Again" del SDK
    this.setupPlayAgainListener();

    // Verificar si es la primera vez que juega
    const tutorialSeen = localStorage.getItem("crypto-mahjong-tutorial-seen");
    if (!tutorialSeen) {
      // Mostrar tutorial sobre la escena del juego
      this.showTutorial();
    } else {
      // Iniciar nivel 1 directamente
      this.startLevel(1);
    }
  }

  /**
   * Muestra el tutorial para nuevos jugadores (sobre la escena del juego)
   */
  private showTutorial(): void {
    const { canvas } = GameSettings;

    // Contenedor principal del overlay
    const tutorialModal = this.add.container(0, 0);
    tutorialModal.setDepth(2000);

    // Overlay muy oscuro
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.97);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, canvas.width, canvas.height),
      Phaser.Geom.Rectangle.Contains
    );
    overlay.on("pointerdown", () => {});
    tutorialModal.add(overlay);

    const fontFamily = "'Fredoka One', Arial Black, sans-serif";
    const theme = getCurrentTheme();
    const powerUpColors = theme.powerUps;

    // Título "HOW TO PLAY"
    const title = this.add.text(canvas.width / 2, 120, "HOW TO PLAY", {
      fontSize: "48px",
      fontFamily: fontFamily,
      color: "#B7FF00",
      stroke: "#000000",
      strokeThickness: 8,
    });
    title.setOrigin(0.5);
    tutorialModal.add(title);

    // Instrucción principal
    const instruction1 = this.add.text(
      canvas.width / 2,
      220,
      "Match 3 identical tiles",
      {
        fontSize: "32px",
        fontFamily: fontFamily,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      }
    );
    instruction1.setOrigin(0.5);
    tutorialModal.add(instruction1);

    const instruction2 = this.add.text(
      canvas.width / 2,
      280,
      "Clear the board before",
      {
        fontSize: "32px",
        fontFamily: fontFamily,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      }
    );
    instruction2.setOrigin(0.5);
    tutorialModal.add(instruction2);

    const instruction3 = this.add.text(
      canvas.width / 2,
      340,
      "time runs out!",
      {
        fontSize: "32px",
        fontFamily: fontFamily,
        color: "#ff6b6b",
        stroke: "#000000",
        strokeThickness: 4,
      }
    );
    instruction3.setOrigin(0.5);
    tutorialModal.add(instruction3);

    // Título de Power-ups
    const powerupsTitle = this.add.text(canvas.width / 2, 440, "POWER-UPS", {
      fontSize: "36px",
      fontFamily: fontFamily,
      color: "#B7FF00",
      stroke: "#000000",
      strokeThickness: 6,
    });
    powerupsTitle.setOrigin(0.5);
    tutorialModal.add(powerupsTitle);

    // Power-ups con iconos
    const centerX = canvas.width / 2;
    const buttonSize = 70;
    const startY = 530;
    const gap = 100;

    const powerups = [
      {
        type: "undo",
        name: "Undo",
        desc: "Return last tile",
        colors: powerUpColors.undo,
      },
      {
        type: "clock",
        name: "Freeze",
        desc: "Pause timer",
        colors: powerUpColors.clock,
      },
      {
        type: "key",
        name: "Hint",
        desc: "Remove a pair",
        colors: powerUpColors.key,
      },
    ];

    powerups.forEach((pu, index) => {
      const y = startY + index * gap;
      const buttonX = centerX - 120;

      // Botón circular
      const btn = this.add.graphics();
      btn.fillStyle(pu.colors.main, 1);
      btn.fillCircle(buttonX, y, buttonSize / 2);
      btn.lineStyle(3, pu.colors.border, 1);
      btn.strokeCircle(buttonX, y, buttonSize / 2);
      tutorialModal.add(btn);

      // Nombre
      const name = this.add.text(centerX - 30, y - 12, pu.name, {
        fontSize: "28px",
        fontFamily: fontFamily,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      });
      name.setOrigin(0, 0.5);
      tutorialModal.add(name);

      // Descripción
      const desc = this.add.text(centerX - 30, y + 18, pu.desc, {
        fontSize: "20px",
        fontFamily: fontFamily,
        color: "#aaaaaa",
      });
      desc.setOrigin(0, 0.5);
      tutorialModal.add(desc);
    });

    // Botón "LET'S GO!"
    const startButton = this.add.container(canvas.width / 2, 880);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x2d7d32, 1);
    btnBg.fillRoundedRect(-100, 8, 200, 55, 14);
    btnBg.fillStyle(0x4caf50, 1);
    btnBg.fillRoundedRect(-100, 0, 200, 55, 14);
    btnBg.lineStyle(3, 0x2d7d32, 1);
    btnBg.strokeRoundedRect(-100, 0, 200, 55, 14);
    startButton.add(btnBg);

    const btnText = this.add.text(0, 55 / 2, "LET'S GO!", {
      fontSize: "26px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: "#2d7d32",
      strokeThickness: 3,
    });
    btnText.setOrigin(0.5);
    startButton.add(btnText);

    startButton.setSize(200, 63);
    startButton.setInteractive({ useHandCursor: true });

    startButton.on("pointerover", () => {
      this.tweens.add({
        targets: startButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    startButton.on("pointerout", () => {
      this.tweens.add({
        targets: startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    startButton.on("pointerdown", () => {
      // Marcar tutorial como visto
      localStorage.setItem("crypto-mahjong-tutorial-seen", "true");

      // Cerrar tutorial e iniciar juego
      this.tweens.add({
        targets: tutorialModal,
        alpha: 0,
        duration: 200,
        ease: "Power2",
        onComplete: () => {
          tutorialModal.destroy();
          // Iniciar nivel 1
          this.startLevel(1);
        },
      });
    });

    tutorialModal.add(startButton);

    // Fade in
    tutorialModal.setAlpha(0);
    this.tweens.add({
      targets: tutorialModal,
      alpha: 1,
      duration: 300,
      ease: "Power2",
    });
  }

  /**
   * Configura el listener para cuando el usuario pulsa "Play Again" en el SDK
   */
  private setupPlayAgainListener(): void {
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.onPlayAgain) {
        sdk.onPlayAgain(() => {
          // Volver a la pantalla de inicio
          this.scene.start("MainMenuScene");
        });
      }
    } catch {
      // SDK no disponible
    }
  }

  /**
   * Crea versiones con esquinas redondeadas de las im�genes de tiles
   */
  private createRoundedTileImages(): void {
    const padding = 8;
    const innerWidth = GameSettings.tile.width - padding * 2;
    const innerHeight = GameSettings.tile.height - padding * 2;
    const cornerRadius = GameSettings.tile.cornerRadius - 2;

    Object.values(TileType).forEach((type) => {
      if (typeof type === "number") {
        const tileConfig = TILE_COLORS[type as TileType];
        if (tileConfig.imageUrl) {
          const originalKey = `tile-icon-${type}`;
          const roundedKey = `tile-icon-rounded-${type}`;

          // Verificar si ya existe la textura redondeada
          if (this.textures.exists(roundedKey)) return;

          // Obtener la textura original
          const originalTexture = this.textures.get(originalKey);
          if (!originalTexture || originalTexture.key === "__MISSING") return;

          // Crear canvas para dibujar la imagen redondeada
          const canvas = document.createElement("canvas");
          canvas.width = innerWidth;
          canvas.height = innerHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Dibujar rectángulo redondeado como máscara
          ctx.beginPath();
          ctx.roundRect(0, 0, innerWidth, innerHeight, cornerRadius);
          ctx.closePath();
          ctx.clip();

          // Obtener la imagen original
          const sourceImage =
            originalTexture.getSourceImage() as HTMLImageElement;
          ctx.drawImage(sourceImage, 0, 0, innerWidth, innerHeight);

          // Crear textura desde el canvas
          this.textures.addCanvas(roundedKey, canvas);
        }
      }
    });
  }

  /**
   * Crea el fondo del juego - Imagen o patrón según el tema
   */
  private createBackground(): void {
    const { canvas } = GameSettings;
    const theme = getCurrentTheme();

    // Eliminar fondo anterior
    if (this.backgroundObject) {
      this.backgroundObject.destroy();
      this.backgroundObject = null;
    }

    // Si el tema tiene imagen de fondo, usarla
    const bgImageKey = `bg-${theme.name}`;
    if (theme.background.backgroundImage && this.textures.exists(bgImageKey)) {
      const bgImage = this.add.image(
        canvas.width / 2,
        canvas.height / 2,
        bgImageKey
      );
      bgImage.setDisplaySize(canvas.width, canvas.height);
      bgImage.setDepth(-3);
      this.backgroundObject = bgImage;
      return;
    }

    // Fallback: usar patrón de colores
    const pattern = theme.background.pattern;

    const bgGraphics = this.add.graphics();
    bgGraphics.setDepth(-3);
    this.backgroundObject = bgGraphics;

    // Fondo base
    bgGraphics.fillStyle(pattern.color1, 1);
    bgGraphics.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar patrón según el tipo del tema
    switch (pattern.type) {
      case "diamonds":
        this.drawDiamondsPattern(bgGraphics, pattern.color2);
        break;
      case "waves":
        this.drawWavesPattern(bgGraphics, pattern.color2);
        break;
      case "hexagons":
        this.drawHexagonsPattern(bgGraphics, pattern.color2);
        break;
      case "circles":
        this.drawCirclesPattern(bgGraphics, pattern.color2);
        break;
      case "polkadots":
        this.drawPolkadotsPattern(bgGraphics, pattern.color1, pattern.color2);
        break;
    }
  }

  /**
   * Patrón de rombos (Clásico)
   */
  private drawDiamondsPattern(
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ): void {
    const { canvas } = GameSettings;
    const diamondWidth = 80;
    const diamondHeight = 100;

    let row = 0;
    for (
      let y = -diamondHeight / 2;
      y < canvas.height + diamondHeight;
      y += diamondHeight / 2
    ) {
      let col = 0;
      const offsetX = (row % 2) * (diamondWidth / 2);

      for (
        let x = -diamondWidth / 2 + offsetX;
        x < canvas.width + diamondWidth;
        x += diamondWidth
      ) {
        const useColor2 = (row + col) % 2 === 0;

        if (useColor2) {
          graphics.fillStyle(color, 1);
          graphics.beginPath();
          graphics.moveTo(x, y - diamondHeight / 2);
          graphics.lineTo(x + diamondWidth / 2, y);
          graphics.lineTo(x, y + diamondHeight / 2);
          graphics.lineTo(x - diamondWidth / 2, y);
          graphics.closePath();
          graphics.fillPath();
        }
        col++;
      }
      row++;
    }
  }

  /**
   * Patrón de olas (Océano)
   */
  private drawWavesPattern(
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ): void {
    const { canvas } = GameSettings;
    const waveHeight = 40;
    const waveWidth = 120;
    const amplitude = 20;

    graphics.lineStyle(3, color, 0.6);

    for (let y = 0; y < canvas.height + waveHeight * 2; y += waveHeight) {
      const offsetX = ((y / waveHeight) % 2) * (waveWidth / 2);

      graphics.beginPath();
      graphics.moveTo(-waveWidth + offsetX, y);

      for (
        let x = -waveWidth + offsetX;
        x < canvas.width + waveWidth;
        x += waveWidth
      ) {
        // Dibujar curva de ola
        graphics.lineTo(x + waveWidth * 0.25, y - amplitude);
        graphics.lineTo(x + waveWidth * 0.5, y);
        graphics.lineTo(x + waveWidth * 0.75, y + amplitude);
        graphics.lineTo(x + waveWidth, y);
      }
      graphics.strokePath();
    }

    // Añadir círculos pequeños como burbujas
    graphics.fillStyle(color, 0.3);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 3 + Math.random() * 8;
      graphics.fillCircle(x, y, radius);
    }
  }

  /**
   * Patrón de hexágonos (Atardecer)
   */
  private drawHexagonsPattern(
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ): void {
    const { canvas } = GameSettings;
    const hexSize = 50;
    const hexWidth = hexSize * 2;
    const hexHeight = Math.sqrt(3) * hexSize;

    graphics.lineStyle(2, color, 0.5);

    let row = 0;
    for (
      let y = -hexHeight;
      y < canvas.height + hexHeight * 2;
      y += hexHeight * 0.75
    ) {
      const offsetX = (row % 2) * (hexWidth * 0.75);

      for (
        let x = -hexWidth + offsetX;
        x < canvas.width + hexWidth * 2;
        x += hexWidth * 1.5
      ) {
        this.drawHexagon(graphics, x, y, hexSize);
      }
      row++;
    }
  }

  /**
   * Dibuja un hexágono individual
   */
  private drawHexagon(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    size: number
  ): void {
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.strokePath();
  }

  /**
   * Patrón de círculos grandes tipo bokeh (Atardecer y Sakura)
   */
  private drawCirclesPattern(
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ): void {
    const { canvas } = GameSettings;
    const theme = getCurrentTheme();

    // Para el tema sunset, crear degradado con franjas horizontales
    if (theme.name === "sunset") {
      const steps = 20;
      const stepHeight = canvas.height / steps;

      for (let i = 0; i < steps; i++) {
        // Interpolar entre naranja (0xffb347) y rosado (0xff5e62)
        const t = i / (steps - 1);
        const r = Math.round(0xff + (0xff - 0xff) * t);
        const g = Math.round(0xb3 + (0x5e - 0xb3) * t);
        const b = Math.round(0x47 + (0x62 - 0x47) * t);
        const gradientColor = (r << 16) | (g << 8) | b;

        graphics.fillStyle(gradientColor, 1);
        graphics.fillRect(0, i * stepHeight, canvas.width, stepHeight + 1);
      }
    }

    // Círculos grandes y suaves (bokeh)
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 60 + Math.random() * 80;
      const alpha = 0.12 + Math.random() * 0.15;
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(x, y, radius);
    }

    // Para Sakura, añadir flores de cerezo
    if (theme.name === "sakura") {
      this.drawSakuraFlowers(graphics, color);
    }
  }

  /**
   * Dibuja flores de cerezo para el tema Sakura
   */
  private drawSakuraFlowers(
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ): void {
    const { canvas } = GameSettings;
    const gridSize = 100;

    for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
      const offsetX = ((y / gridSize) % 2) * (gridSize / 2);
      for (let x = offsetX; x < canvas.width + gridSize; x += gridSize) {
        // Dibujar flor de cerezo estilizada (5 pétalos)
        const petalSize = 12;
        const petalDistance = 18;

        for (let i = 0; i < 5; i++) {
          const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
          const px = x + Math.cos(angle) * petalDistance;
          const py = y + Math.sin(angle) * petalDistance;
          graphics.fillStyle(color, 0.5);
          graphics.fillCircle(px, py, petalSize);
        }

        // Centro de la flor
        graphics.fillStyle(0xffeb3b, 0.6); // Amarillo
        graphics.fillCircle(x, y, 6);
      }
    }
  }

  /**
   * Patrón de lunares (Polka dots) para Atardecer
   */
  private drawPolkadotsPattern(
    graphics: Phaser.GameObjects.Graphics,
    bgColor: number,
    dotColor: number
  ): void {
    const { canvas } = GameSettings;

    // Crear degradado de fondo (naranja a rosado)
    const steps = 20;
    const stepHeight = canvas.height / steps;

    for (let i = 0; i < steps; i++) {
      // Interpolar entre naranja (0xffb347) y rosado (0xff5e62)
      const t = i / (steps - 1);
      const r = Math.round(0xff + (0xff - 0xff) * t);
      const g = Math.round(0xb3 + (0x5e - 0xb3) * t);
      const b = Math.round(0x47 + (0x62 - 0x47) * t);
      const gradientColor = (r << 16) | (g << 8) | b;

      graphics.fillStyle(gradientColor, 1);
      graphics.fillRect(0, i * stepHeight, canvas.width, stepHeight + 1);
    }

    // Dibujar lunares en cuadrícula ordenada
    const dotRadius = 18;
    const spacingX = 80;
    const spacingY = 80;

    for (let row = 0; row < Math.ceil(canvas.height / spacingY) + 1; row++) {
      const offsetX = (row % 2) * (spacingX / 2); // Alternar offset para patrón escalonado
      for (let col = 0; col < Math.ceil(canvas.width / spacingX) + 1; col++) {
        const x = col * spacingX + offsetX;
        const y = row * spacingY;

        // Lunares blancos semitransparentes
        graphics.fillStyle(dotColor, 0.25);
        graphics.fillCircle(x, y, dotRadius);
      }
    }
  }

  /**
   * Inicia un nuevo nivel
   */
  private startLevel(level: number): void {
    // Limpiar nivel anterior
    this.clearLevel();

    // Obtener configuración del nivel
    this.currentLevelConfig = GameSettings.getLevelConfig(level);

    // Actualizar estado
    this.gameState.currentLevel = level;
    this.gameState.isPlaying = true;
    this.gameState.isGameOver = false;
    this.gameState.isWin = false;

    // Generar nuevo tablero
    this.gameState.tiles = BoardGenerator.generateBoard(
      this.currentLevelConfig
    );

    // Iniciar música si es el primer nivel
    if (level === 1) {
      SoundManager.startMusic();
    }

    // Sonido de repartir fichas
    SoundManager.playShuffle(this.gameState.tiles.length);

    // Crear fichas visuales
    this.createTileSprites();

    // Actualizar UI
    this.gameUI.updateLevel(level);
    this.gameUI.updateHand(this.handManager.getSlots());

    // Animación de entrada
    this.animateBoardEntry();
  }

  /**
   * Limpia el nivel actual
   */
  private clearLevel(): void {
    // Resetear estado de animación
    this.isAnimating = false;

    // Destruir todos los sprites de fichas
    this.tileSprites.forEach((sprite) => sprite.destroy());
    this.tileSprites.clear();

    // Reiniciar mano
    this.handManager.reset();

    // Limpiar estado
    this.gameState.tiles = [];
  }

  /**
   * Crea los sprites de las fichas
   */
  private createTileSprites(): void {
    for (const tileState of this.gameState.tiles) {
      const screenPos = BoardGenerator.calculateScreenPosition(
        tileState.position,
        this.currentLevelConfig,
        this.boardBounds
      );

      // Determinar si debe mostrar el volumen 3D inferior
      const showBottom3D = !this.hasAdjacentTileBelow(tileState);

      const tile3D = new Tile3D(
        this,
        screenPos.x,
        screenPos.y,
        tileState,
        showBottom3D
      );
      tile3D.setLayerDepth(tileState.position.z);

      // Escuchar click
      tile3D.on("tile-clicked", (state: TileState) =>
        this.onTileClicked(state)
      );

      this.tileSprites.set(tileState.id, tile3D);
      this.boardContainer.add(tile3D);
    }
  }

  /**
   * Verifica si hay una ficha adyacente abajo en la misma capa
   * que taparía el efecto 3D de esta ficha
   */
  private hasAdjacentTileBelow(tile: TileState): boolean {
    const pos = tile.position;

    // Buscar ficha en la misma capa (Z), misma columna (X), y fila +1 (Y)
    return this.gameState.tiles.some((other) => {
      if (other.id === tile.id) return false;
      if (other.isInHand || other.isMatched) return false;

      // Misma capa
      if (other.position.z !== pos.z) return false;

      // La ficha de abajo debe estar en Y + 1 (aproximadamente)
      // Con el sistema de offset 0.5, verificamos si está en el rango [Y+0.5, Y+1.5]
      const yDiff = other.position.y - pos.y;
      if (yDiff < 0.4 || yDiff > 1.1) return false;

      // Debe estar en la misma columna (con tolerancia para offset)
      const xDiff = Math.abs(other.position.x - pos.x);
      if (xDiff > 0.6) return false;

      return true;
    });
  }

  /**
   * Actualiza el efecto 3D de las fichas cuando cambia el tablero
   */
  private updateTiles3DEffect(): void {
    for (const tile of this.gameState.tiles) {
      if (tile.isInHand || tile.isMatched) continue;

      const sprite = this.tileSprites.get(tile.id);
      if (sprite) {
        const showBottom3D = !this.hasAdjacentTileBelow(tile);
        sprite.updateBottom3D(showBottom3D);
      }
    }
  }

  /**
   * Animación de entrada del tablero
   */
  private animateBoardEntry(): void {
    this.isAnimating = true;
    const tiles = Array.from(this.tileSprites.values());

    // Ordenar por capa y posición
    tiles.sort((a, b) => {
      const stateA = a.getState();
      const stateB = b.getState();
      return (
        stateA.position.z - stateB.position.z ||
        stateA.position.y - stateB.position.y ||
        stateA.position.x - stateB.position.x
      );
    });

    // Animar entrada con delay escalonado
    tiles.forEach((tile, index) => {
      tile.setAlpha(0);
      tile.setScale(0);

      this.tweens.add({
        targets: tile,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        delay: index * 30,
        ease: "Back.easeOut",
        onComplete: () => {
          if (index === tiles.length - 1) {
            this.isAnimating = false;
          }
        },
      });
    });
  }

  /**
   * Maneja el click en una ficha
   */
  private onTileClicked(tileState: TileState): void {
    if (this.isAnimating || !this.gameState.isPlaying) return;

    // Verificar si la mano está llena - simplemente ignorar el click
    if (this.handManager.isFull()) {
      return;
    }

    // Haptic feedback al seleccionar ficha
    this.triggerHapticFeedback();

    this.isAnimating = true;

    // IMPORTANTE: Buscar la ficha en gameState.tiles para modificar el original
    const originalTile = this.gameState.tiles.find(
      (t) => t.id === tileState.id
    );
    if (!originalTile) {
      this.isAnimating = false;
      return;
    }

    // Obtener posición del slot destino
    const slotIndex = this.handManager.getTileCount();
    const slotPos = this.gameUI.getSlotPosition(slotIndex);

    // Obtener el sprite de la ficha
    const tileSprite = this.tileSprites.get(tileState.id);
    if (!tileSprite) {
      this.isAnimating = false;
      return;
    }

    // Marcar como en mano ANTES de animar (para que updateAccessibility funcione)
    originalTile.isInHand = true;
    originalTile.isAccessible = false;

    // Actualizar accesibilidad inmediatamente para que otras fichas se desbloqueen
    this.updateBoardAccessibility();

    // Actualizar efecto 3D (fichas que ahora pueden mostrar su volumen)
    this.updateTiles3DEffect();

    // Animar la ficha hacia la mano
    tileSprite.animateToHand(slotPos.x, slotPos.y, () => {
      // Eliminar sprite del tablero
      tileSprite.destroy();
      this.tileSprites.delete(originalTile.id);

      // Añadir a la mano (el estado ya está actualizado)
      this.handManager.addTile(originalTile);

      // Actualizar UI de la mano
      this.gameUI.updateHand(this.handManager.getSlots());

      // Verificar match
      this.checkForMatch();
    });

    // Permitir clicks de otras fichas casi inmediatamente
    this.time.delayedCall(50, () => {
      if (!this.handManager.isFull()) {
        this.isAnimating = false;
      }
    });
  }

  /**
   * Verifica si hay un match en la mano
   */
  private checkForMatch(): void {
    const matchResult = this.handManager.checkMatch();

    if (matchResult.matched) {
      // Delay breve para que se vea la tercera ficha antes del match
      this.time.delayedCall(100, () => {
        // Haptic feedback al hacer trio
        this.triggerHapticFeedback();

        // Animar match
        const matchedIds = matchResult.tiles.map((t) => t.id);
        this.gameUI.animateMatch(matchedIds, () => {
          // Eliminar fichas de la mano
          this.handManager.removeMatchedTiles(matchResult.tiles);

          // Actualizar puntuación
          this.gameState.score += matchResult.scoreGained;
          this.gameUI.updateScore(this.gameState.score);

          // Actualizar UI de la mano
          this.gameUI.updateHand(this.handManager.getSlots());

          // Verificar victoria
          this.checkWinCondition();

          this.isAnimating = false;
        });

        // Reproducir sonido de trio con delay para que coincida con la explosión
        this.time.delayedCall(500, () => {
          SoundManager.playTrio();
        });
      });
    } else {
      // Verificar game over (mano llena sin match)
      if (this.handManager.isFull()) {
        this.handleLoseLife();
      } else {
        this.isAnimating = false;
      }
    }
  }

  /**
   * Actualiza la accesibilidad de las fichas del tablero
   */
  private updateBoardAccessibility(): void {
    // IMPORTANTE: Pasar TODAS las fichas para que el cálculo de bloqueo sea correcto
    // Las fichas isInHand/isMatched serán ignoradas en el cálculo
    BoardGenerator.updateAccessibility(this.gameState.tiles);

    // Actualizar sprites de las fichas que aún están en el tablero
    for (const tile of this.gameState.tiles) {
      if (tile.isInHand || tile.isMatched) continue;

      const sprite = this.tileSprites.get(tile.id);
      if (sprite) {
        sprite.updateState({ isAccessible: tile.isAccessible });
      }
    }
  }

  /**
   * Verifica condición de victoria
   */
  private checkWinCondition(): void {
    // Victoria si no quedan fichas en el tablero y la mano está vacía
    const remainingTiles = this.gameState.tiles.filter(
      (t) => !t.isInHand && !t.isMatched
    );

    if (remainingTiles.length === 0 && this.handManager.isEmpty()) {
      this.gameState.isWin = true;
      this.gameState.isPlaying = false;

      // Bonus por nivel
      const levelBonus =
        this.gameState.currentLevel * GameSettings.rules.bonusPerLevel;
      this.gameState.score += levelBonus;
      this.gameUI.updateScore(this.gameState.score);

      // Parar el timer
      this.gameUI.stopTimer();

      // Mostrar mensaje de victoria
      this.time.delayedCall(500, () => {
        this.gameUI.showWinMessage(() => {
          this.startLevel(this.gameState.currentLevel + 1);
        });
      });
    }
  }

  /**
   * Maneja cuando se acaba el tiempo
   */
  private handleTimeUp(): void {
    if (!this.gameState.isPlaying) return;
    this.handleLoseLife();
  }

  /**
   * Maneja la pérdida de una vida
   */
  private handleLoseLife(): void {
    // Haptic feedback al perder vida
    this.triggerHapticFeedback();

    // Parar el timer inmediatamente
    this.gameUI.stopTimer();

    const hasLivesLeft = this.gameUI.loseLife();

    if (hasLivesLeft) {
      // Mostrar modal Try Again
      this.gameUI.showTryAgainMessage(() => {
        this.startLevel(this.gameState.currentLevel);
      });
    } else {
      // Game over definitivo
      this.gameOver();
    }
  }

  /**
   * Game Over
   */
  private gameOver(): void {
    this.gameState.isGameOver = true;
    this.gameState.isPlaying = false;
    this.isAnimating = false;

    // Parar música
    SoundManager.stopMusic();

    // Enviar puntuación a Farcade - el SDK gestiona el modal de game over
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.singlePlayer?.actions?.gameOver) {
        sdk.singlePlayer.actions.gameOver({ score: this.gameState.score });
      } else if (sdk?.gameOver) {
        sdk.gameOver({ score: this.gameState.score });
      } else if (sdk?.actions?.gameOver) {
        sdk.actions.gameOver({ score: this.gameState.score });
      }
    } catch (e) {
      console.log("Farcade SDK not available");
    }
  }

  /**
   * Dispara haptic feedback si el SDK está disponible
   */
  private triggerHapticFeedback(): void {
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.singlePlayer?.actions?.hapticFeedback) {
        sdk.singlePlayer.actions.hapticFeedback();
      } else if (sdk?.hapticFeedback) {
        sdk.hapticFeedback();
      }
    } catch {
      // SDK no disponible, ignorar
    }
  }

  /**
   * Reinicia el juego desde el nivel 1
   */
  private restartGame(): void {
    this.gameState.score = 0;
    this.gameUI.updateScore(0);
    this.gameUI.resetLives();
    this.startLevel(1);
  }

  /**
   * Power-up: Undo - Devuelve la última ficha de la mano al tablero con animación
   */
  private handleUndo(): boolean {
    if (!this.gameState.isPlaying || this.isAnimating) return false;

    // Obtener el índice del slot antes de remover (para saber desde dónde animar)
    const currentSlotIndex = this.handManager.getTileCount() - 1;
    if (currentSlotIndex < 0) return false;

    // Obtener la posición del slot en la mano (punto de partida de la animación)
    const slotPos = this.gameUI.getSlotPosition(currentSlotIndex);

    // Obtener la última ficha de la mano
    const tile = this.handManager.removeLastTile();
    if (!tile) return false;

    // Encontrar la ficha original en gameState para obtener su posición
    const originalTile = this.gameState.tiles.find((t) => t.id === tile.id);
    if (!originalTile) return false;

    // Restaurar estado de la ficha
    originalTile.isInHand = false;
    originalTile.isAccessible = true;

    this.isAnimating = true;

    // Calcular posición destino en el tablero
    const targetPos = BoardGenerator.calculateScreenPosition(
      originalTile.position,
      this.currentLevelConfig,
      this.boardBounds
    );

    // Determinar si debe mostrar el volumen 3D inferior
    const showBottom3D = !this.hasAdjacentTileBelow(originalTile);

    // Crear el sprite de la ficha EN la posición del slot (donde está ahora)
    const tileSprite = new Tile3D(
      this,
      slotPos.x,
      slotPos.y,
      originalTile,
      showBottom3D
    );
    tileSprite.on("tile-clicked", (state: TileState) => {
      this.onTileClicked(state);
    });
    this.tileSprites.set(originalTile.id, tileSprite);
    this.boardContainer.add(tileSprite);

    // Configurar profundidad correcta
    tileSprite.setLayerDepth(originalTile.position.z);

    // Animar desde la mano hasta la posición original en el tablero
    this.tweens.add({
      targets: tileSprite,
      x: targetPos.x,
      y: targetPos.y,
      duration: 350,
      ease: "Back.easeOut",
      onComplete: () => {
        this.isAnimating = false;

        // Actualizar accesibilidad
        this.updateBoardAccessibility();
        this.updateTiles3DEffect();
      },
    });

    // Actualizar UI de la mano inmediatamente
    this.gameUI.updateHand(this.handManager.getSlots());

    // Reproducir sonido
    SoundManager.playCardToHand();

    return true;
  }

  /**
   * Power-up: Clock - Pausa el timer para este nivel
   */
  private handlePauseTime(): boolean {
    if (!this.gameState.isPlaying) return false;

    // Pausar el timer permanentemente para este nivel
    const success = this.gameUI.pauseTimer();

    if (success) {
      SoundManager.playCardToHand();
    }

    return success;
  }

  /**
   * Power-up: Hint - Encuentra y resuelve automáticamente un trío
   * SIEMPRE funciona: busca en TODAS las fichas del tablero (no solo accesibles)
   * y ejecuta un match directo
   */
  private handleHint(): boolean {
    if (!this.gameState.isPlaying || this.isAnimating) {
      return false;
    }

    // Obtener fichas en el acumulador
    const handTiles = this.handManager.getTilesInHand();

    // Contar fichas por tipo en el acumulador
    const handTypeCounts = new Map<number, TileState[]>();
    for (const tile of handTiles) {
      const existing = handTypeCounts.get(tile.type) || [];
      existing.push(tile);
      handTypeCounts.set(tile.type, existing);
    }

    // Buscar TODAS las fichas del tablero (no solo accesibles)
    const allBoardTiles = this.gameState.tiles.filter(
      (t) => !t.isInHand && !t.isMatched
    );

    // Agrupar fichas del tablero por tipo
    const boardTypeCounts = new Map<number, TileState[]>();
    for (const tile of allBoardTiles) {
      const existing = boardTypeCounts.get(tile.type) || [];
      existing.push(tile);
      boardTypeCounts.set(tile.type, existing);
    }

    let matchTiles: TileState[] | null = null;

    // Prioridad 1: 2 en mano + 1 del tablero
    for (const [type, tilesInHand] of handTypeCounts) {
      if (tilesInHand.length >= 2) {
        const boardTiles = boardTypeCounts.get(type) || [];
        if (boardTiles.length >= 1) {
          matchTiles = [...tilesInHand.slice(0, 2), boardTiles[0]];
          break;
        }
      }
    }

    // Prioridad 2: 1 en mano + 2 del tablero
    if (!matchTiles) {
      for (const [type, tilesInHand] of handTypeCounts) {
        if (tilesInHand.length >= 1) {
          const boardTiles = boardTypeCounts.get(type) || [];
          if (boardTiles.length >= 2) {
            matchTiles = [tilesInHand[0], boardTiles[0], boardTiles[1]];
            break;
          }
        }
      }
    }

    // Prioridad 3: 3 del tablero (cualquier trío disponible)
    if (!matchTiles) {
      for (const [_type, boardTiles] of boardTypeCounts) {
        if (boardTiles.length >= 3) {
          matchTiles = [boardTiles[0], boardTiles[1], boardTiles[2]];
          break;
        }
      }
    }

    // Si encontramos un trío, ejecutarlo directamente
    if (matchTiles && matchTiles.length === 3) {
      this.performDirectMatch(matchTiles);
      SoundManager.playCardToHand();
      return true;
    }

    // No debería llegar aquí si el juego está bien diseñado
    // (siempre hay tríos disponibles)
    return false;
  }

  /**
   * Realiza un match directo sin pasar las fichas por el acumulador
   * Usado por el power-up de pista - funciona con CUALQUIER ficha del tablero
   */
  private performDirectMatch(tiles: TileState[]): void {
    if (tiles.length !== 3) return;

    this.isAnimating = true;

    // Separar fichas del tablero y del acumulador
    const boardTiles = tiles.filter((t) => !t.isInHand);
    const handTiles = tiles.filter((t) => t.isInHand);

    // Marcar todas como matched
    tiles.forEach((tile) => {
      tile.isMatched = true;
    });

    // Si hay fichas del acumulador, quitarlas del HandManager
    if (handTiles.length > 0) {
      this.handManager.removeMatchedTiles(handTiles);
      this.gameUI.updateHand(this.handManager.getSlots());
    }

    // Actualizar accesibilidad inmediatamente
    this.updateBoardAccessibility();
    this.updateTiles3DEffect();

    // Recopilar sprites del tablero para animar
    const boardSprites: Phaser.GameObjects.Container[] = [];
    boardTiles.forEach((tile) => {
      const sprite = this.tileSprites.get(tile.id);
      if (sprite) {
        // Sacar el sprite del boardContainer y añadirlo a la escena directamente
        this.boardContainer.remove(sprite);
        this.add.existing(sprite);
        // Ahora sí podemos traerlo al frente
        sprite.setDepth(5000 + boardSprites.length);
        boardSprites.push(sprite);
        this.tileSprites.delete(tile.id);
      }
    });

    // Calcular punto central para la animación (centro de la pantalla, arriba del acumulador)
    const centerX = 360;
    const centerY = 900;

    // Si hay sprites para animar
    if (boardSprites.length > 0) {
      let animationsCompleted = 0;
      const totalAnimations = boardSprites.length;

      boardSprites.forEach((sprite, index) => {
        const delay = index * 100;

        // Fase 1: Mover hacia el centro con efecto de elevación
        this.tweens.add({
          targets: sprite,
          x: centerX + (index - (boardSprites.length - 1) / 2) * 60,
          y: centerY,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 350,
          delay: delay,
          ease: "Cubic.easeOut",
          onComplete: () => {
            // Fase 2: Converger al centro exacto
            this.tweens.add({
              targets: sprite,
              x: centerX,
              y: centerY - 30,
              rotation: (index - 1) * 0.2,
              scaleX: 1.0,
              scaleY: 1.0,
              duration: 250,
              ease: "Sine.easeInOut",
              onComplete: () => {
                animationsCompleted++;

                // Cuando todas convergen, hacer explosión
                if (animationsCompleted === totalAnimations) {
                  // Crear efecto de explosión
                  this.gameUI.createMatchExplosion(centerX, centerY - 30);

                  // Desvanecer sprites
                  boardSprites.forEach((s) => {
                    this.tweens.add({
                      targets: s,
                      scaleX: 0,
                      scaleY: 0,
                      alpha: 0,
                      rotation: s.rotation + 0.5,
                      duration: 200,
                      ease: "Cubic.easeIn",
                      onComplete: () => {
                        s.destroy();
                      },
                    });
                  });

                  // Actualizar puntuación
                  this.gameState.score += GameSettings.rules.scorePerMatch;
                  this.gameUI.updateScore(this.gameState.score);

                  // Reproducir sonido
                  SoundManager.playTrio();

                  // Verificar victoria
                  this.time.delayedCall(300, () => {
                    this.checkWinCondition();
                    this.isAnimating = false;
                  });
                }
              },
            });
          },
        });
      });
    } else {
      // No hay sprites del tablero - solo fichas de la mano
      // Actualizar puntuación y completar
      this.gameState.score += GameSettings.rules.scorePerMatch;
      this.gameUI.updateScore(this.gameState.score);
      this.gameUI.createMatchExplosion(centerX, centerY - 30);
      SoundManager.playTrio();
      this.checkWinCondition();
      this.isAnimating = false;
    }
  }

  /**
   * Verifica si el usuario tiene los temas exclusivos comprados
   */
  private checkExclusiveThemes(): void {
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.hasItem) {
        this.hasExclusiveThemes = sdk.hasItem("exclusive-themes");
        this.hasJustATip = sdk.hasItem("just-a-tip");
      }
    } catch {
      this.hasExclusiveThemes = false;
      this.hasJustATip = false;
    }
  }

  /**
   * Inicia el proceso de compra de temas exclusivos
   */
  private async purchaseExclusiveThemes(): Promise<void> {
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.purchase) {
        const result = await sdk.purchase({ item: "exclusive-themes" });
        if (result.success) {
          this.hasExclusiveThemes = true;
          // Cerrar el overlay de compra si existe
          this.closePurchaseOverlay();
          // Ahora sí cambiar el tema
          this.applyThemeChange();
        }
      }
    } catch (error) {
      console.error("Purchase error:", error);
    }
  }

  // Overlay de compra de temas
  private purchaseOverlay: Phaser.GameObjects.Container | null = null;

  /**
   * Muestra el overlay de compra de temas exclusivos
   */
  private showPurchaseOverlay(): void {
    if (this.purchaseOverlay) return;

    const { canvas } = GameSettings;

    // Pausar el tiempo
    this.gameUI.pauseTimer();

    // Contenedor principal
    this.purchaseOverlay = this.add.container(0, 0);
    this.purchaseOverlay.setDepth(3000);

    // Overlay muy oscuro que bloquea clicks
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.95);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, canvas.width, canvas.height),
      Phaser.Geom.Rectangle.Contains
    );
    overlay.on("pointerdown", () => {}); // Bloquear clicks
    this.purchaseOverlay.add(overlay);

    const fontFamily = "'Fredoka One', Arial Black, sans-serif";
    const centerX = canvas.width / 2;

    // Título
    const title = this.add.text(centerX, 380, "EXCLUSIVE THEMES", {
      fontSize: "48px",
      fontFamily: fontFamily,
      color: "#B7FF00",
      stroke: "#000000",
      strokeThickness: 8,
    });
    title.setOrigin(0.5);
    this.purchaseOverlay.add(title);

    // Descripción
    const desc = this.add.text(
      centerX,
      470,
      "Unlock 4 beautiful themes\nto customize your game!",
      {
        fontSize: "28px",
        fontFamily: fontFamily,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      }
    );
    desc.setOrigin(0.5);
    this.purchaseOverlay.add(desc);

    // Botón UNLOCK
    const btnWidth = 280;
    const btnHeight = 70;
    const unlockBtn = this.add.container(centerX, 600);
    const unlockBg = this.add.graphics();
    unlockBg.fillStyle(0x2d7d32, 1);
    unlockBg.fillRoundedRect(-btnWidth / 2, 10, btnWidth, btnHeight, 14);
    unlockBg.fillStyle(0x4caf50, 1);
    unlockBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    unlockBg.lineStyle(3, 0x2d7d32, 1);
    unlockBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    unlockBtn.add(unlockBg);

    const unlockText = this.add.text(0, btnHeight / 2, "UNLOCK", {
      fontSize: "36px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: "#2d7d32",
      strokeThickness: 4,
    });
    unlockText.setOrigin(0.5);
    unlockBtn.add(unlockText);

    unlockBtn.setSize(btnWidth, btnHeight + 10);
    unlockBtn.setInteractive({ useHandCursor: true });

    unlockBtn.on("pointerover", () => {
      this.tweens.add({
        targets: unlockBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    unlockBtn.on("pointerout", () => {
      this.tweens.add({
        targets: unlockBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    unlockBtn.on("pointerdown", () => {
      this.purchaseExclusiveThemes();
    });

    this.purchaseOverlay.add(unlockBtn);

    // Badge de precio pegado debajo del botón UNLOCK
    const priceBadge = this.add.graphics();
    const badgeWidth = 160;
    const badgeHeight = 40;
    priceBadge.fillStyle(0xffd700, 1);
    priceBadge.fillRoundedRect(
      centerX - badgeWidth / 2,
      660,
      badgeWidth,
      badgeHeight,
      10
    );
    priceBadge.lineStyle(2, 0xb8860b, 1);
    priceBadge.strokeRoundedRect(
      centerX - badgeWidth / 2,
      660,
      badgeWidth,
      badgeHeight,
      10
    );
    this.purchaseOverlay.add(priceBadge);

    const priceText = this.add.text(centerX, 680, "100 credits", {
      fontSize: "24px",
      fontFamily: fontFamily,
      color: "#5a4000",
    });
    priceText.setOrigin(0.5);
    this.purchaseOverlay.add(priceText);

    // Botón BACK
    const backBtn = this.add.container(centerX, 780);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x444444, 1);
    backBg.fillRoundedRect(-btnWidth / 2, 10, btnWidth, btnHeight, 14);
    backBg.fillStyle(0x666666, 1);
    backBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    backBg.lineStyle(3, 0x444444, 1);
    backBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    backBtn.add(backBg);

    const backText = this.add.text(0, btnHeight / 2, "BACK", {
      fontSize: "36px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: "#333333",
      strokeThickness: 4,
    });
    backText.setOrigin(0.5);
    backBtn.add(backText);

    backBtn.setSize(btnWidth, btnHeight + 10);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on("pointerover", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    backBtn.on("pointerout", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    backBtn.on("pointerdown", () => {
      this.closePurchaseOverlay();
    });

    this.purchaseOverlay.add(backBtn);

    // Fade in
    this.purchaseOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.purchaseOverlay,
      alpha: 1,
      duration: 200,
      ease: "Power2",
    });
  }

  /**
   * Cierra el overlay de compra y reanuda el juego
   */
  private closePurchaseOverlay(): void {
    if (!this.purchaseOverlay) return;

    this.tweens.add({
      targets: this.purchaseOverlay,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.purchaseOverlay?.destroy();
        this.purchaseOverlay = null;
        // Reanudar el tiempo
        this.gameUI.resumeTimer();
      },
    });
  }

  // Overlay de tip
  private tipOverlay: Phaser.GameObjects.Container | null = null;

  /**
   * Muestra el overlay de tip al desarrollador
   */
  private showTipOverlay(): void {
    if (this.tipOverlay) return;

    const { canvas } = GameSettings;

    // Pausar el tiempo
    this.gameUI.pauseTimer();

    // Contenedor principal
    this.tipOverlay = this.add.container(0, 0);
    this.tipOverlay.setDepth(3000);

    // Overlay muy oscuro que bloquea clicks
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.95);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, canvas.width, canvas.height),
      Phaser.Geom.Rectangle.Contains
    );
    overlay.on("pointerdown", () => {}); // Bloquear clicks
    this.tipOverlay.add(overlay);

    const fontFamily = "'Fredoka One', Arial Black, sans-serif";
    const centerX = canvas.width / 2;

    // Título
    const title = this.add.text(centerX, 380, "JUST A TIP", {
      fontSize: "48px",
      fontFamily: fontFamily,
      color: "#B7FF00",
      stroke: "#000000",
      strokeThickness: 8,
    });
    title.setOrigin(0.5);
    this.tipOverlay.add(title);

    // Descripción
    const desc = this.add.text(
      centerX,
      470,
      "In appreciation for the\ncontinued development of the game",
      {
        fontSize: "26px",
        fontFamily: fontFamily,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
      }
    );
    desc.setOrigin(0.5);
    this.tipOverlay.add(desc);

    // Botón UNLOCK (mismo tamaño que el de themes)
    const btnWidth = 280;
    const btnHeight = 70;
    const unlockBtn = this.add.container(centerX, 600);
    const unlockBg = this.add.graphics();
    unlockBg.fillStyle(0x2d7d32, 1);
    unlockBg.fillRoundedRect(-btnWidth / 2, 10, btnWidth, btnHeight, 14);
    unlockBg.fillStyle(0x4caf50, 1);
    unlockBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    unlockBg.lineStyle(3, 0x2d7d32, 1);
    unlockBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    unlockBtn.add(unlockBg);

    const unlockText = this.add.text(0, btnHeight / 2, "SUPPORT", {
      fontSize: "36px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: "#2d7d32",
      strokeThickness: 4,
    });
    unlockText.setOrigin(0.5);
    unlockBtn.add(unlockText);

    unlockBtn.setSize(btnWidth, btnHeight + 10);
    unlockBtn.setInteractive({ useHandCursor: true });

    unlockBtn.on("pointerover", () => {
      this.tweens.add({
        targets: unlockBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    unlockBtn.on("pointerout", () => {
      this.tweens.add({
        targets: unlockBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    unlockBtn.on("pointerdown", () => {
      this.purchaseJustATip();
    });

    this.tipOverlay.add(unlockBtn);

    // Badge de precio pegado debajo del botón
    const priceBadge = this.add.graphics();
    const badgeWidth = 160;
    const badgeHeight = 40;
    priceBadge.fillStyle(0xffd700, 1);
    priceBadge.fillRoundedRect(
      centerX - badgeWidth / 2,
      660,
      badgeWidth,
      badgeHeight,
      10
    );
    priceBadge.lineStyle(2, 0xb8860b, 1);
    priceBadge.strokeRoundedRect(
      centerX - badgeWidth / 2,
      660,
      badgeWidth,
      badgeHeight,
      10
    );
    this.tipOverlay.add(priceBadge);

    const priceText = this.add.text(centerX, 680, "500 credits", {
      fontSize: "24px",
      fontFamily: fontFamily,
      color: "#5a4000",
    });
    priceText.setOrigin(0.5);
    this.tipOverlay.add(priceText);

    // Botón BACK
    const backBtn = this.add.container(centerX, 780);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x444444, 1);
    backBg.fillRoundedRect(-btnWidth / 2, 10, btnWidth, btnHeight, 14);
    backBg.fillStyle(0x666666, 1);
    backBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    backBg.lineStyle(3, 0x444444, 1);
    backBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    backBtn.add(backBg);

    const backText = this.add.text(0, btnHeight / 2, "BACK", {
      fontSize: "36px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: "#333333",
      strokeThickness: 4,
    });
    backText.setOrigin(0.5);
    backBtn.add(backText);

    backBtn.setSize(btnWidth, btnHeight + 10);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on("pointerover", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    backBtn.on("pointerout", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    backBtn.on("pointerdown", () => {
      this.closeTipOverlay();
    });

    this.tipOverlay.add(backBtn);

    // Fade in
    this.tipOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.tipOverlay,
      alpha: 1,
      duration: 200,
      ease: "Power2",
    });
  }

  /**
   * Cierra el overlay de tip y reanuda el juego
   */
  private closeTipOverlay(): void {
    if (!this.tipOverlay) return;

    this.tweens.add({
      targets: this.tipOverlay,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.tipOverlay?.destroy();
        this.tipOverlay = null;
        // Reanudar el tiempo
        this.gameUI.resumeTimer();
      },
    });
  }

  /**
   * Inicia el proceso de compra del tip
   */
  private async purchaseJustATip(): Promise<void> {
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.purchase) {
        const result = await sdk.purchase({ item: "just-a-tip" });
        if (result.success) {
          this.hasJustATip = true;
          // Ocultar el botón de tip
          this.gameUI.hideTipButton();
          // Cerrar el overlay
          this.closeTipOverlay();
        }
      }
    } catch (error) {
      console.error("Purchase error:", error);
    }
  }

  /**
   * Maneja el click en el botón de tip
   */
  private handleTip(): void {
    if (!this.hasJustATip) {
      // Si no tiene el item, mostrar overlay de tip
      this.showTipOverlay();
    }
    // Si ya tiene el tip, no hacer nada (o podría mostrar un mensaje de agradecimiento)
  }

  /**
   * Cambia al siguiente tema visual
   */
  private handleThemeChange(): void {
    if (!this.hasExclusiveThemes) {
      // Si no tiene el item, mostrar overlay de compra
      this.showPurchaseOverlay();
      return;
    }

    this.applyThemeChange();
  }

  /**
   * Aplica el cambio de tema visual
   */
  private applyThemeChange(): void {
    cycleTheme();

    // Actualizar fondo
    this.createBackground();

    // Actualizar fichas
    this.tileSprites.forEach((tile) => {
      tile.refreshTexture();
    });

    // Actualizar UI (badges, acumulador, corazones)
    this.gameUI.refreshTheme();
  }

  update(): void {
    // El juego usa principalmente eventos y tweens, no necesita update frame a frame
  }
}
