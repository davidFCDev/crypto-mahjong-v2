/**
 * GameUI - Componente de interfaz de usuario del juego
 * Diseño minimalista con badge de score
 */

import GameSettings from "../config/GameSettings";
import { TILE_COLORS, type HandSlot, type TileState } from "../types";

// Callbacks para los power-ups
export interface PowerUpCallbacks {
  onUndo?: () => boolean; // Retorna true si se pudo hacer undo
  onPauseTime?: () => boolean; // Retorna true si se pausó
  onHint?: () => boolean; // Retorna true si se encontró un hint
}

export class GameUI extends Phaser.GameObjects.Container {
  // Badge de score
  private scoreBadge!: Phaser.GameObjects.Container;
  private scoreText!: Phaser.GameObjects.Text;

  // Badge de nivel
  private levelBadge!: Phaser.GameObjects.Container;
  private levelText!: Phaser.GameObjects.Text;

  // Badge de tiempo
  private timeBadge!: Phaser.GameObjects.Container;
  private timeText!: Phaser.GameObjects.Text;
  private timeRemaining: number = 60;
  private timerEvent?: Phaser.Time.TimerEvent;
  private levelStartTime: number = 60; // Tiempo inicial del nivel para calcular duración
  private levelStartScore: number = 0; // Score al inicio del nivel

  // Sistema de vidas
  private lives: number = 2;
  private heartContainers: Phaser.GameObjects.Container[] = [];

  // Hand elements
  private handBg!: Phaser.GameObjects.Graphics;
  private handSlots: Phaser.GameObjects.Container[] = [];
  private handTileSprites: Map<string, Phaser.GameObjects.Container> =
    new Map();

  // Power-up buttons
  private undoButton!: Phaser.GameObjects.Container;
  private clockButton!: Phaser.GameObjects.Container;
  private keyButton!: Phaser.GameObjects.Container;
  private undoUsesLeft: number = 3;
  private clockUsesLeft: number = 1;
  private keyUsesLeft: number = 2;
  private undoCountText!: Phaser.GameObjects.Text;
  private clockCountText!: Phaser.GameObjects.Text;
  private keyCountText!: Phaser.GameObjects.Text;
  private powerUpCallbacks: PowerUpCallbacks = {};

  // State
  private currentScore: number = 0;
  private currentLevel: number = 1;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createLevelBadge();
    this.createScoreBadge();
    this.createLivesDisplay();
    this.createTimeBadge();
    this.createPowerUpButtons();
    this.createHand();

