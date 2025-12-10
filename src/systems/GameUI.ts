/**
 * GameUI - Componente de interfaz de usuario del juego
 * Estilo Cartoon Mahjong
 */

import GameSettings from "../config/GameSettings";
import { TILE_COLORS, type HandSlot, type TileState } from "../types";

export class GameUI extends Phaser.GameObjects.Container {
  // Header elements
  private headerBg!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  // Hand elements
  private handBg!: Phaser.GameObjects.Graphics;
  private handSlots: Phaser.GameObjects.Container[] = [];
  private handTileSprites: Map<string, Phaser.GameObjects.Container> =
    new Map();

  // Buttons
  private restartButton!: Phaser.GameObjects.Container;

  // State
  private currentScore: number = 0;
  private currentLevel: number = 1;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createHeader();
    this.createHand();
    this.createButtons();

    scene.add.existing(this);
    this.setDepth(1000);
  }

  /**
   * Crea el header con Level y Score centrados - Estilo Cartoon
   */
  private createHeader(): void {
    const { canvas, ui } = GameSettings;

    // Fondo del header con gradiente simulado
    this.headerBg = this.scene.add.graphics();
    this.headerBg.fillStyle(ui.colors.primary, 0.95);
    this.headerBg.fillRect(0, 0, canvas.width, ui.headerHeight);
    // Borde dorado inferior
    this.headerBg.fillStyle(ui.colors.accent, 1);
    this.headerBg.fillRect(0, ui.headerHeight - 4, canvas.width, 4);
    this.add(this.headerBg);

    // Nivel - Izquierda centrada
    this.levelText = this.scene.add.text(
      canvas.width / 4,
      ui.headerHeight / 2,
      "🎯 LVL 1",
      {
        fontSize: `${ui.fontSize.level}px`,
        fontFamily: "Arial Black, Impact, sans-serif",
        color: "#ffd700",
        stroke: "#4a3000",
        strokeThickness: 4,
      }
    );
    this.levelText.setOrigin(0.5);
    this.add(this.levelText);

    // Puntuación - Derecha centrada
    this.scoreText = this.scene.add.text(
      (canvas.width * 3) / 4,
      ui.headerHeight / 2,
      "💰 0",
      {
        fontSize: `${ui.fontSize.score}px`,
        fontFamily: "Arial Black, Impact, sans-serif",
        color: "#00ff88",
        stroke: "#004422",
        strokeThickness: 4,
      }
    );
    this.scoreText.setOrigin(0.5);
    this.add(this.scoreText);
  }

  /**
   * Crea el área de la mano en el footer - Estilo Cartoon Madera
   */
  private createHand(): void {
    const { canvas, hand } = GameSettings;

    const handY = canvas.height - hand.bottomMargin - hand.slotHeight / 2 - 25;
    const handWidth = hand.maxSlots * (hand.slotWidth + hand.slotPadding) + 30;
    const handX = (canvas.width - handWidth) / 2;

    this.handBg = this.scene.add.graphics();

    // Sombra
    this.handBg.fillStyle(0x000000, 0.3);
    this.handBg.fillRoundedRect(
      handX + 4,
      handY - 6,
      handWidth,
      hand.slotHeight + 50,
      18
    );

    // Fondo principal madera
    this.handBg.fillStyle(hand.backgroundColor, 1);
    this.handBg.fillRoundedRect(
      handX,
      handY - 10,
      handWidth,
      hand.slotHeight + 50,
      18
    );

    // Borde dorado
    this.handBg.lineStyle(4, hand.slotBorderColor, 1);
    this.handBg.strokeRoundedRect(
      handX,
      handY - 10,
      handWidth,
      hand.slotHeight + 50,
      18
    );

    // Decoración superior
    this.handBg.fillStyle(0x8b7355, 1);
    this.handBg.fillRect(handX + 20, handY - 5, handWidth - 40, 6);

    this.add(this.handBg);

    // Crear slots
    for (let i = 0; i < hand.maxSlots; i++) {
      const slotContainer = this.createSlot(i);
      this.handSlots.push(slotContainer);
      this.add(slotContainer);
    }
  }

  /**
   * Crea un slot individual de la mano - Estilo Cartoon
   */
  private createSlot(index: number): Phaser.GameObjects.Container {
    const { hand } = GameSettings;
    const pos = this.getSlotPosition(index);

    const container = this.scene.add.container(pos.x, pos.y);

    // Fondo del slot con sombra interior
    const slotBg = this.scene.add.graphics();

    // Sombra interior
    slotBg.fillStyle(0x2a1a0a, 1);
    slotBg.fillRoundedRect(
      -hand.slotWidth / 2 + 2,
      -hand.slotHeight / 2 + 2,
      hand.slotWidth,
      hand.slotHeight,
      10
    );

    // Fondo slot
    slotBg.fillStyle(hand.slotColor, 1);
    slotBg.fillRoundedRect(
      -hand.slotWidth / 2,
      -hand.slotHeight / 2,
      hand.slotWidth,
      hand.slotHeight,
      10
    );

    // Borde
    slotBg.lineStyle(3, hand.slotBorderColor, 0.8);
    slotBg.strokeRoundedRect(
      -hand.slotWidth / 2,
      -hand.slotHeight / 2,
      hand.slotWidth,
      hand.slotHeight,
      10
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
   * Crea los botones de control - Estilo Cartoon
   */
  private createButtons(): void {
    const { canvas, ui } = GameSettings;

    // Botón de reinicio en el centro del header
    this.restartButton = this.scene.add.container(
      canvas.width / 2,
      ui.headerHeight / 2
    );

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xe94560, 1);
    btnBg.fillRoundedRect(-22, -22, 44, 44, 22);
    btnBg.lineStyle(3, 0xffffff, 0.5);
    btnBg.strokeRoundedRect(-22, -22, 44, 44, 22);
    this.restartButton.add(btnBg);

    const btnText = this.scene.add.text(0, 0, "↺", {
      fontSize: "26px",
      fontFamily: "Arial Black, sans-serif",
      color: "#ffffff",
    });
    btnText.setOrigin(0.5);
    this.restartButton.add(btnText);

    this.restartButton.setSize(44, 44);
    this.restartButton.setInteractive({ useHandCursor: true });

    this.restartButton.on("pointerover", () => {
      this.scene.tweens.add({
        targets: this.restartButton,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 80,
      });
    });

    this.restartButton.on("pointerout", () => {
      this.scene.tweens.add({
        targets: this.restartButton,
        scaleX: 1,
        scaleY: 1,
        duration: 80,
      });
    });

    this.add(this.restartButton);
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
   * Crea una versión mini de una ficha para la mano - Estilo Cartoon
   */
  private createMiniTile(tile: TileState): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const colors = TILE_COLORS[tile.type];
    const { hand } = GameSettings;
    const tileColors = GameSettings.tile.colors;

    const w = hand.slotWidth - 12;
    const h = hand.slotHeight - 12;
    const d = 8;

    const g = this.scene.add.graphics();

    // Sombra
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + d + 4, w, h, 8);

    // Lado derecho 3D - Madera
    g.fillStyle(tileColors.side, 1);
    g.beginPath();
    g.moveTo(w / 2, -h / 2 + 6);
    g.lineTo(w / 2 + d, -h / 2 + d + 6);
    g.lineTo(w / 2 + d, h / 2 + d - 6);
    g.lineTo(w / 2, h / 2 - 6);
    g.closePath();
    g.fillPath();

    // Lado inferior 3D
    g.fillStyle(tileColors.bottom, 1);
    g.beginPath();
    g.moveTo(-w / 2 + 6, h / 2);
    g.lineTo(-w / 2 + d + 6, h / 2 + d);
    g.lineTo(w / 2 + d - 6, h / 2 + d);
    g.lineTo(w / 2 - 6, h / 2);
    g.closePath();
    g.fillPath();

    // Cara frontal - Marfil
    g.fillStyle(tileColors.face, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);

    // Borde exterior
    g.lineStyle(2, tileColors.border, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    // Interior con color
    const m = 8;
    g.fillStyle(colors.main, 1);
    g.fillRoundedRect(-w / 2 + m, -h / 2 + m, w - m * 2, h - m * 2, 5);

    // Brillo
    g.fillStyle(0xffffff, 0.25);
    g.fillRoundedRect(
      -w / 2 + m + 2,
      -h / 2 + m + 2,
      w - m * 2 - 4,
      (h - m * 2) * 0.3,
      { tl: 4, tr: 4, bl: 0, br: 0 }
    );

    container.add(g);

    // Símbolo
    const symbol = this.scene.add.text(0, -d / 2, colors.symbol, {
      fontSize: "28px",
      fontFamily: "Arial Black, sans-serif",
      color: "#ffffff",
      stroke: "#333333",
      strokeThickness: 3,
    });
    symbol.setOrigin(0.5);
    container.add(symbol);

    return container;
  }

  /**
   * Anima la eliminación de fichas que hicieron match
   */
  public animateMatch(tileIds: string[], onComplete?: () => void): void {
    const sprites: Phaser.GameObjects.Container[] = [];

    tileIds.forEach((id) => {
      const sprite = this.handTileSprites.get(id);
      if (sprite) {
        sprites.push(sprite);
      }
    });

    // Efecto de partículas o flash
    sprites.forEach((sprite, index) => {
      // Efecto de brillos
      const flash = this.scene.add.graphics();
      flash.setPosition(sprite.x, sprite.y);
      flash.fillStyle(0xffff00, 1);
      flash.fillCircle(0, 0, 40);
      this.add(flash);

      this.scene.tweens.add({
        targets: flash,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy(),
      });

      // Animar desaparición
      this.scene.tweens.add({
        targets: sprite,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 300,
        delay: 100,
        onComplete: () => {
          sprite.destroy();
          this.handTileSprites.delete(tileIds[index]);
          if (index === sprites.length - 1 && onComplete) {
            onComplete();
          }
        },
      });
    });
  }

  /**
   * Actualiza el nivel mostrado
   */
  public updateLevel(level: number): void {
    this.currentLevel = level;
    this.levelText.setText(`🎯 LVL ${level}`);

    // Animación de cambio de nivel
    this.scene.tweens.add({
      targets: this.levelText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      ease: "Power2",
    });
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
          this.scoreText.setText(`💰 ${Math.floor(value)}`);
        }
      },
    });

    // Efecto de pulso
    this.scene.tweens.add({
      targets: this.scoreText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 120,
      yoyo: true,
      ease: "Power2",
    });
  }

  /**
   * Callback cuando se pulsa reiniciar
   */
  public onRestart(callback: () => void): void {
    this.restartButton.on("pointerdown", callback);
  }

  /**
   * Muestra mensaje de victoria
   */
  public showWinMessage(onContinue: () => void): void {
    const { canvas } = GameSettings;

    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    this.add(overlay);

    const winContainer = this.scene.add.container(
      canvas.width / 2,
      canvas.height / 2
    );

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRoundedRect(-150, -100, 300, 200, 20);
    bg.lineStyle(3, 0xe94560, 1);
    bg.strokeRoundedRect(-150, -100, 300, 200, 20);
    winContainer.add(bg);

    const winText = this.scene.add.text(0, -50, "🎉 ¡NIVEL COMPLETADO!", {
      fontSize: "24px",
      fontFamily: "Arial Black, sans-serif",
      color: "#ffcc00",
      align: "center",
    });
    winText.setOrigin(0.5);
    winContainer.add(winText);

    const continueBtn = this.scene.add.container(0, 30);
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0x00ff88, 1);
    btnBg.fillRoundedRect(-80, -20, 160, 40, 10);
    continueBtn.add(btnBg);

    const btnText = this.scene.add.text(0, 0, "SIGUIENTE NIVEL", {
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
      color: "#000000",
    });
    btnText.setOrigin(0.5);
    continueBtn.add(btnText);

    continueBtn.setSize(160, 40);
    continueBtn.setInteractive({ useHandCursor: true });
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
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  /**
   * Muestra mensaje de game over
   */
  public showGameOverMessage(onRetry: () => void): void {
    const { canvas } = GameSettings;

    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    this.add(overlay);

    const gameOverContainer = this.scene.add.container(
      canvas.width / 2,
      canvas.height / 2
    );

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRoundedRect(-150, -100, 300, 200, 20);
    bg.lineStyle(3, 0xe94560, 1);
    bg.strokeRoundedRect(-150, -100, 300, 200, 20);
    gameOverContainer.add(bg);

    const gameOverText = this.scene.add.text(0, -50, "💀 GAME OVER", {
      fontSize: "28px",
      fontFamily: "Arial Black, sans-serif",
      color: "#ff4444",
      align: "center",
    });
    gameOverText.setOrigin(0.5);
    gameOverContainer.add(gameOverText);

    const subText = this.scene.add.text(0, -10, "Mano llena sin movimientos", {
      fontSize: "14px",
      fontFamily: "Arial, sans-serif",
      color: "#aaaaaa",
      align: "center",
    });
    subText.setOrigin(0.5);
    gameOverContainer.add(subText);

    const retryBtn = this.scene.add.container(0, 50);
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xe94560, 1);
    btnBg.fillRoundedRect(-60, -20, 120, 40, 10);
    retryBtn.add(btnBg);

    const btnText = this.scene.add.text(0, 0, "REINTENTAR", {
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
      color: "#ffffff",
    });
    btnText.setOrigin(0.5);
    retryBtn.add(btnText);

    retryBtn.setSize(120, 40);
    retryBtn.setInteractive({ useHandCursor: true });
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

  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xff) * (1 + factor)));
    return (r << 16) | (g << 8) | b;
  }
}
