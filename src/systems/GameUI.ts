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
   * Efecto satisfactorio: las fichas convergen al centro, giran y explotan con partículas
   */
  public animateMatch(tileIds: string[], onComplete?: () => void): void {
    const sprites: Phaser.GameObjects.Container[] = [];

    tileIds.forEach((id) => {
      const sprite = this.handTileSprites.get(id);
      if (sprite) {
        sprites.push(sprite);
      }
    });

    if (sprites.length === 0) {
      onComplete?.();
      return;
    }

    // Calcular centro de las 3 fichas
    let centerX = 0;
    let centerY = 0;
    sprites.forEach((sprite) => {
      centerX += sprite.x;
      centerY += sprite.y;
    });
    centerX /= sprites.length;
    centerY /= sprites.length;

    // Fase 1: Las fichas se iluminan y flotan hacia arriba
    sprites.forEach((sprite, index) => {
      const delay = index * 50; // Escalonar ligeramente

      // Efecto de brillo (glow) - crear un overlay blanco
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xffffff, 0);
      const bounds = sprite.getBounds();
      glow.fillRoundedRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height, 8);
      glow.setPosition(sprite.x, sprite.y);
      this.add(glow);

      // Animar el glow
      this.scene.tweens.add({
        targets: glow,
        alpha: 0.6,
        duration: 200,
        delay: delay,
        yoyo: true,
        ease: "Sine.easeInOut",
        onComplete: () => glow.destroy(),
      });

      // Fase 1: Flotar y brillar
      this.scene.tweens.add({
        targets: sprite,
        y: sprite.y - 20,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        delay: delay,
        ease: "Back.easeOut",
        onComplete: () => {
          // Fase 2: Converger al centro con rotación
          this.scene.tweens.add({
            targets: sprite,
            x: centerX,
            y: centerY - 40,
            rotation: (index - 1) * 0.3, // Rotación diferente para cada ficha
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 250,
            ease: "Power3.easeIn",
            onComplete: () => {
              // Fase 3: Explosión final
              if (index === sprites.length - 1) {
                // Crear partículas de explosión
                this.createMatchParticles(centerX, centerY - 40);
                
                // Flash blanco
                this.createFlashEffect(centerX, centerY - 40);
              }

              // Escalar a 0 con bounce
              this.scene.tweens.add({
                targets: sprite,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                rotation: sprite.rotation + 0.5,
                duration: 150,
                ease: "Back.easeIn",
                onComplete: () => {
                  sprite.destroy();
                  this.handTileSprites.delete(tileIds[index]);
                  if (index === sprites.length - 1 && onComplete) {
                    // Pequeño delay para que se vean las partículas
                    this.scene.time.delayedCall(100, () => onComplete());
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
   * Crea partículas de explosión para el match
   */
  private createMatchParticles(x: number, y: number): void {
    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0xffe66d, 0xc44dff, 0x44ff88];
    const particleCount = 16;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 120 + Math.random() * 80;
      const size = 6 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);
      particle.setAlpha(1);
      this.add(particle);

      // Animar partícula hacia afuera con gravedad
      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY + 30, // Simular gravedad
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 400 + Math.random() * 200,
        ease: "Power2.easeOut",
        onComplete: () => particle.destroy(),
      });
    }

    // Estrellas/sparkles adicionales
    for (let i = 0; i < 8; i++) {
      const star = this.scene.add.text(x, y, "✦", {
        fontSize: `${16 + Math.random() * 12}px`,
        color: "#ffd700",
      });
      star.setOrigin(0.5);
      this.add(star);

      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 60;

      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 20,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        rotation: Math.random() * 2,
        duration: 500 + Math.random() * 200,
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
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    this.add(overlay);

    const modalWidth = 380;
    const modalHeight = 220;
    const borderRadius = 16;
    const depth3D = 16;

    // Colores estilo badges (verde)
    const badgeColor = 0x27ae60;
    const borderColor = 0x1e8449;

    // Contenedor centrado correctamente
    const winContainer = this.scene.add.container(
      canvas.width / 2,
      canvas.height / 2 - modalHeight / 2
    );

    const bg = this.scene.add.graphics();

    // Cara 3D inferior (como los badges)
    bg.fillStyle(borderColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde de la cara 3D
    bg.lineStyle(2, this.darkenColor(borderColor, 0.3), 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      depth3D,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Cara principal (como los badges)
    bg.fillStyle(badgeColor, 1);
    bg.fillRoundedRect(
      -modalWidth / 2,
      0,
      modalWidth,
      modalHeight,
      borderRadius
    );

    // Borde de la cara principal
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(
      -modalWidth / 2,
      0,
      modalWidth,
      modalHeight,
      borderRadius
    );
    winContainer.add(bg);

    const winText = this.scene.add.text(0, 60, "LEVEL COMPLETE!", {
      fontSize: "32px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#ffffff",
      stroke: "#145a32",
      strokeThickness: 4,
      align: "center",
    });
    winText.setOrigin(0.5);
    winContainer.add(winText);

    // Botón con estilo 3D (blanco como contraste)
    const continueBtn = this.scene.add.container(0, 135);
    const btnWidth = 220;
    const btnHeight = 52;
    const btnDepth = 6;

    const btnBg = this.scene.add.graphics();
    // Sombra del botón
    btnBg.fillStyle(0xcccccc, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, btnDepth, btnWidth, btnHeight, 12);
    // Cara del botón (blanco)
    btnBg.fillStyle(0xffffff, 1);
    btnBg.fillRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 12);
    // Borde
    btnBg.lineStyle(2, borderColor, 1);
    btnBg.strokeRoundedRect(-btnWidth / 2, 0, btnWidth, btnHeight, 12);
    continueBtn.add(btnBg);

    const btnText = this.scene.add.text(0, btnHeight / 2, "NEXT LEVEL", {
      fontSize: "20px",
      fontFamily: "'Fredoka One', Arial Black, sans-serif",
      color: "#1e8449",
    });
    btnText.setOrigin(0.5);
    continueBtn.add(btnText);

    continueBtn.setSize(btnWidth, btnHeight + btnDepth);
    continueBtn.setInteractive({ useHandCursor: true });

    continueBtn.on("pointerover", () => {
      btnBg.alpha = 0.9;
    });

    continueBtn.on("pointerout", () => {
      btnBg.alpha = 1;
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