    scene.add.existing(this);
    this.setDepth(1000);
  }

  /**
   * Configura los callbacks de los power-ups
   */
  public setPowerUpCallbacks(callbacks: PowerUpCallbacks): void {
    this.powerUpCallbacks = callbacks;
  }

  /**
   * Crea el badge de nivel - A la izquierda del score
   */
  private createLevelBadge(): void {
    const { canvas, ui, hand } = GameSettings;

    // Calcular posición basada en el ancho del acumulador
    const totalSlotWidth =
      hand.maxSlots * (hand.slotWidth + hand.slotPadding) - hand.slotPadding;
    const handWidth = totalSlotWidth + 30;
    const handStartX = (canvas.width - handWidth) / 2;

    const badgeWidth = 110; // Más ancho para niveles de 2 dígitos (Lv.99)
    // Posicionar al inicio del acumulador (centrado del badge)
    const badgeX = handStartX + badgeWidth / 2;

    this.levelBadge = this.scene.add.container(badgeX, 55);
    const badgeHeight = 75; // Misma altura que score
    const badgeDepth = 16;
    const borderRadius = 12;

    const bg = this.scene.add.graphics();

    // Mismo color que el acumulador
    const badgeColor = (ui.colors as any).badge || 0x5cb85c;
    const borderColor = (ui.colors as any).badgeBorder || 0x4ca84c;

    // Cara inferior (volumen 3D)
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -badgeWidth / 2,
      badgeDepth,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -badgeWidth / 2,
      badgeDepth,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Fondo del badge (cara principal)
    bg.fillStyle(badgeColor, 1);
    bg.fillRoundedRect(
      -badgeWidth / 2,
      0,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -badgeWidth / 2,
      0,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    this.levelBadge.add(bg);

    // Texto del nivel
    this.levelText = this.scene.add.text(0, badgeHeight / 2, "Lv.1", {
      fontSize: "32px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ffffff",
      stroke: "#1a3a1a",
      strokeThickness: 3,
    });
    this.levelText.setOrigin(0.5);
    this.levelBadge.add(this.levelText);

    this.add(this.levelBadge);
  }

  /**
   * Crea el badge de score - Diseño limpio con efecto 3D
   */
  private createScoreBadge(): void {
    const { canvas, ui } = GameSettings;

    this.scoreBadge = this.scene.add.container(canvas.width / 2, 55);

    const badgeWidth = 260; // Más ancho para scores de 6 dígitos (500.000)
    const badgeHeight = 75;
    const badgeDepth = 16; // Profundidad 3D
    const borderRadius = 12; // Esquinas redondeadas

    const bg = this.scene.add.graphics();

    // Mismo color que el acumulador
    const badgeColor = (ui.colors as any).badge || 0x5cb85c;
    const borderColor = (ui.colors as any).badgeBorder || 0x4ca84c;

    // Cara inferior (volumen 3D)
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -badgeWidth / 2,
      badgeDepth,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -badgeWidth / 2,
      badgeDepth,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Fondo del badge (cara principal)
    bg.fillStyle(badgeColor, 1);
    bg.fillRoundedRect(
      -badgeWidth / 2,
      0,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -badgeWidth / 2,
      0,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    this.scoreBadge.add(bg);

    // Solo el número del score
    this.scoreText = this.scene.add.text(0, badgeHeight / 2, "0", {
      fontSize: "42px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ffffff",
      stroke: "#1a3a1a",
      strokeThickness: 4,
    });
    this.scoreText.setOrigin(0.5);
    this.scoreBadge.add(this.scoreText);

    this.add(this.scoreBadge);
  }

  /**
   * Crea el display de vidas (corazones) - Entre el score y el tablero
   */
  private createLivesDisplay(): void {
    const { canvas } = GameSettings;

    const heartSpacing = 10;
    const y = 175; // Debajo del score badge y antes del tablero

    for (let i = 0; i < this.lives; i++) {
      const heartContainer = this.scene.add.container(0, y);

      // Usar símbolo de corazón ♥ con borde destacado
      const heart = this.scene.add.text(0, 0, "♥", {
        fontFamily: "Arial",
        fontSize: "56px",
        color: "#e74c3c",
        stroke: "#8b0000",
        strokeThickness: 5,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 4,
          fill: true,
        },
      });
      heart.setOrigin(0.5);

      heartContainer.add(heart);
      this.heartContainers.push(heartContainer);
      this.add(heartContainer);
    }

    // Posicionar los corazones centrados
    this.repositionHearts();
  }

  /**
   * Reposiciona los corazones centrados horizontalmente
   */
  private repositionHearts(): void {
    const { canvas } = GameSettings;
    const heartSpacing = 12;
    const heartWidth = 45;
    const visibleHearts = this.heartContainers.filter((h) => h.visible);
    const totalWidth =
      visibleHearts.length * heartWidth +
      (visibleHearts.length - 1) * heartSpacing;
    const startX = canvas.width / 2 - totalWidth / 2 + heartWidth / 2;

    visibleHearts.forEach((heart, i) => {
      heart.x = startX + i * (heartWidth + heartSpacing);
    });
  }

  /**
   * Pierde una vida. Retorna true si aún quedan vidas, false si game over
   */
  public loseLife(): boolean {
    if (this.lives <= 0) return false;

    this.lives--;

    // Cambiar el corazón a vacío (solo borde)
    const heartToLose = this.heartContainers[this.lives];
    if (heartToLose) {
      const heartText = heartToLose.getAt(0) as Phaser.GameObjects.Text;
      if (heartText) {
        // Animar el corazón sacudiéndose
        this.scene.tweens.add({
          targets: heartToLose,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 100,
          yoyo: true,
          repeat: 2,
          ease: "Power2",
          onComplete: () => {
            // Cambiar a corazón vacío
            heartText.setStyle({
              fontFamily: "Arial",
              fontSize: "56px",
              color: "transparent",
              stroke: "#8b0000",
              strokeThickness: 3,
            });
            heartText.setShadow(0, 0, "#000000", 0, false, false);
          },
        });
      }
    }

    return this.lives > 0;
  }

  /**
   * Obtiene las vidas restantes
   */
  public getLives(): number {
    return this.lives;
  }

  /**
   * Reinicia las vidas
   */
  public resetLives(): void {
    this.lives = 2;
    this.heartContainers.forEach((heart, i) => {
      heart.setScale(1);
      heart.setAlpha(1);
      // Restaurar corazón lleno
      const heartText = heart.getAt(0) as Phaser.GameObjects.Text;
      if (heartText) {
        heartText.setStyle({
          fontFamily: "Arial",
          fontSize: "56px",
          color: "#e74c3c",
          stroke: "#8b0000",
          strokeThickness: 5,
        });
        heartText.setShadow(2, 2, "#000000", 4, true, true);
      }
    });
  }

  /**
   * Crea el badge de tiempo - A la derecha del score
   */
  private createTimeBadge(): void {
    const { canvas, ui, hand } = GameSettings;

    // Calcular posición basada en el ancho del acumulador
    const totalSlotWidth =
      hand.maxSlots * (hand.slotWidth + hand.slotPadding) - hand.slotPadding;
    const handWidth = totalSlotWidth + 30;
    const handEndX = (canvas.width - handWidth) / 2 + handWidth;

    const badgeWidth = 90;
    // Posicionar al final del acumulador (centrado del badge)
    const badgeX = handEndX - badgeWidth / 2;

    this.timeBadge = this.scene.add.container(badgeX, 55);
    const badgeHeight = 75; // Misma altura que score
    const badgeDepth = 16;
    const borderRadius = 12;

    const bg = this.scene.add.graphics();

    // Mismo color que el acumulador
    const badgeColor = (ui.colors as any).badge || 0x5cb85c;
    const borderColor = (ui.colors as any).badgeBorder || 0x4ca84c;

    // Cara inferior (volumen 3D)
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -badgeWidth / 2,
      badgeDepth,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -badgeWidth / 2,
      badgeDepth,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Fondo del badge (cara principal)
    bg.fillStyle(badgeColor, 1);
    bg.fillRoundedRect(
      -badgeWidth / 2,
      0,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -badgeWidth / 2,
      0,
      badgeWidth,
      badgeHeight,
      borderRadius
    );

    this.timeBadge.add(bg);

    // Texto del tiempo
    this.timeText = this.scene.add.text(0, badgeHeight / 2, "60", {
      fontSize: "32px",
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ffffff",
      stroke: "#1a3a1a",
      strokeThickness: 3,
    });
    this.timeText.setOrigin(0.5);
    this.timeBadge.add(this.timeText);

    this.add(this.timeBadge);
  }

  /**
   * Crea los botones de power-ups entre el tablero y el acumulador
   */
  private createPowerUpButtons(): void {
    const { canvas, hand } = GameSettings;

    // Posición Y: entre el tablero y el acumulador
    const handY = canvas.height - hand.bottomMargin;
    const buttonsY = handY - hand.slotHeight / 2 - 80; // 80px arriba del acumulador

    const buttonSize = 70;
    const buttonSpacing = 100;
    const centerX = canvas.width / 2;

    // Colores diferentes para cada botón (estilo badge) - Tonos más vivos
    const colors = {
      undo: { main: 0x3498db, border: 0x2980b9 }, // Azul brillante
      clock: { main: 0xf1c40f, border: 0xd4a800 }, // Amarillo/Dorado brillante
      key: { main: 0xe74c3c, border: 0x8b0000 }, // Rojo (mismo que corazones)
    };

    // Crear los 3 botones
    this.undoButton = this.createPowerUpButton(
      centerX - buttonSpacing,
      buttonsY,
      buttonSize,
      colors.undo,
      "undo",
      this.undoUsesLeft
    );

    this.clockButton = this.createPowerUpButton(
      centerX,
      buttonsY,
      buttonSize,
      colors.clock,
      "clock",
      this.clockUsesLeft
    );

    this.keyButton = this.createPowerUpButton(
      centerX + buttonSpacing,
      buttonsY,
      buttonSize,
      colors.key,
      "key",
      this.keyUsesLeft
    );

    this.add(this.undoButton);
    this.add(this.clockButton);
    this.add(this.keyButton);
  }

  /**
   * Crea un botón de power-up individual con estilo 3D
   */
  private createPowerUpButton(
    x: number,
    y: number,
    size: number,
    colors: { main: number; border: number },
    type: "undo" | "clock" | "key",
    usesLeft: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const depth = 10;
    const radius = size / 2;

    const bg = this.scene.add.graphics();

    // Sombra/profundidad 3D (círculo inferior)
    bg.fillStyle(this.darkenColor(colors.border, 0.3), 1);
    bg.fillCircle(0, depth, radius);

    // Cara principal (círculo superior)
    bg.fillStyle(colors.main, 1);
    bg.fillCircle(0, 0, radius);

    // Borde
    bg.lineStyle(3, colors.border, 1);
    bg.strokeCircle(0, 0, radius);

    container.add(bg);

    // Dibujar icono (proporcional al tamaño del botón)
    const icon = this.scene.add.graphics();
    icon.lineStyle(4, 0xffffff, 1);

    if (type === "undo") {
      // Flecha circular hacia atrás
      const arrowRadius = 18;
      // Arco
      icon.beginPath();
      icon.arc(
        0,
        0,
        arrowRadius,
        Phaser.Math.DegToRad(-45),
        Phaser.Math.DegToRad(180),
        false
      );
      icon.strokePath();
      // Flecha
      icon.beginPath();
      icon.moveTo(-arrowRadius - 6, -6);
      icon.lineTo(-arrowRadius, -16);
      icon.lineTo(-arrowRadius + 6, -6);
      icon.strokePath();
    } else if (type === "clock") {
      // Reloj simple
      const clockRadius = 18;
      icon.strokeCircle(0, 0, clockRadius);
      // Manecillas
      icon.beginPath();
      icon.moveTo(0, 0);
      icon.lineTo(0, -12); // Manecilla minutos
      icon.moveTo(0, 0);
      icon.lineTo(9, 0); // Manecilla horas
      icon.strokePath();
    } else if (type === "key") {
      // Llave simple
      // Cabeza de la llave (círculo)
      icon.strokeCircle(-7, -7, 9);
      // Cuerpo de la llave
      icon.beginPath();
      icon.moveTo(0, 0);
      icon.lineTo(14, 14);
      icon.moveTo(9, 9);
      icon.lineTo(14, 9);
      icon.moveTo(12, 12);
      icon.lineTo(17, 12);
      icon.strokePath();
    }

    container.add(icon);

    // Contador de usos (badge más visible)
    const countBadgeSize = 28;
    const countBg = this.scene.add.graphics();
    countBg.fillStyle(0x222222, 1);
    countBg.fillCircle(radius - 4, -radius + 4, countBadgeSize / 2);
    countBg.lineStyle(2, 0x444444, 1);
    countBg.strokeCircle(radius - 4, -radius + 4, countBadgeSize / 2);
    container.add(countBg);

    const countText = this.scene.add.text(
      radius - 4,
      -radius + 4,
      usesLeft.toString(),
      {
        fontSize: "18px",
        fontFamily: "'Fredoka One', cursive",
        color: "#ffffff",
      }
    );
    countText.setOrigin(0.5);
    container.add(countText);

    // Guardar referencia al texto del contador
    if (type === "undo") this.undoCountText = countText;
    else if (type === "clock") this.clockCountText = countText;
    else if (type === "key") this.keyCountText = countText;

    // Hacer interactivo
    const hitArea = this.scene.add.circle(0, 0, radius);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setAlpha(0.001);
    container.add(hitArea);

    hitArea.on("pointerdown", () => this.onPowerUpClick(type));
    hitArea.on("pointerover", () => {
      this.scene.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: "Back.easeOut",
      });
    });
    hitArea.on("pointerout", () => {
      this.scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Back.easeOut",
      });
    });

    return container;
  }

  /**
   * Maneja el click en un power-up
   */
  private onPowerUpClick(type: "undo" | "clock" | "key"): void {
    let usesLeft: number;
    let callback: (() => boolean) | undefined;
    let countText: Phaser.GameObjects.Text;
    let button: Phaser.GameObjects.Container;

    if (type === "undo") {
      usesLeft = this.undoUsesLeft;
      callback = this.powerUpCallbacks.onUndo;
      countText = this.undoCountText;
      button = this.undoButton;
    } else if (type === "clock") {
      usesLeft = this.clockUsesLeft;
      callback = this.powerUpCallbacks.onPauseTime;
      countText = this.clockCountText;
      button = this.clockButton;
    } else {
      usesLeft = this.keyUsesLeft;
      callback = this.powerUpCallbacks.onHint;
      countText = this.keyCountText;
      button = this.keyButton;
    }

    // Verificar si hay usos disponibles
    if (usesLeft <= 0) {
      // Shake para indicar que no hay usos
      this.scene.tweens.add({
        targets: button,
        x: button.x - 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: "Linear",
      });
      return;
    }

    // Ejecutar callback
    const success = callback ? callback() : false;

    if (success) {
      // Decrementar usos
      if (type === "undo") {
        this.undoUsesLeft--;
        usesLeft = this.undoUsesLeft;
      } else if (type === "clock") {
        this.clockUsesLeft--;
        usesLeft = this.clockUsesLeft;
      } else {
        this.keyUsesLeft--;
        usesLeft = this.keyUsesLeft;
      }

      // Actualizar texto
      countText.setText(usesLeft.toString());

      // Efecto visual de uso
      this.scene.tweens.add({
        targets: button,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: "Back.easeOut",
      });

      // Si no hay más usos, atenuar el botón
      if (usesLeft <= 0) {
        button.setAlpha(0.5);
      }
    }
  }

  /**
   * Crea el área del acumulador - Estilo 3D beige
   */
  private createHand(): void {
    const { canvas, hand } = GameSettings;

    const handY = canvas.height - hand.bottomMargin;
    const totalSlotWidth =
      hand.maxSlots * (hand.slotWidth + hand.slotPadding) - hand.slotPadding;
    const handWidth = totalSlotWidth + 30;
    const handX = (canvas.width - handWidth) / 2;
    const handHeight = hand.slotHeight + 20;
    const handDepth = 16; // Profundidad 3D igual al badge
    const borderRadius = 12;

    // Colores beige del acumulador
    const bgColor = hand.backgroundColor;
    const borderColor = hand.slotBorderColor;

    this.handBg = this.scene.add.graphics();

    // Cara inferior (volumen 3D)
    this.handBg.fillStyle(this.darkenColor(bgColor, 0.25), 1);
    this.handBg.fillRoundedRect(
      handX,
      handY - handHeight / 2 + handDepth,
      handWidth,
      handHeight,
      borderRadius
    );

    // Borde de la cara 3D
    this.handBg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    this.handBg.strokeRoundedRect(
      handX,
      handY - handHeight / 2 + handDepth,
      handWidth,
      handHeight,
      borderRadius
    );

    // Fondo del acumulador (cara principal)
    this.handBg.fillStyle(bgColor, 1);
    this.handBg.fillRoundedRect(
      handX,
      handY - handHeight / 2,
      handWidth,
      handHeight,
      borderRadius
    );

    // Borde exterior
    this.handBg.lineStyle(2, borderColor, 1);
    this.handBg.strokeRoundedRect(
      handX,
      handY - handHeight / 2,
      handWidth,
      handHeight,
      borderRadius
    );

    this.add(this.handBg);

    // Crear slots
    for (let i = 0; i < hand.maxSlots; i++) {
      const slotContainer = this.createSlot(i);
      this.handSlots.push(slotContainer);
      this.add(slotContainer);
    }
  }

  /**
   * Crea un slot individual - Diseño visible con fondo oscuro
   */
  private createSlot(index: number): Phaser.GameObjects.Container {
    const { hand } = GameSettings;
    const pos = this.getSlotPosition(index);

    const container = this.scene.add.container(pos.x, pos.y);

    const slotBg = this.scene.add.graphics();

    // Fondo del slot con color del config - más visible
    slotBg.fillStyle(hand.slotColor, 1);
    slotBg.fillRoundedRect(
      -hand.slotWidth / 2,
      -hand.slotHeight / 2,
      hand.slotWidth,
      hand.slotHeight,
      8
    );

    // Borde del slot
    slotBg.lineStyle(2, hand.slotBorderColor, 1);
    slotBg.strokeRoundedRect(
      -hand.slotWidth / 2,
      -hand.slotHeight / 2,
      hand.slotWidth,
      hand.slotHeight,
      8
    );

    container.add(slotBg);

    return container;
  }

  /**
   * Obtiene la posición de un slot
   */
  public getSlotPosition(index: number): { x: number; y: number } {
    const { canvas, hand } = GameSettings;
    const totalWidth =
      hand.maxSlots * hand.slotWidth + (hand.maxSlots - 1) * hand.slotPadding;
    const startX = (canvas.width - totalWidth) / 2 + hand.slotWidth / 2;

    return {
      x: startX + index * (hand.slotWidth + hand.slotPadding),
      y: canvas.height - hand.bottomMargin,
    };
  }

  /**
   * Actualiza la visualización de la mano
   */
  public updateHand(slots: HandSlot[]): void {
    // Limpiar sprites anteriores
    this.handTileSprites.forEach((sprite, id) => {
      if (!slots.some((s) => s.tile?.id === id)) {
        sprite.destroy();
        this.handTileSprites.delete(id);
      }
    });

    // Actualizar/crear sprites para fichas en mano
    slots.forEach((slot, index) => {
      if (slot.tile && !this.handTileSprites.has(slot.tile.id)) {
        const miniTile = this.createMiniTile(slot.tile);
        const pos = this.getSlotPosition(index);
        miniTile.setPosition(pos.x, pos.y);
        this.add(miniTile);
        this.handTileSprites.set(slot.tile.id, miniTile);
      }
    });

    // Reposicionar fichas existentes
    slots.forEach((slot, index) => {
      if (slot.tile) {
        const sprite = this.handTileSprites.get(slot.tile.id);
        if (sprite) {
          const pos = this.getSlotPosition(index);
          this.scene.tweens.add({
            targets: sprite,
            x: pos.x,
            y: pos.y,
            duration: 150,
            ease: "Power2",
          });
        }
      }
    });
  }

  /**
   * Crea una versión mini de una ficha para la mano - Usa la misma textura del tablero escalada
   */
  private createMiniTile(tile: TileState): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const { hand, tile: tileSettings } = GameSettings;

    // Usar la textura cacheada del tablero (con 3D)
    const textureKey = `tile-${tile.type}`;

    // Verificar si existe la textura
    if (!this.scene.textures.exists(textureKey)) {
      // Fallback: crear una ficha simple
      return this.createFallbackMiniTile(tile);
    }

    // Crear imagen con la textura del tablero
    const tileImage = this.scene.add.image(0, 0, textureKey);

    // Calcular escala para que ocupe todo el slot
    const originalWidth = tileSettings.width + 8; // La textura tiene padding
    const originalHeight = tileSettings.height + tileSettings.depth + 8;

    // Escalar para llenar el slot completamente
    const scaleX = hand.slotWidth / originalWidth;
    const scaleY = hand.slotHeight / originalHeight;

    tileImage.setScale(scaleX, scaleY);

    // Centrar la ficha en el slot (sin offset vertical)
    tileImage.setOrigin(0.5, 0.5);

    container.add(tileImage);

    // Añadir la imagen del icono si existe (redondeada)
    const roundedTextureKey = `tile-icon-rounded-${tile.type}`;
    const originalTextureKey = `tile-icon-${tile.type}`;
    const hasRoundedImage = this.scene.textures.exists(roundedTextureKey);
    const hasImage =
      hasRoundedImage || this.scene.textures.exists(originalTextureKey);

    if (hasImage) {
      const iconKey = hasRoundedImage ? roundedTextureKey : originalTextureKey;
      const padding = 8;
      const innerWidth = tileSettings.width - padding * 2;
      const innerHeight = tileSettings.height - padding * 2;

      // Calcular offset del icono para que quede centrado en la cara de la ficha
      const faceOffsetY = -(tileSettings.depth * scaleY) / 2;

      const iconImage = this.scene.add.image(0, faceOffsetY, iconKey);
      iconImage.setDisplaySize(innerWidth * scaleX, innerHeight * scaleY);
      container.add(iconImage);
    }

    return container;
  }

  /**
   * Fallback para crear mini ficha si no existe la textura
   */
  private createFallbackMiniTile(
    tile: TileState
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const colors = TILE_COLORS[tile.type];
    const { hand } = GameSettings;
    const tileColors = GameSettings.tile.colors;

    const w = hand.slotWidth - 6;
    const h = hand.slotHeight - 6;
    const r = 5;

    const g = this.scene.add.graphics();
    g.fillStyle(tileColors.face, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    g.lineStyle(1.5, tileColors.border, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    container.add(g);

    const fontSize = Math.floor(w * 0.4);
    const symbol = this.scene.add.text(0, 0, colors.letter, {
      fontSize: `${fontSize}px`,
      fontFamily: "'Fredoka One', sans-serif",
      color: "#ffffff",
    });
    symbol.setOrigin(0.5);
    container.add(symbol);

    return container;
  }

  /**
   * Anima la eliminación de fichas que hicieron match
   * Las fichas se elevan FUERA del acumulador desde la posición central de las 3 fichas
   */
  public animateMatch(tileIds: string[], onComplete?: () => void): void {
    // Crear copias visuales de las fichas ANTES de eliminarlas
    const animationSprites: Phaser.GameObjects.Container[] = [];
    const originalPositions: { x: number; y: number }[] = [];

    tileIds.forEach((id) => {
      const sprite = this.handTileSprites.get(id);
      if (sprite) {
        // Guardar posición original
        originalPositions.push({ x: sprite.x, y: sprite.y });

        // Crear una copia visual para la animación
        const copy = this.scene.add.container(sprite.x, sprite.y);

        // Clonar los hijos del sprite original (solo imágenes, no graphics)
        sprite.list.forEach((child) => {
          if (child instanceof Phaser.GameObjects.Image) {
            const imgCopy = this.scene.add.image(
              child.x,
              child.y,
              child.texture.key
            );
            imgCopy.setScale(child.scaleX, child.scaleY);
            imgCopy.setOrigin(child.originX, child.originY);
            copy.add(imgCopy);
          }
        });

        copy.setDepth(1000); // Por encima de todo
        this.add(copy);
        animationSprites.push(copy);

        // Eliminar el sprite original INMEDIATAMENTE
        sprite.destroy();
        this.handTileSprites.delete(id);
      }
    });

    if (animationSprites.length === 0) {
      onComplete?.();
      return;
    }

    // Llamar onComplete INMEDIATAMENTE para liberar el acumulador
    if (onComplete) {
      onComplete();
    }

    // Calcular la posición central de las 3 fichas (ficha del medio)
    // Ordenar por posición X para encontrar la del centro
    const sortedPositions = [...originalPositions].sort((a, b) => a.x - b.x);
    const centerTilePos =
      sortedPositions[Math.floor(sortedPositions.length / 2)];

    // La animación sube desde la posición de la ficha central
    const animationCenterX = centerTilePos.x;
    const animationCenterY = centerTilePos.y - 180; // Subir desde la ficha central

    // Fase 1: Elevar las fichas suavemente hacia arriba desde la ficha central
    animationSprites.forEach((sprite, index) => {
      const delay = index * 60; // Más espaciado

      // Fase 1: Elevar suavemente hacia la zona de animación
      this.scene.tweens.add({
        targets: sprite,
        x: animationCenterX + (index - 1) * 50, // Separar horizontalmente
        y: animationCenterY,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 350, // Más lento y suave
        delay: delay,
        ease: "Cubic.easeOut",
        onComplete: () => {
          // Fase 2: Converger al centro con rotación suave
          this.scene.tweens.add({
            targets: sprite,
            x: animationCenterX,
            y: animationCenterY - 30,
            rotation: (index - 1) * 0.25,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 280, // Más suave
            ease: "Sine.easeInOut",
            onComplete: () => {
              // Fase 3: Explosión final (solo en la última ficha)
              if (index === animationSprites.length - 1) {
                this.createMatchParticles(
                  animationCenterX,
                  animationCenterY - 30
                );
                this.createFlashEffect(animationCenterX, animationCenterY - 30);
              }

              // Desaparecer con efecto suave
              this.scene.tweens.add({
                targets: sprite,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                rotation: sprite.rotation + 0.5,
                duration: 200, // Más suave
                ease: "Cubic.easeIn",
                onComplete: () => {
                  sprite.destroy();
                },
              });
            },
          });
        },
      });
    });
  }

  /**
   * Crea partículas de explosión para el match
   */
  private createMatchParticles(x: number, y: number): void {
    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0xffe66d, 0xc44dff, 0x44ff88];
    const particleCount = 20; // Más partículas

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 150 + Math.random() * 100; // Más velocidad
      const size = 10 + Math.random() * 8; // Más grandes
      const color = colors[Math.floor(Math.random() * colors.length)];

      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);
      particle.setAlpha(1);
      particle.setDepth(1001); // Por encima de las fichas
      this.add(particle);

      // Animar partícula hacia afuera con gravedad
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY + 40, // Simular gravedad
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 600 + Math.random() * 300, // Más duración
        ease: "Power2.easeOut",
        onComplete: () => particle.destroy(),
      });
    }

    // Estrellas/sparkles adicionales - más grandes y visibles
    for (let i = 0; i < 12; i++) {
      // Más estrellas
      const star = this.scene.add.text(x, y, "✦", {
        fontSize: `${24 + Math.random() * 16}px`, // Más grandes
        color: "#ffd700",
      });
      star.setOrigin(0.5);
      star.setDepth(1001);
      this.add(star);

      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 80; // Más distancia

      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 30,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        rotation: Math.random() * 3,
        duration: 700 + Math.random() * 300, // Más duración
        ease: "Power2.easeOut",
        onComplete: () => star.destroy(),
      });
    }
  }

  /**
   * Crea efecto de flash para el match
   */
  private createFlashEffect(x: number, y: number): void {
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(0, 0, 60);
    flash.setPosition(x, y);
    flash.setAlpha(0);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    this.add(flash);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0.9,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      ease: "Power2.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          targets: flash,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 200,
          ease: "Power2.easeOut",
          onComplete: () => flash.destroy(),
        });
      },
    });
  }

  /**
   * Actualiza el nivel mostrado
   */
  public updateLevel(level: number): void {
    this.currentLevel = level;
    this.levelText.setText(`Lv.${level}`);

    // Reiniciar timer al cambiar de nivel
    this.resetTimer();
  }

  /**
   * Reinicia el timer
   */
  public resetTimer(): void {
    this.timeRemaining = 60;
    this.levelStartTime = 60; // Guardar tiempo inicial del nivel
    this.levelStartScore = this.currentScore; // Guardar score al inicio del nivel
    this.timeText.setText("60");

    // Cancelar timer anterior si existe
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Crear nuevo timer
    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Obtiene el tiempo que se tardó en completar el nivel
   */
  public getLevelTime(): number {
    return this.levelStartTime - this.timeRemaining;
  }

  /**
   * Obtiene el score conseguido en este nivel
   */
  public getLevelScore(): number {
    return this.currentScore - this.levelStartScore;
  }

  /**
   * Actualiza el timer cada segundo
   */
  private updateTimer(): void {
    this.timeRemaining--;
    this.timeText.setText(this.timeRemaining.toString());

    // Emitir evento cuando se acaba el tiempo
    if (this.timeRemaining <= 0) {
      if (this.timerEvent) {
        this.timerEvent.destroy();
      }
      this.emit("time-up");
    }
  }

  /**
   * Detiene el timer
   */
  public stopTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
  }

  /**
   * Pausa el timer (congela el tiempo restante)
   * Retorna true si se pausó correctamente
   */
  public pauseTimer(): boolean {
    if (this.timerEvent && this.timeRemaining > 0) {
      this.timerEvent.paused = true;

      // Efecto visual de pausa (parpadeo del timer)
      this.scene.tweens.add({
        targets: this.timeBadge,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.timeBadge.setAlpha(1);
        },
      });

      return true;
    }
    return false;
  }

  /**
   * Reanuda el timer pausado
   */
  public resumeTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.paused = false;
    }
  }

  /**
   * Verifica si el timer está pausado
   */
  public isTimerPaused(): boolean {
    return this.timerEvent?.paused ?? false;
  }

  /**
   * Actualiza la puntuación mostrada
   */
  public updateScore(score: number): void {
    const oldScore = this.currentScore;
    this.currentScore = score;

    // Animación de incremento gradual
    this.scene.tweens.addCounter({
      from: oldScore,
      to: score,
      duration: 250,
      onUpdate: (tween) => {
        const value = tween.getValue();
        if (value !== null) {
          this.scoreText.setText(`${Math.floor(value)}`);
        }
      },
    });

    // Efecto de pulso en el badge
    this.scene.tweens.add({
      targets: this.scoreBadge,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 120,
      yoyo: true,
      ease: "Power2",
    });
  }

  /**
   * Muestra mensaje de victoria
   */
  public showWinMessage(onContinue: () => void): void {
    const { canvas } = GameSettings;

    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    this.add(overlay);

    const modalWidth = 450;
    const modalHeight = 340;
    const borderRadius = 20;
    const depth3D = 16;

    // Colores de GameSettings (mismo que badges)
    const { ui } = GameSettings;
    const badgeColor = (ui.colors as any).badge || 0x3cb371;
    const borderColor = (ui.colors as any).badgeBorder || 0x2e8b57;

    // Contenedor centrado
    const winContainer = this.scene.add.container(
      canvas.width / 2,
      canvas.height / 2
    );

    const bg = this.scene.add.graphics();

    // Offset para centrar verticalmente
    const offsetY = -modalHeight / 2;

    // Cara 3D inferior
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      offsetY + depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      offsetY + depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Cara principal
    bg.fillStyle(badgeColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      offsetY,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      offsetY,
      modalWidth,
      modalHeight,
      borderRadius
    );
    winContainer.add(bg);

    // Título
    const winText = this.scene.add.text(0, offsetY + 50, "LEVEL COMPLETE!", {
      fontSize: "38px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#ffffff",
      stroke: "#1a3a1a",
      strokeThickness: 5,
      align: "center",
    });
    winText.setOrigin(0.5);
    winContainer.add(winText);

    // Estadísticas del nivel
    const levelTime = this.getLevelTime();
    const levelScore = this.getLevelScore();

    // Tiempo - centrado
    const timeText = this.scene.add.text(
      0,
      offsetY + 115,
      `TIME: ${levelTime}s`,
      {
        fontSize: "24px",
        fontFamily: "'Fredoka One', sans-serif",
        color: "#1a1a1a",
      }
    );
    timeText.setOrigin(0.5);
    winContainer.add(timeText);

    // Score del nivel - centrado
    const scoreText = this.scene.add.text(
      0,
      offsetY + 160,
      `SCORE: +${levelScore}`,
      {
        fontSize: "24px",
        fontFamily: "'Fredoka One', sans-serif",
        color: "#1a1a1a",
      }
    );
    scoreText.setOrigin(0.5);
    winContainer.add(scoreText);

    // Línea separadora
    const separator = this.scene.add.graphics();
    separator.lineStyle(2, 0xffffff, 0.3);
    separator.lineBetween(-150, offsetY + 200, 150, offsetY + 200);
    winContainer.add(separator);

    // Botón con estilo 3D (blanco como contraste)
    const continueBtn = this.scene.add.container(0, offsetY + 245);
    const btnWidth = 250;
    const btnHeight = 58;
    const btnDepth = 8;

    const btnBg = this.scene.add.graphics();
    // Sombra del botón
    btnBg.fillStyle(0xdddddd, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, btnDepth, btnWidth, btnHeight, 14);
    // Cara del botón (blanco)
    btnBg.fillStyle(0xffffff, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    // Borde
    btnBg.lineStyle(2, borderColor, 1);
    btnBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    continueBtn.add(btnBg);

    const btnText = this.scene.add.text(0, btnHeight / 2, "NEXT LEVEL →", {
      fontSize: "24px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#1a1a1a",
    });
    btnText.setOrigin(0.5);
    continueBtn.add(btnText);

    continueBtn.setSize(btnWidth, btnHeight + btnDepth);
    continueBtn.setInteractive({ useHandCursor: true });

    continueBtn.on("pointerover", () => {
      this.scene.tweens.add({
        targets: continueBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    continueBtn.on("pointerout", () => {
      this.scene.tweens.add({
        targets: continueBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    continueBtn.on("pointerdown", () => {
      winContainer.destroy();
      overlay.destroy();
      onContinue();
    });

    winContainer.add(continueBtn);
    this.add(winContainer);

    // Animación de entrada
    winContainer.setScale(0);
    this.scene.tweens.add({
      targets: winContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: "Back.easeOut",
    });
  }

  /**
   * Muestra modal de Try Again cuando pierdes una vida pero te queda otra
   */
  public showTryAgainMessage(onTryAgain: () => void): void {
    const { canvas } = GameSettings;

    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    this.add(overlay);

    const modalWidth = 450;
    const modalHeight = 300;
    const borderRadius = 20;
    const depth3D = 16;

    // Colores de GameSettings (mismo que badges)
    const { ui } = GameSettings;
    const badgeColor = (ui.colors as any).badge || 0x3cb371;
    const borderColor = (ui.colors as any).badgeBorder || 0x2e8b57;

    // Contenedor centrado
    const tryAgainContainer = this.scene.add.container(
      canvas.width / 2,
      canvas.height / 2
    );

    const bg = this.scene.add.graphics();

    // Offset para centrar verticalmente
    const offsetY = -modalHeight / 2;

    // Cara 3D inferior
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      offsetY + depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      offsetY + depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Cara principal
    bg.fillStyle(badgeColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      offsetY,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      offsetY,
      modalWidth,
      modalHeight,
      borderRadius
    );
    tryAgainContainer.add(bg);

    // Título
    const titleText = this.scene.add.text(0, offsetY + 55, "TIME'S UP!", {
      fontSize: "38px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#ffffff",
      stroke: "#1a3a1a",
      strokeThickness: 5,
      align: "center",
    });
    titleText.setOrigin(0.5);
    tryAgainContainer.add(titleText);

    // Subtítulo con vidas restantes
    const livesText = this.scene.add.text(
      0,
      offsetY + 115,
      `${this.lives} life remaining`,
      {
        fontSize: "24px",
        fontFamily: "'Fredoka One', sans-serif",
        color: "#1a1a1a",
        align: "center",
      }
    );
    livesText.setOrigin(0.5);
    tryAgainContainer.add(livesText);

    // Línea separadora
    const separator = this.scene.add.graphics();
    separator.lineStyle(2, 0xffffff, 0.3);
    separator.lineBetween(-150, offsetY + 155, 150, offsetY + 155);
    tryAgainContainer.add(separator);

    // Botón con estilo 3D (blanco como contraste)
    const tryAgainBtn = this.scene.add.container(0, offsetY + 200);
    const btnWidth = 250;
    const btnHeight = 58;
    const btnDepth = 8;

    const btnBg = this.scene.add.graphics();
    // Sombra del botón
    btnBg.fillStyle(0xdddddd, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, btnDepth, btnWidth, btnHeight, 14);
    // Cara del botón (blanco)
    btnBg.fillStyle(0xffffff, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    // Borde
    btnBg.lineStyle(2, borderColor, 1);
    btnBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 14);
    tryAgainBtn.add(btnBg);

    const btnText = this.scene.add.text(0, btnHeight / 2, "TRY AGAIN", {
      fontSize: "24px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#1a1a1a",
    });
    btnText.setOrigin(0.5);
    tryAgainBtn.add(btnText);

    tryAgainBtn.setSize(btnWidth, btnHeight + btnDepth);
    tryAgainBtn.setInteractive({ useHandCursor: true });

    tryAgainBtn.on("pointerover", () => {
      this.scene.tweens.add({
        targets: tryAgainBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    tryAgainBtn.on("pointerout", () => {
      this.scene.tweens.add({
        targets: tryAgainBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    tryAgainBtn.on("pointerdown", () => {
      tryAgainContainer.destroy();
      overlay.destroy();
      onTryAgain();
    });

    tryAgainContainer.add(tryAgainBtn);
    this.add(tryAgainContainer);

    // Animación de entrada
    tryAgainContainer.setScale(0);
    this.scene.tweens.add({
      targets: tryAgainContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: "Back.easeOut",
    });
  }

  /**
   * Muestra mensaje de game over
   */
  public showGameOverMessage(onRetry: () => void): void {
    const { canvas } = GameSettings;

    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    this.add(overlay);

    const gameOverContainer = this.scene.add.container(
      canvas.width / 2,
      canvas.height / 2
    );

    const modalWidth = 320;
    const modalHeight = 220;
    const borderRadius = 16;
    const depth3D = 8;

    // Colores estilo juego (rojo para game over)
    const bgColor = 0xfefcf8; // Blanco marfil
    const borderColor = 0xc0392b; // Rojo
    const accentColor = 0x922b21; // Rojo oscuro

    const bg = this.scene.add.graphics();

    // Sombra suave
    bg.fillStyle(0x000000, 0.15);
    bg.fillRoundedRect(
      -modalWidth / 2 + 4,
      depth3D + 4,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Cara 3D inferior
    bg.fillStyle(accentColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Cara principal
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      0,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde
    bg.lineStyle(3, borderColor, 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      0,
      modalWidth,
      modalHeight,
      borderRadius
    );
    gameOverContainer.add(bg);

    const gameOverText = this.scene.add.text(0, 35, "💀 GAME OVER", {
      fontSize: "28px",
      fontFamily: "Arial Black, sans-serif",
      color: "#c0392b",
      align: "center",
    });
    gameOverText.setOrigin(0.5);
    gameOverContainer.add(gameOverText);

    const subText = this.scene.add.text(0, 75, "Mano llena sin movimientos", {
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
      color: "#7f8c8d",
      align: "center",
    });
    subText.setOrigin(0.5);
    gameOverContainer.add(subText);

    // Botón con estilo 3D
    const retryBtn = this.scene.add.container(0, 140);
    const btnWidth = 160;
    const btnHeight = 44;
    const btnDepth = 4;

    const btnBg = this.scene.add.graphics();
    // Sombra del botón
    btnBg.fillStyle(this.darkenColor(0xc0392b, 0.3), 1);
    btnBg.fillRoundedRect(-btnWidth / 2, btnDepth, btnWidth, btnHeight, 10);
    // Cara del botón
    btnBg.fillStyle(0xc0392b, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 10);
    // Brillo superior
    btnBg.fillStyle(0xffffff, 0.2);
    btnBg.fillRoundedRect(
      -btnWidth / 2 + 4,
      4,
      btnWidth - 8,
      btnHeight * 0.35,
      { tl: 8, tr: 8, bl: 0, br: 0 }
    );
    retryBtn.add(btnBg);

    const btnText = this.scene.add.text(0, btnHeight / 2, "REINTENTAR", {
      fontSize: "16px",
      fontFamily: "Arial Black, sans-serif",
      color: "#ffffff",
    });
    btnText.setOrigin(0.5);
    retryBtn.add(btnText);

    retryBtn.setSize(btnWidth, btnHeight + btnDepth);
    retryBtn.setInteractive({ useHandCursor: true });

    retryBtn.on("pointerover", () => {
      this.scene.tweens.add({
        targets: retryBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    retryBtn.on("pointerout", () => {
      this.scene.tweens.add({
        targets: retryBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    retryBtn.on("pointerdown", () => {
      gameOverContainer.destroy();
      overlay.destroy();
      onRetry();
    });

    gameOverContainer.add(retryBtn);
    this.add(gameOverContainer);

    // Animación de entrada
    gameOverContainer.setScale(0);
    this.scene.tweens.add({
      targets: gameOverContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  // Utilidades de color
  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((color & 0xff) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }

  private colorToHex(color: number): string {
    return "#" + color.toString(16).padStart(6, "0");
  }

  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xff) * (1 + factor)));
    return (r << 16) | (g << 8) | b;
  }
}
