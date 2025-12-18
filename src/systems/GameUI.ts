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

  // Badge de nivel
  private levelBadge!: Phaser.GameObjects.Container;
  private levelText!: Phaser.GameObjects.Text;

  // Badge de tiempo
  private timeBadge!: Phaser.GameObjects.Container;
  private timeText!: Phaser.GameObjects.Text;
  private timeRemaining: number = 60;
  private timerEvent?: Phaser.Time.TimerEvent;

  // Hand elements
  private handBg!: Phaser.GameObjects.Graphics;
  private handSlots: Phaser.GameObjects.Container[] = [];
  private handTileSprites: Map<string, Phaser.GameObjects.Container> =
    new Map();

  // State
  private currentScore: number = 0;
  private currentLevel: number = 1;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createLevelBadge();
    this.createScoreBadge();
    this.createTimeBadge();
    this.createHand();

    scene.add.existing(this);
    this.setDepth(1000);
  }

  /**
   * Crea el badge de nivel - A la izquierda del score
   */
  private createLevelBadge(): void {
    const { canvas, ui } = GameSettings;

    // Posición a la izquierda del score (más cerca)
    this.levelBadge = this.scene.add.container(canvas.width / 2 - 150, 55);

    const badgeWidth = 90;
    const badgeHeight = 75; // Misma altura que score
    const badgeDepth = 16;
    const borderRadius = 12;

    const bg = this.scene.add.graphics();

    // Color verde claro (variante del score)
    const badgeColor = 0x27ae60;
    const borderColor = 0x1e8449;

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
      stroke: "#145a32",
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

    const badgeWidth = 200;
    const badgeHeight = 75;
    const badgeDepth = 16; // Profundidad 3D
    const borderRadius = 12; // Esquinas redondeadas

    const bg = this.scene.add.graphics();

    // Colores del badge (verde esmeralda)
    const badgeColor = (ui.colors as any).badge || 0x2e8b57;
    const borderColor = (ui.colors as any).badgeBorder || 0x1e6b47;

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
      stroke: "#1e5a3a",
      strokeThickness: 4,
    });
    this.scoreText.setOrigin(0.5);
    this.scoreBadge.add(this.scoreText);

    this.add(this.scoreBadge);
  }

  /**
   * Crea el badge de tiempo - A la derecha del score
   */
  private createTimeBadge(): void {
    const { canvas, ui } = GameSettings;

    // Posición a la derecha del score (más cerca)
    this.timeBadge = this.scene.add.container(canvas.width / 2 + 150, 55);

    const badgeWidth = 90;
    const badgeHeight = 75; // Misma altura que score
    const badgeDepth = 16;
    const borderRadius = 12;

    const bg = this.scene.add.graphics();

    // Color verde azulado (variante del score)
    const badgeColor = 0x1abc9c;
    const borderColor = 0x16a085;

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
      stroke: "#0e6655",
      strokeThickness: 3,
    });
    this.timeText.setOrigin(0.5);
    this.timeBadge.add(this.timeText);

    this.add(this.timeBadge);
  }

  /**
   * Crea el área del acumulador - Estilo 3D igual al badge
   */
  private createHand(): void {
    const { canvas, hand, ui } = GameSettings;

    const handY = canvas.height - hand.bottomMargin;
    const totalSlotWidth =
      hand.maxSlots * (hand.slotWidth + hand.slotPadding) - hand.slotPadding;
    const handWidth = totalSlotWidth + 30;
    const handX = (canvas.width - handWidth) / 2;
    const handHeight = hand.slotHeight + 20;
    const handDepth = 16; // Profundidad 3D igual al badge
    const borderRadius = 12;

    // Colores (mismo verde que el badge)
    const badgeColor = (ui.colors as any).badge || 0x2e8b57;
    const borderColor = (ui.colors as any).badgeBorder || 0x1e6b47;

    this.handBg = this.scene.add.graphics();

    // Cara inferior (volumen 3D)
    this.handBg.fillStyle(borderColor, 1);
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
    this.handBg.fillStyle(badgeColor, 1);
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
   * Crea un slot individual - Diseño simple con borde verde
   */
  private createSlot(index: number): Phaser.GameObjects.Container {
    const { hand, ui } = GameSettings;
    const pos = this.getSlotPosition(index);

    const container = this.scene.add.container(pos.x, pos.y);

    const slotBg = this.scene.add.graphics();
    const borderColor = (ui.colors as any).badgeBorder || 0x1e6b47;

    // Borde del slot sutil
    slotBg.lineStyle(2, borderColor, 0.6);
    slotBg.strokeRoundedRect(
      -hand.slotWidth / 2,
      -hand.slotHeight / 2,
      hand.slotWidth,
      hand.slotHeight,
      8
    );

    // Fondo semi-transparente
    slotBg.fillStyle(0x000000, 0.12);
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
   * Crea una versión mini de una ficha para la mano - Estilo Mahjong vertical
   */
  private createMiniTile(tile: TileState): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const colors = TILE_COLORS[tile.type];
    const { hand } = GameSettings;
    const tileColors = GameSettings.tile.colors;

    // Dimensiones verticales como las fichas principales
    const w = hand.slotWidth - 6;
    const h = hand.slotHeight - 6;
    const d = 6; // Profundidad 3D
    const r = 5; // Radio de esquinas
    const margin = 3;

    const g = this.scene.add.graphics();

    // === SOMBRA DIFUSA ===
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + d + 2, w, h, r);

    // === CARA INFERIOR (volumen 3D hacia abajo) ===
    g.fillStyle(tileColors.bottom, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + d, w, h, r);

    // === CARA PRINCIPAL ===
    g.fillStyle(tileColors.face, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    // Borde principal
    g.lineStyle(1.5, tileColors.border, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // === ÁREA DE COLOR (interior) ===
    const innerW = w - margin * 2;
    const innerH = h - margin * 2;
    const innerR = r - 1;

    // Fondo del color principal
    g.fillStyle(colors.main, 1);
    g.fillRoundedRect(-w / 2 + margin, -h / 2 + margin, innerW, innerH, innerR);

    // Borde interior sutil
    g.lineStyle(1.5, this.darkenColor(colors.main, 0.35), 1);
    g.strokeRoundedRect(
      -w / 2 + margin,
      -h / 2 + margin,
      innerW,
      innerH,
      innerR
    );

    // === EFECTOS DE LUZ ===
    // Brillo superior
    g.fillStyle(0xffffff, 0.2);
    g.fillRoundedRect(
      -w / 2 + margin + 2,
      -h / 2 + margin + 2,
      innerW - 4,
      innerH * 0.25,
      { tl: innerR - 1, tr: innerR - 1, bl: 0, br: 0 }
    );

    container.add(g);

    // Letra con estilo cartoon - ajustada para fichas verticales
    const fontSize = Math.floor(w * 0.55);
    const symbol = this.scene.add.text(0, -d / 2, colors.letter, {
      fontSize: `${fontSize}px`,
      fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
      color: "#ffffff",
      stroke: this.colorToHex(colors.accent),
      strokeThickness: 3,
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

    // Animación sutil: levantar las 3 fichas, shake y desvanecer
    sprites.forEach((sprite, index) => {
      const originalX = sprite.x;
      const originalY = sprite.y;

      // Primero: levantar las fichas suavemente
      this.scene.tweens.add({
        targets: sprite,
        y: originalY - 25,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 150,
        ease: "Power2",
        onComplete: () => {
          // Shake suave horizontal
          this.scene.tweens.add({
            targets: sprite,
            x: originalX + 4,
            duration: 40,
            yoyo: true,
            repeat: 3,
            ease: "Sine.easeInOut",
            onComplete: () => {
              // Finalmente: desvanecer hacia arriba
              this.scene.tweens.add({
                targets: sprite,
                y: originalY - 50,
                alpha: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 180,
                ease: "Power2",
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
        },
      });
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
      loop: true
    });
  }

  /**
   * Actualiza el timer cada segundo
   */
  private updateTimer(): void {
    this.timeRemaining--;
    this.timeText.setText(this.timeRemaining.toString());
    
    // Cambiar color cuando queda poco tiempo
    if (this.timeRemaining <= 10) {
      this.timeText.setStyle({ color: "#ff6b6b" });
    }
    
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
