/**
 * MainMenuScene - Pantalla principal del juego
 * Muestra el título, botón de Start y botón de Style
 */

import GameSettings from "../config/GameSettings";
import { getCurrentTheme } from "../config/Themes";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  preload(): void {
    // Aquí se cargará la imagen de fondo cuando se proporcione
  }

  create(): void {
    const { canvas } = GameSettings;
    const theme = getCurrentTheme();
    const centerX = canvas.width / 2;

    // Fondo temporal (será reemplazado por imagen)
    this.createBackground();

    // Título del juego
    this.createTitle(centerX);

    // Botones
    this.createButtons(centerX);
  }

  /**
   * Crea el fondo de la escena
   */
  private createBackground(): void {
    const { canvas } = GameSettings;
    const theme = getCurrentTheme();

    const bg = this.add.graphics();
    bg.fillStyle(theme.background.mainHex, 1);
    bg.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Crea el título del juego
   */
  private createTitle(centerX: number): void {
    // Título principal "Crypto"
    const cryptoText = this.add.text(centerX, 280, "Crypto", {
      fontSize: "72px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: "#1a3a1a",
      strokeThickness: 8,
    });
    cryptoText.setOrigin(0.5);

    // Título secundario "Mahjong"
    const mahjongText = this.add.text(centerX, 370, "Mahjong", {
      fontSize: "84px",
      fontFamily: "Arial Black, Arial",
      color: "#ffd700",
      stroke: "#8b6914",
      strokeThickness: 8,
    });
    mahjongText.setOrigin(0.5);

    // Añadir efecto de sombra al título
    this.tweens.add({
      targets: [cryptoText, mahjongText],
      y: "+=5",
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Crea los botones del menú
   */
  private createButtons(centerX: number): void {
    // Botón START
    this.createButton(centerX, 600, "START", () => {
      this.scene.start("MahjongScene");
    });

    // Botón STYLE (sin funcionalidad por ahora)
    this.createButton(centerX, 720, "STYLE", () => {
      // TODO: Implementar selector de temas
      console.log("Style button clicked - functionality coming soon");
    });
  }

  /**
   * Crea un botón estilizado
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const theme = getCurrentTheme();
    const buttonWidth = 280;
    const buttonHeight = 70;
    const cornerRadius = 20;

    const container = this.add.container(x, y);

    // Sombra del botón
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(
      -buttonWidth / 2 + 4,
      -buttonHeight / 2 + 6,
      buttonWidth,
      buttonHeight,
      cornerRadius
    );
    container.add(shadow);

    // Fondo del botón (profundidad 3D)
    const depth = this.add.graphics();
    depth.fillStyle(theme.badge.border, 1);
    depth.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2 + 6,
      buttonWidth,
      buttonHeight,
      cornerRadius
    );
    container.add(depth);

    // Fondo principal del botón
    const bg = this.add.graphics();
    bg.fillStyle(theme.badge.main, 1);
    bg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      cornerRadius
    );
    bg.lineStyle(3, theme.badge.border, 1);
    bg.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      cornerRadius
    );
    container.add(bg);

    // Texto del botón
    const buttonText = this.add.text(0, 0, text, {
      fontSize: "32px",
      fontFamily: "Arial Black, Arial",
      color: "#ffffff",
      stroke: theme.badge.textStroke,
      strokeThickness: 4,
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // Hacer interactivo
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive({ useHandCursor: true });

    // Efectos hover
    container.on("pointerover", () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    container.on("pointerout", () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    container.on("pointerdown", () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        ease: "Power2",
        onComplete: () => {
          onClick();
        },
      });
    });

    return container;
  }
}
