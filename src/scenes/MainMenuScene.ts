/**
 * MainMenuScene - Pantalla principal del juego
 * Muestra el título MATCH 3, botón START y fondo
 */

import GameSettings from "../config/GameSettings";
import { getCurrentTheme } from "../config/Themes";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  create(): void {
    const { canvas } = GameSettings;
    const centerX = canvas.width / 2;

    // Fondo
    this.createBackground();

    // Título del juego "MATCH 3"
    this.createTitle(centerX);

    // Botón START
    this.createStartButton(centerX);
  }

  /**
   * Crea el fondo de la escena
   */
  private createBackground(): void {
    const { canvas } = GameSettings;

    // Intentar cargar imagen de fondo, si no existe usar color sólido
    if (this.textures.exists("menu-bg")) {
      const bg = this.add.image(canvas.width / 2, canvas.height / 2, "menu-bg");
      bg.setDisplaySize(canvas.width, canvas.height);
    } else {
      // Fondo degradado como fallback
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
      bg.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Crea el título "MATCH 3" con el 3 más grande
   */
  private createTitle(centerX: number): void {
    const fontFamily = "'Luckiest Guy', 'Comic Sans MS', cursive";
    const titleY = 350;

    // Contenedor para el título
    const titleContainer = this.add.container(centerX, titleY);

    // "MATCH" - letras con estilo cartoon
    const matchText = this.add.text(-60, 0, "MATCH", {
      fontSize: "120px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 12,
    });
    matchText.setOrigin(0.5);

    // Sombra para MATCH
    const matchShadow = this.add.text(-60 + 6, 6, "MATCH", {
      fontSize: "120px",
      fontFamily: fontFamily,
      color: "#000000",
    });
    matchShadow.setOrigin(0.5);
    matchShadow.setAlpha(0.5);

    // "3" - más grande y con color destacado
    const threeText = this.add.text(180, -20, "3", {
      fontSize: "180px",
      fontFamily: fontFamily,
      color: "#ff6b6b",
      stroke: "#000000",
      strokeThickness: 14,
    });
    threeText.setOrigin(0.5);

    // Sombra para el 3
    const threeShadow = this.add.text(180 + 8, -20 + 8, "3", {
      fontSize: "180px",
      fontFamily: fontFamily,
      color: "#000000",
    });
    threeShadow.setOrigin(0.5);
    threeShadow.setAlpha(0.5);

    // Añadir en orden (sombras primero)
    titleContainer.add(matchShadow);
    titleContainer.add(threeShadow);
    titleContainer.add(matchText);
    titleContainer.add(threeText);

    // Animación sutil del 3
    this.tweens.add({
      targets: threeText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Crea el botón START
   */
  private createStartButton(centerX: number): void {
    const theme = getCurrentTheme();
    const fontFamily = "'Luckiest Guy', 'Comic Sans MS', cursive";
    const buttonY = 700;
    const buttonWidth = 280;
    const buttonHeight = 80;
    const depth3D = 12;

    const container = this.add.container(centerX, buttonY);

    const bg = this.add.graphics();

    // Cara 3D (más oscura)
    bg.fillStyle(theme.badge.border, 1);
    bg.fillRoundedRect(
      -buttonWidth / 2,
      depth3D,
      buttonWidth,
      buttonHeight,
      16,
    );

    // Cara principal
    bg.fillStyle(theme.badge.main, 1);
    bg.fillRoundedRect(-buttonWidth / 2, 0, buttonWidth, buttonHeight, 16);

    // Borde
    bg.lineStyle(3, theme.badge.border, 1);
    bg.strokeRoundedRect(-buttonWidth / 2, 0, buttonWidth, buttonHeight, 16);

    container.add(bg);

    // Texto START
    const buttonText = this.add.text(0, buttonHeight / 2, "START", {
      fontSize: "52px",
      fontFamily: fontFamily,
      color: "#ffffff",
      stroke: theme.badge.textStroke,
      strokeThickness: 6,
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // Hacer interactivo
    container.setSize(buttonWidth, buttonHeight + depth3D);
    container.setInteractive({ useHandCursor: true });

    // Efectos hover
    container.on("pointerover", () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.08,
        scaleY: 1.08,
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
        y: buttonY + 4,
        duration: 50,
        ease: "Power2",
      });
    });

    container.on("pointerup", () => {
      this.tweens.add({
        targets: container,
        y: buttonY,
        duration: 50,
        ease: "Power2",
        onComplete: () => {
          // Ir directamente al juego
          this.scene.start("MahjongScene");
        },
      });
    });
  }
}
