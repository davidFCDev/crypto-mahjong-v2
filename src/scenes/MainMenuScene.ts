/**
 * MainMenuScene - Pantalla principal del juego
 * Muestra el título estilo cartoon, botón de Start y botón de Style
 */

import GameSettings from "../config/GameSettings";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  preload(): void {
    // Cargar imagen de fondo
    this.load.image(
      "menu-bg",
      "https://remix.gg/blob/zS0QCi0PfUjO/mahjong-xLbaEqVFKWEylPL92Zn4ScyqpnczG8.webp?w5dj"
    );
  }

  create(): void {
    const { canvas } = GameSettings;
    const centerX = canvas.width / 2;

    // Fondo con imagen
    this.createBackground();

    // Título del juego estilo cartoon
    this.createCartoonTitle(centerX);

    // Botones estilo badge 3D
    this.createMenuButtons(centerX);
  }

  /**
   * Crea el fondo de la escena con imagen
   */
  private createBackground(): void {
    const { canvas } = GameSettings;

    // Imagen de fondo
    const bg = this.add.image(canvas.width / 2, canvas.height / 2, "menu-bg");
    bg.setDisplaySize(canvas.width, canvas.height);
  }

  /**
   * Crea el título del juego con estilo cartoon
   */
  private createCartoonTitle(centerX: number): void {
    // Contenedor para el título completo
    const titleContainer = this.add.container(centerX, 320);

    // "CRYPTO" - En ROJO
    const cryptoShadow = this.add.text(4, 4, "CRYPTO", {
      fontSize: "78px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#000000",
    });
    cryptoShadow.setOrigin(0.5);
    cryptoShadow.setAlpha(0.3);
    titleContainer.add(cryptoShadow);

    const cryptoText = this.add.text(0, 0, "CRYPTO", {
      fontSize: "78px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ff3b3b",
      stroke: "#8b0000",
      strokeThickness: 10,
    });
    cryptoText.setOrigin(0.5);
    titleContainer.add(cryptoText);

    // "MAHJONG" - En VERDE
    const mahjongShadow = this.add.text(4, 104, "MAHJONG", {
      fontSize: "88px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#000000",
    });
    mahjongShadow.setOrigin(0.5);
    mahjongShadow.setAlpha(0.3);
    titleContainer.add(mahjongShadow);

    const mahjongText = this.add.text(0, 100, "MAHJONG", {
      fontSize: "88px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#3cb371",
      stroke: "#1a5a1a",
      strokeThickness: 10,
    });
    mahjongText.setOrigin(0.5);
    titleContainer.add(mahjongText);

    // Animación suave de flotación
    this.tweens.add({
      targets: titleContainer,
      y: 315,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * Crea los botones del menú con estilo badge 3D
   */
  private createMenuButtons(centerX: number): void {
    // Botón START
    this.createBadgeButton(centerX, 620, "START", () => {
      this.scene.start("MahjongScene");
    });

    // Botón STYLE (sin funcionalidad por ahora)
    this.createBadgeButton(centerX, 750, "STYLE", () => {
      // TODO: Implementar selector de temas
      console.log("Style button clicked - functionality coming soon");
    });
  }

  /**
   * Crea un botón con estilo badge 3D en ROJO
   */
  private createBadgeButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const buttonWidth = 280;
    const buttonHeight = 75;
    const badgeDepth = 16;
    const borderRadius = 12;

    // Colores rojos llamativos
    const mainColor = 0xe74c3c; // Rojo brillante
    const borderColor = 0xc0392b; // Rojo oscuro
    const textStroke = "#7b1a1a";

    const container = this.add.container(x, y);

    const bg = this.add.graphics();

    // Cara inferior (volumen 3D)
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -buttonWidth / 2,
      badgeDepth,
      buttonWidth,
      buttonHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -buttonWidth / 2,
      badgeDepth,
      buttonWidth,
      buttonHeight,
      borderRadius
    );

    // Fondo del botón (cara principal)
    bg.fillStyle(mainColor, 1);
    bg.fillRoundedRect(
      -buttonWidth / 2,
      0,
      buttonWidth,
      buttonHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -buttonWidth / 2,
      0,
      buttonWidth,
      buttonHeight,
      borderRadius
    );

    container.add(bg);

    // Texto del botón
    const buttonText = this.add.text(0, buttonHeight / 2, text, {
      fontSize: "38px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ffffff",
      stroke: textStroke,
      strokeThickness: 4,
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // Hacer interactivo
    container.setSize(buttonWidth, buttonHeight + badgeDepth);
    container.setInteractive({ useHandCursor: true });

    // Efectos hover y click
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
        y: y + 4,
        duration: 50,
        ease: "Power2",
      });
    });

    container.on("pointerup", () => {
      this.tweens.add({
        targets: container,
        y: y,
        duration: 50,
        ease: "Power2",
        onComplete: () => {
          onClick();
        },
      });
    });

    return container;
  }

  /**
   * Oscurece un color hexadecimal
   */
  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((color & 0xff) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }
}
