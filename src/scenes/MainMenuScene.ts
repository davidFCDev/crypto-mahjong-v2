/**
 * MainMenuScene - Pantalla principal del juego
 * Muestra el título estilo cartoon, botón de Start y botón de Style
 */

import GameSettings from "../config/GameSettings";
import {
  getAvailableThemes,
  getCurrentTheme,
  setTheme,
  themes,
} from "../config/Themes";

export class MainMenuScene extends Phaser.Scene {
  private styleModal: Phaser.GameObjects.Container | null = null;
  private hasExclusiveThemes: boolean = false;
  private hasJustATip: boolean = false;
  private styleButton: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: "MainMenuScene" });
  }

  create(): void {
    const { canvas } = GameSettings;
    const centerX = canvas.width / 2;

    // Cargar tema guardado
    this.loadSavedTheme();

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
   * Crea el título del juego con estilo comic/cartoon
   */
  private createCartoonTitle(centerX: number): void {
    // Contenedor para el título completo
    const titleContainer = this.add.container(centerX, 280);

    const fontFamily = "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive";

    // ========== CRYPTO con estilo comic ==========
    this.createComicWord(
      titleContainer,
      "CRYPTO",
      0,
      0,
      100,
      [
        { rotation: -8, scale: 1.1 },
        { rotation: 5, scale: 1.0 },
        { rotation: -3, scale: 1.15 },
        { rotation: 6, scale: 0.95 },
        { rotation: -4, scale: 1.05 },
        { rotation: 7, scale: 1.1 },
      ],
      fontFamily
    );

    // ========== MAHJONG con estilo comic ==========
    this.createComicWord(
      titleContainer,
      "MAHJONG",
      0,
      130,
      110,
      [
        { rotation: 6, scale: 1.05 },
        { rotation: -5, scale: 1.1 },
        { rotation: 4, scale: 0.95 },
        { rotation: -7, scale: 1.15 },
        { rotation: 3, scale: 1.0 },
        { rotation: -4, scale: 1.1 },
        { rotation: 5, scale: 1.05 },
      ],
      fontFamily
    );

    // ========== REMIXED subtítulo ==========
    this.createRemixedSubtitle(titleContainer, 0, 230, fontFamily);
  }

  /**
   * Crea una palabra con estilo comic (cada letra con rotación y escala individual)
   */
  private createComicWord(
    container: Phaser.GameObjects.Container,
    word: string,
    startX: number,
    y: number,
    fontSize: number,
    letterStyles: { rotation: number; scale: number }[],
    fontFamily: string
  ): void {
    const letters = word.split("");
    const letterSpacing = fontSize * 0.72;
    const totalWidth = (letters.length - 1) * letterSpacing;
    const offsetX = startX - totalWidth / 2;

    letters.forEach((letter, index) => {
      const style = letterStyles[index] || { rotation: 0, scale: 1 };
      const x = offsetX + index * letterSpacing;

      // Sombra 3D para cada letra
      for (let i = 6; i > 0; i--) {
        const shadow = this.add.text(x + i * 2, y + i * 2, letter, {
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          color: "#000000",
        });
        shadow.setOrigin(0.5);
        shadow.setRotation(Phaser.Math.DegToRad(style.rotation));
        shadow.setScale(style.scale);
        shadow.setAlpha(i === 6 ? 0.8 : 0.4);
        container.add(shadow);
      }

      // Letra principal
      const letterText = this.add.text(x, y, letter, {
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      });
      letterText.setOrigin(0.5);
      letterText.setRotation(Phaser.Math.DegToRad(style.rotation));
      letterText.setScale(style.scale);
      container.add(letterText);
    });
  }

  /**
   * Crea el subtítulo "REMIXED" en cursiva con estilo comic
   */
  private createRemixedSubtitle(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    fontFamily: string
  ): void {
    const fontSize = 48;
    const word = "REMIXED";
    const letters = word.split("");
    const letterSpacing = fontSize * 0.65;
    const totalWidth = (letters.length - 1) * letterSpacing;
    const offsetX = x - totalWidth / 2;

    // Estilos para cada letra (rotaciones sutiles para estilo comic)
    const letterStyles = [
      { rotation: -4, scale: 1.0 },
      { rotation: 3, scale: 1.05 },
      { rotation: -2, scale: 0.98 },
      { rotation: 4, scale: 1.02 },
      { rotation: -3, scale: 1.0 },
      { rotation: 2, scale: 1.03 },
      { rotation: -4, scale: 1.0 },
    ];

    letters.forEach((letter, index) => {
      const style = letterStyles[index] || { rotation: 0, scale: 1 };
      const letterX = offsetX + index * letterSpacing;

      // Sombra 3D
      for (let i = 4; i > 0; i--) {
        const shadow = this.add.text(letterX + i * 2, y + i * 2, letter, {
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          color: "#000000",
        });
        shadow.setOrigin(0.5);
        shadow.setRotation(Phaser.Math.DegToRad(style.rotation));
        shadow.setScale(style.scale);
        shadow.setAlpha(i === 4 ? 0.6 : 0.3);
        container.add(shadow);
      }

      // Letra principal en verde lima
      const letterText = this.add.text(letterX, y, letter, {
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        color: "#B7FF00",
        stroke: "#000000",
        strokeThickness: 6,
      });
      letterText.setOrigin(0.5);
      letterText.setRotation(Phaser.Math.DegToRad(style.rotation));
      letterText.setScale(style.scale);
      container.add(letterText);
    });
  }

  /**
   * Crea los botones del menú con estilo badge 3D
   */
  private createMenuButtons(centerX: number): void {
    // Verificar si tiene temas exclusivos comprados
    this.checkExclusiveThemes();

    // Botón START - Tonos ROJOS
    this.createBadgeButton(
      centerX,
      640,
      "START",
      0xff3b3b,
      0x8b0000,
      "#5a0000",
      () => {
        this.scene.start("MahjongScene");
      }
    );

    // Botón STYLE - Tonos VERDES (puede estar bloqueado)
    this.createStyleButton(centerX, 800);
  }

  /**
   * Verifica si el usuario tiene los temas exclusivos comprados
   */
  private checkExclusiveThemes(): void {
    try {
      const sdk = (
        window as unknown as {
          FarcadeSDK?: { hasItem: (item: string) => boolean };
        }
      ).FarcadeSDK;
      if (sdk?.hasItem) {
        this.hasExclusiveThemes = sdk.hasItem("exclusive-themes");
        this.hasJustATip = sdk.hasItem("just-a-tip");
      }
    } catch {
      // SDK no disponible, mantener como false
      this.hasExclusiveThemes = false;
      this.hasJustATip = false;
    }
  }

  /**
   * Crea el botón THEME con badge de créditos si no está desbloqueado
   */
  private createStyleButton(centerX: number, y: number): void {
    const mainColor = this.hasExclusiveThemes ? 0x3cb371 : 0x666666;
    const borderColor = this.hasExclusiveThemes ? 0x1a5a1a : 0x444444;
    const textStroke = this.hasExclusiveThemes ? "#0a3a0a" : "#333333";

    this.styleButton = this.createBadgeButton(
      centerX,
      y,
      "THEME",
      mainColor,
      borderColor,
      textStroke,
      () => {
        if (this.hasExclusiveThemes) {
          this.showStyleModal();
        } else {
          this.purchaseExclusiveThemes();
        }
      }
    );

    // Si no tiene temas exclusivos, añadir badge de créditos
    if (!this.hasExclusiveThemes) {
      this.addCreditsBadge(this.styleButton, 100);
    }

    // Crear botón JUST A TIP debajo
    this.createJustATipButton(centerX, y + 180);
  }

  /**
   * Crea el botón JUST A TIP o muestra mensaje de agradecimiento
   */
  private createJustATipButton(centerX: number, y: number): void {
    if (this.hasJustATip) {
      // Mostrar mensaje de agradecimiento
      const thanksText = this.add.text(centerX, y + 35, "Thank you", {
        fontSize: "32px",
        fontFamily: "'Fredoka One', Arial Black, sans-serif",
        color: "#B7FF00",
        stroke: "#000000",
        strokeThickness: 4,
      });
      thanksText.setOrigin(0.5);

      // Obtener nombre del usuario del SDK
      const sdk = (
        window as unknown as {
          FarcadeSDK?: {
            player?: { username?: string; displayName?: string };
          };
        }
      ).FarcadeSDK;

      const playerName = sdk?.player?.displayName || sdk?.player?.username || "Player";

      // Mostrar nombre del usuario debajo
      const nameText = this.add.text(centerX, y + 75, playerName, {
        fontSize: "28px",
        fontFamily: "'Fredoka One', Arial Black, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      });
      nameText.setOrigin(0.5);
    } else {
      // Botón JUST A TIP - Tonos MORADOS
      const tipButton = this.createBadgeButton(
        centerX,
        y,
        "JUST A TIP",
        0x9b59b6,
        0x6c3483,
        "#4a235a",
        () => {
          this.purchaseJustATip();
        }
      );

      // Añadir badge de 500 créditos
      this.addCreditsBadge(tipButton, 500);
    }
  }

  /**
   * Inicia el proceso de compra de just-a-tip
   */
  private async purchaseJustATip(): Promise<void> {
    try {
      const sdk = (
        window as unknown as {
          FarcadeSDK?: {
            purchase: (data: { item: string }) => Promise<{ success: boolean }>;
          };
        }
      ).FarcadeSDK;

      if (sdk?.purchase) {
        const result = await sdk.purchase({ item: "just-a-tip" });
        if (result.success) {
          this.hasJustATip = true;
          // Recrear la escena para mostrar el mensaje de agradecimiento
          this.scene.restart();
        }
      } else {
        console.log("Purchase not available - SDK not loaded");
      }
    } catch (error) {
      console.error("Purchase error:", error);
    }
  }

  /**
   * Añade un badge de créditos al botón
   */
  private addCreditsBadge(
    container: Phaser.GameObjects.Container,
    credits: number
  ): void {
    const badgeWidth = 180;
    const badgeHeight = 42;
    const badgeY = 90 + 18 - 12; // buttonHeight + badgeDepth - overlap

    const badge = this.add.graphics();

    // Fondo del badge (amarillo/dorado)
    badge.fillStyle(0xffd700, 1);
    badge.fillRoundedRect(-badgeWidth / 2, badgeY, badgeWidth, badgeHeight, 10);

    // Borde del badge
    badge.lineStyle(3, 0xb8860b, 1);
    badge.strokeRoundedRect(
      -badgeWidth / 2,
      badgeY,
      badgeWidth,
      badgeHeight,
      10
    );

    container.add(badge);

    // Texto del badge
    const badgeText = this.add.text(
      0,
      badgeY + badgeHeight / 2,
      `${credits} credits`,
      {
        fontSize: "24px",
        fontFamily: "'Fredoka One', Arial Black, sans-serif",
        color: "#5a4000",
      }
    );
    badgeText.setOrigin(0.5);
    container.add(badgeText);
  }

  /**
   * Inicia el proceso de compra de temas exclusivos
   */
  private async purchaseExclusiveThemes(): Promise<void> {
    try {
      const sdk = (
        window as unknown as {
          FarcadeSDK?: {
            purchase: (data: { item: string }) => Promise<{ success: boolean }>;
          };
        }
      ).FarcadeSDK;

      if (sdk?.purchase) {
        const result = await sdk.purchase({ item: "exclusive-themes" });
        if (result.success) {
          this.hasExclusiveThemes = true;
          // Recrear el botón para mostrar el estado desbloqueado
          this.scene.restart();
        }
      } else {
        console.log("Purchase not available - SDK not loaded");
      }
    } catch (error) {
      console.error("Purchase error:", error);
    }
  }

  /**
   * Crea un botón con estilo badge 3D
   */
  private createBadgeButton(
    x: number,
    y: number,
    text: string,
    mainColor: number,
    borderColor: number,
    textStroke: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const buttonWidth = 340;
    const buttonHeight = 90;
    const badgeDepth = 18;
    const borderRadius = 14;

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
      fontSize: "44px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ffffff",
      stroke: textStroke,
      strokeThickness: 7,
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

  /**
   * Muestra el modal de selección de estilos
   */
  private showStyleModal(): void {
    if (this.styleModal) return; // Ya está abierto

    const { canvas } = GameSettings;

    // Contenedor principal del overlay (cubre toda la pantalla)
    this.styleModal = this.add.container(0, 0);
    this.styleModal.setDepth(1000);

    // Overlay oscuro que bloquea interacción con elementos de atrás
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.92);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, canvas.width, canvas.height),
      Phaser.Geom.Rectangle.Contains
    );
    // Evitar que los clicks pasen a los elementos de atrás
    overlay.on("pointerdown", () => {});
    this.styleModal.add(overlay);

    // Título "SELECT THEME"
    const title = this.add.text(canvas.width / 2, 160, "SELECT THEME", {
      fontSize: "52px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    });
    title.setOrigin(0.5);
    this.styleModal.add(title);

    // Crear botones de temas en columna
    const themeNames = getAvailableThemes();
    const buttonWidth = 420;
    const buttonHeight = 95;
    const gap = 30;
    const startY = 290;

    themeNames.forEach((themeName, index) => {
      const theme = themes[themeName];
      const y = startY + index * (buttonHeight + gap);

      this.createThemeButton(
        canvas.width / 2,
        y,
        buttonWidth,
        buttonHeight,
        theme,
        themeName
      );
    });

    // Botón de cerrar
    const closeY = startY + themeNames.length * (buttonHeight + gap) + 40;
    this.createCloseButton(canvas.width / 2, closeY);

    // Animación de entrada
    this.styleModal.setAlpha(0);
    this.tweens.add({
      targets: this.styleModal,
      alpha: 1,
      duration: 200,
      ease: "Power2",
    });
  }

  /**
   * Crea un botón de selección de tema
   */
  private createThemeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    theme: (typeof themes)[string],
    themeName: string
  ): void {
    if (!this.styleModal) return;

    const isSelected = getCurrentTheme().name === themeName;
    const depth3D = 12;

    const container = this.add.container(x, y);
    const bg = this.add.graphics();

    // Cara 3D
    bg.fillStyle(theme.badge.border, 1);
    bg.fillRoundedRect(-width / 2, depth3D, width, height, 14);

    // Cara principal
    bg.fillStyle(theme.badge.main, 1);
    bg.fillRoundedRect(-width / 2, 0, width, height, 14);

    // Borde (sin diferenciación para seleccionado)
    bg.lineStyle(2, theme.badge.border, 1);
    bg.strokeRoundedRect(-width / 2, 0, width, height, 14);

    container.add(bg);

    // Nombre del tema (centrado o desplazado si hay check)
    const textX = isSelected ? -20 : 0;
    const text = this.add.text(textX, height / 2, theme.displayName, {
      fontSize: "28px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#ffffff",
      stroke: theme.badge.textStroke,
      strokeThickness: 5,
    });
    text.setOrigin(0.5);
    container.add(text);

    // Indicador de seleccionado - Check grande y llamativo al lado del texto
    if (isSelected) {
      const checkX = textX + text.width / 2 + 30;
      const check = this.add.text(checkX, height / 2, "✔", {
        fontSize: "36px",
        fontFamily: "Arial",
        color: "#00ff00",
        stroke: "#006600",
        strokeThickness: 4,
      });
      check.setOrigin(0.5);
      container.add(check);
    }

    // Interactividad
    container.setSize(width, height + depth3D);
    container.setInteractive({ useHandCursor: true });

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
      // Seleccionar tema
      setTheme(themeName);
      this.saveThemeToStorage(themeName);
      this.closeStyleModal();
    });

    this.styleModal.add(container);
  }

  /**
   * Crea el botón de cerrar el modal
   */
  private createCloseButton(x: number, y: number): void {
    if (!this.styleModal) return;

    const btnWidth = 200;
    const btnHeight = 55;
    const depth3D = 8;

    const container = this.add.container(x, y);
    const bg = this.add.graphics();

    // Cara 3D (blanco)
    bg.fillStyle(0xcccccc, 1);
    bg.fillRoundedRect(-btnWidth / 2, depth3D, btnWidth, btnHeight, 14);

    // Cara principal (blanco)
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);

    // Borde
    bg.lineStyle(3, 0x333333, 1);
    bg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);

    container.add(bg);

    const text = this.add.text(0, btnHeight / 2, "CLOSE", {
      fontSize: "26px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#333333",
    });
    text.setOrigin(0.5);
    container.add(text);

    container.setSize(btnWidth, btnHeight + depth3D);
    container.setInteractive({ useHandCursor: true });

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
      this.closeStyleModal();
    });

    this.styleModal.add(container);
  }

  /**
   * Cierra el modal de estilos
   */
  private closeStyleModal(): void {
    if (!this.styleModal) return;

    this.tweens.add({
      targets: this.styleModal,
      scale: 0.8,
      alpha: 0,
      duration: 150,
      ease: "Power2",
      onComplete: () => {
        this.styleModal?.destroy();
        this.styleModal = null;
      },
    });
  }

  /**
   * Guarda el tema seleccionado usando el SDK de Farcade
   */
  private saveThemeToStorage(themeName: string): void {
    try {
      // Intentar usar el SDK de Farcade si está disponible
      const sdk = (
        window as unknown as {
          FarcadeSDK?: {
            singlePlayer: {
              actions: {
                saveGameState: (data: {
                  gameState: Record<string, unknown>;
                }) => void;
              };
            };
          };
        }
      ).FarcadeSDK;
      if (sdk?.singlePlayer?.actions?.saveGameState) {
        sdk.singlePlayer.actions.saveGameState({
          gameState: { selectedTheme: themeName },
        });
      }
    } catch (e) {
      // Fallback a localStorage para desarrollo local
      try {
        localStorage.setItem("cryptoMahjong_theme", themeName);
      } catch {
        console.warn("Could not save theme preference");
      }
    }
  }

  /**
   * Carga el tema guardado al iniciar
   */
  private loadSavedTheme(): void {
    try {
      // Intentar usar el SDK de Farcade si está disponible
      const sdk = (
        window as unknown as {
          FarcadeSDK?: { gameState?: { selectedTheme?: string } };
        }
      ).FarcadeSDK;
      if (sdk?.gameState?.selectedTheme) {
        setTheme(sdk.gameState.selectedTheme);
        return;
      }
    } catch {
      // SDK no disponible
    }

    // Fallback a localStorage
    try {
      const savedTheme = localStorage.getItem("cryptoMahjong_theme");
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch {
      // localStorage no disponible
    }
  }
}
