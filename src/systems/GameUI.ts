/**
 * GameUI - Componente de interfaz de usuario del juego
 * Diseño minimalista con badge de score
 */

import GameSettings from "../config/GameSettings";
import { TILE_COLORS, type HandSlot, type TileState } from "../types";

export class GameUI extends Phaser.GameObjects.Container {
  // Badge de score
  private scoreBadge!: Phaser.GameObjects.Container;
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

    this.createScoreBadge();
    this.createHand();
    this.createRestartButton();

    scene.add.existing(this);
    this.setDepth(1000);
  }

  /**
   * Crea el badge de score estilo "Daily Challenge"
   */
  private createScoreBadge(): void {
    const { canvas, ui } = GameSettings;
    
    this.scoreBadge = this.scene.add.container(canvas.width / 2, 35);

    const badgeWidth = 180;
    const badgeHeight = 40;

    const bg = this.scene.add.graphics();
    
    // Sombra
    bg.fillStyle(0x000000, 0.3);
    bg.fillRoundedRect(-badgeWidth/2 + 3, 3, badgeWidth, badgeHeight, 8);
    
    // Fondo rojo del badge
    bg.fillStyle((ui.colors as any).badge || 0xc94a4a, 1);
    bg.fillRoundedRect(-badgeWidth/2, 0, badgeWidth, badgeHeight, 8);
    
    // Borde
    bg.lineStyle(3, (ui.colors as any).badgeBorder || 0x8a2a2a, 1);
    bg.strokeRoundedRect(-badgeWidth/2, 0, badgeWidth, badgeHeight, 8);
    
    // Línea decorativa superior
    bg.fillStyle(0xffffff, 0.2);
    bg.fillRoundedRect(-badgeWidth/2 + 5, 3, badgeWidth - 10, 8, {tl: 4, tr: 4, bl: 0, br: 0});
    
    this.scoreBadge.add(bg);

    // Texto del score
    this.scoreText = this.scene.add.text(0, badgeHeight/2, "Score: 0", {
      fontSize: `${ui.fontSize.score}px`,
      fontFamily: "Arial Black, Impact, sans-serif",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    this.scoreText.setOrigin(0.5);
    this.scoreBadge.add(this.scoreText);

    this.add(this.scoreBadge);
  }

  /**
   * Crea el área del acumulador - Diseño limpio y moderno
   */
  private createHand(): void {
    const { canvas, hand } = GameSettings;

    const handY = canvas.height - hand.bottomMargin;
    const totalSlotWidth = hand.maxSlots * (hand.slotWidth + hand.slotPadding) - hand.slotPadding;
    const handWidth = totalSlotWidth + 30;
    const handX = (canvas.width - handWidth) / 2;
    const handHeight = hand.slotHeight + 20;

    this.handBg = this.scene.add.graphics();

    // Sombra suave
    this.handBg.fillStyle(0x000000, 0.25);
    this.handBg.fillRoundedRect(handX + 4, handY - handHeight/2 + 4, handWidth, handHeight, 15);

    // Fondo del acumulador
    this.handBg.fillStyle(hand.backgroundColor, 0.95);
    this.handBg.fillRoundedRect(handX, handY - handHeight/2, handWidth, handHeight, 15);

    // Borde exterior
    this.handBg.lineStyle(3, hand.slotBorderColor, 1);
    this.handBg.strokeRoundedRect(handX, handY - handHeight/2, handWidth, handHeight, 15);

    this.add(this.handBg);

    // Crear slots
    for (let i = 0; i < hand.maxSlots; i++) {
      const slotContainer = this.createSlot(i);
      this.handSlots.push(slotContainer);
      this.add(slotContainer);
    }
  }

  /**
   * Crea un slot individual - Diseño simple
   */
  private createSlot(index: number): Phaser.GameObjects.Container {
    const { hand } = GameSettings;
    const pos = this.getSlotPosition(index);

    const container = this.scene.add.container(pos.x, pos.y);

    const slotBg = this.scene.add.graphics();

    // Borde del slot sutil
    slotBg.lineStyle(2, hand.slotBorderColor, 0.5);
    slotBg.strokeRoundedRect(
      -hand.slotWidth / 2,
      -hand.slotHeight / 2,
      hand.slotWidth,
      hand.slotHeight,
      8
    );

    // Fondo semi-transparente
    slotBg.fillStyle(0x000000, 0.15);
    slotBg.fillRoundedRect(
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
   * Crea el botón de reinicio - Pequeño en esquina
   */
  private createRestartButton(): void {
    const { canvas } = GameSettings;

    this.restartButton = this.scene.add.container(canvas.width - 40, 40);

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xe94560, 1);
    btnBg.fillCircle(0, 0, 22);
    btnBg.lineStyle(2, 0xffffff, 0.5);
    btnBg.strokeCircle(0, 0, 22);
    this.restartButton.add(btnBg);

    const btnText = this.scene.add.text(0, 0, "↺", {
      fontSize: "22px",
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

    // Dimensiones basadas en el slot, mismo estilo que Tile3D
    const w = hand.slotWidth - 16;
    const h = hand.slotHeight - 16;
    const d = 6; // Profundidad 3D
    const r = 8; // Radio de esquinas
    const margin = 6;

    const g = this.scene.add.graphics();

    // === SOMBRA SUAVE ===
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + d + 3, w, h, r);

    // === BORDE 3D SUTIL (solo inferior) ===
    g.fillStyle(tileColors.bottom, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + d, w, h, r);

    // === CARA PRINCIPAL ===
    g.fillStyle(tileColors.face, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    // Borde exterior elegante
    g.lineStyle(2, tileColors.border, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // === ÁREA DE COLOR (interior) ===
    const innerW = w - margin * 2;
    const innerH = h - margin * 2;
    const innerR = r - 2;

    // Fondo del color principal
    g.fillStyle(colors.main, 1);
    g.fillRoundedRect(-w / 2 + margin, -h / 2 + margin, innerW, innerH, innerR);

    // Borde interior sutil
    g.lineStyle(1, this.darkenColor(colors.main, 0.25), 1);
    g.strokeRoundedRect(
      -w / 2 + margin,
      -h / 2 + margin,
      innerW,
      innerH,
      innerR
    );

    // === EFECTOS DE LUZ ===
    // Brillo superior
    g.fillStyle(0xffffff, 0.25);
    g.fillRoundedRect(
      -w / 2 + margin + 3,
      -h / 2 + margin + 3,
      innerW - 6,
      innerH * 0.25,
      { tl: innerR - 1, tr: innerR - 1, bl: 0, br: 0 }
    );

    container.add(g);

    // Símbolo
    const symbol = this.scene.add.text(0, -d / 2, colors.symbol, {
      fontSize: "24px",
      fontFamily: "Arial Black, sans-serif",
      color: "#ffffff",
      stroke: "#333333",
      strokeThickness: 2,
    });
    symbol.setOrigin(0.5);
    container.add(symbol);

    return container;
  }

  /**
   * Anima la eliminación de fichas que hicieron match
   * Efecto sutil: las fichas se levantan un poco y desaparecen
   */
  public animateMatch(tileIds: string[], onComplete?: () => void): void {
    const sprites: Phaser.GameObjects.Container[] = [];

    tileIds.forEach((id) => {
      const sprite = this.handTileSprites.get(id);
      if (sprite) {
        sprites.push(sprite);
      }
    });

    // Animación sutil: levantar las 3 fichas y desvanecerlas
    sprites.forEach((sprite, index) => {
      // Primero: levantar las fichas suavemente
      this.scene.tweens.add({
        targets: sprite,
        y: sprite.y - 30,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power2",
        onComplete: () => {
          // Después: pequeño movimiento lateral y desvanecer
          this.scene.tweens.add({
            targets: sprite,
            y: sprite.y - 20,
            alpha: 0,
            duration: 250,
            ease: "Power1",
            onComplete: () => {
              sprite.destroy();
              this.handTileSprites.delete(tileIds[index]);
              if (index === sprites.length - 1 && onComplete) {
                onComplete();
              }
            },
          });
        },
      });
    });
  }

  /**
   * Actualiza el nivel mostrado (ahora solo guarda el estado)
   */
  public updateLevel(level: number): void {
    this.currentLevel = level;
    // Ya no hay texto de nivel visible, el badge solo muestra score
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
          this.scoreText.setText(`Score: ${Math.floor(value)}`);
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
