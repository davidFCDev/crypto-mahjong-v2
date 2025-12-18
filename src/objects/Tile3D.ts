/**
 * Tile3D - Componente visual de ficha con efecto 3D OPTIMIZADO
 * Usa RenderTexture cacheada para mejorar el rendimiento drásticamente
 */

import GameSettings from "../config/GameSettings";
import { TILE_COLORS, TileType, type TileState } from "../types";

// Cache global de texturas para evitar re-renderizar
const textureCache: Map<string, boolean> = new Map();

export class Tile3D extends Phaser.GameObjects.Container {
  private tileState: TileState;
  private tileImage!: Phaser.GameObjects.Image;
  private blockedOverlay!: Phaser.GameObjects.Image;
  private symbolText!: Phaser.GameObjects.Text;
  private isHovered: boolean = false;
  private showBottom3D: boolean = true; // Si debe mostrar el volumen 3D inferior

  // Dimensiones
  private tileWidth: number;
  private tileHeight: number;
  private tileDepth: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    state: TileState,
    showBottom3D: boolean = true
  ) {
    super(scene, x, y);

    this.tileState = state;
    this.showBottom3D = showBottom3D;
    this.tileWidth = GameSettings.tile.width;
    this.tileHeight = GameSettings.tile.height;
    this.tileDepth = GameSettings.tile.depth;

    // Generar textura si no existe
    this.ensureTextures();

    // Crear imagen de la ficha desde textura cacheada
    const textureName = this.getCurrentTextureName();
    this.tileImage = scene.add.image(0, 0, textureName);
    this.add(this.tileImage);

    // Crear letra con estilo para identificar el tipo
    const tileColors = TILE_COLORS[state.type];

    // Calcular el centro visual real de la cara de la ficha
    // La textura tiene: offsetX=4, offsetY=4 para la cara, y depth añade espacio abajo
    const textureWidth = this.tileWidth + 8;
    const textureHeight = this.tileHeight + this.tileDepth + 8;
    const faceOffsetX = 4;
    const faceOffsetY = 4;

    // Centro de la cara dentro de la textura
    const faceCenterX = faceOffsetX + this.tileWidth / 2;
    const faceCenterY = faceOffsetY + this.tileHeight / 2;

    // Centro de la textura (donde Phaser posiciona el origen)
    const textureCenterX = textureWidth / 2;
    const textureCenterY = textureHeight / 2;

    // Offset que necesitamos aplicar para centrar en la cara
    const iconOffsetX = faceCenterX - textureCenterX;
    const iconOffsetY = faceCenterY - textureCenterY;

    // Letra grande con estilo cartoon
    const fontSize = Math.floor(this.tileWidth * 0.55);
    this.symbolText = scene.add.text(
      iconOffsetX,
      iconOffsetY,
      tileColors.letter,
      {
        fontSize: `${fontSize}px`,
        fontFamily: "'Fredoka One', 'Comic Sans MS', 'Bangers', cursive",
        color: "#ffffff",
        stroke: this.colorToHex(tileColors.accent),
        strokeThickness: 4,
        shadow: {
          offsetX: 1,
          offsetY: 2,
          color: "#000000",
          blur: 0,
          fill: true,
        },
      }
    );
    this.symbolText.setOrigin(0.5);
    this.add(this.symbolText);

    // Crear overlay de bloqueo AL FINAL para que esté por encima de todo
    this.blockedOverlay = scene.add.image(
      iconOffsetX,
      iconOffsetY,
      "tile-blocked-overlay"
    );
    this.blockedOverlay.setVisible(!state.isAccessible);
    this.add(this.blockedOverlay);

    // Configurar interactividad
    this.setSize(
      this.tileWidth + this.tileDepth,
      this.tileHeight + this.tileDepth
    );
    this.setInteractive({ useHandCursor: true });

    // Eventos
    this.on("pointerover", this.onPointerOver, this);
    this.on("pointerout", this.onPointerOut, this);
    this.on("pointerdown", this.onPointerDown, this);

    scene.add.existing(this);
  }

  private ensureTextures(): void {
    const type = this.tileState.type;

    // Textura normal CON volumen 3D
    const normalKey = this.getTextureName(type);
    if (!textureCache.has(normalKey)) {
      this.generateTileTexture(normalKey, type, true);
      textureCache.set(normalKey, true);
    }

    // Textura SIN volumen 3D (para fichas con adyacente abajo)
    const flatKey = this.getTextureName(type) + "-flat";
    if (!textureCache.has(flatKey)) {
      this.generateTileTexture(flatKey, type, false);
      textureCache.set(flatKey, true);
    }

    // Overlay de bloqueo
    if (!textureCache.has("tile-blocked-overlay")) {
      this.generateBlockedOverlay();
      textureCache.set("tile-blocked-overlay", true);
    }
  }

  private getTextureName(type: TileType): string {
    return `tile-${type}`;
  }

  private getCurrentTextureName(): string {
    const base = this.getTextureName(this.tileState.type);
    return this.showBottom3D ? base : base + "-flat";
  }

  private generateTileTexture(
    key: string,
    type: TileType,
    showBottom: boolean
  ): void {
    const w = this.tileWidth;
    const h = this.tileHeight;
    const d = this.tileDepth;
    const r = GameSettings.tile.cornerRadius;
    const colors = TILE_COLORS[type];
    const tileColors = GameSettings.tile.colors;

    const textureWidth = w + 8;
    const textureHeight = h + d + 8;

    const g = this.scene.add.graphics();
    const offsetX = 4;
    const offsetY = 4;

    // Solo dibujar 3D si showBottom es true
    if (showBottom) {
      // === SOMBRA DIFUSA ===
      g.fillStyle(0x000000, 0.2);
      g.fillRoundedRect(offsetX + 3, offsetY + d + 3, w, h, r);

      // === CARA LATERAL DERECHA (efecto 3D) ===
      g.fillStyle(tileColors.side, 1);
      g.beginPath();
      g.moveTo(offsetX + w - r, offsetY + h);
      g.lineTo(offsetX + w, offsetY + h);
      g.lineTo(offsetX + w, offsetY + h + d);
      g.lineTo(offsetX + w - r, offsetY + h + d);
      g.closePath();
      g.fillPath();

      // === CARA INFERIOR (volumen 3D hacia abajo) ===
      g.fillStyle(tileColors.bottom, 1);
      g.fillRoundedRect(offsetX, offsetY + d, w, h, r);

      // Borde oscuro en la cara inferior para profundidad
      g.lineStyle(1, this.darkenColor(tileColors.bottom, 0.3), 1);
      g.strokeRoundedRect(offsetX, offsetY + d, w, h, r);
    }

    // === CARA PRINCIPAL (superficie de la ficha) ===
    g.fillStyle(tileColors.face, 1);
    g.fillRoundedRect(offsetX, offsetY, w, h, r);

    // Borde principal de la ficha
    g.lineStyle(2, tileColors.border, 1);
    g.strokeRoundedRect(offsetX, offsetY, w, h, r);

    // === ÁREA DE COLOR (zona interior donde va el símbolo) ===
    const margin = 5;
    const innerW = w - margin * 2;
    const innerH = h - margin * 2;
    const innerR = r - 1;

    // Fondo con gradiente del color del tipo
    g.fillStyle(colors.main, 1);
    g.fillRoundedRect(
      offsetX + margin,
      offsetY + margin,
      innerW,
      innerH,
      innerR
    );

    // Borde interior más oscuro
    g.lineStyle(2, this.darkenColor(colors.main, 0.35), 1);
    g.strokeRoundedRect(
      offsetX + margin,
      offsetY + margin,
      innerW,
      innerH,
      innerR
    );

    // === EFECTOS DE LUZ Y BRILLO ===
    // Brillo superior grande (efecto cristal)
    g.fillStyle(0xffffff, 0.25);
    g.fillRoundedRect(
      offsetX + margin + 3,
      offsetY + margin + 3,
      innerW - 6,
      innerH * 0.3,
      { tl: innerR - 1, tr: innerR - 1, bl: 0, br: 0 }
    );

    // Línea de brillo en el borde superior de toda la ficha
    g.lineStyle(1.5, 0xffffff, 0.4);
    g.beginPath();
    g.moveTo(offsetX + r, offsetY + 1);
    g.lineTo(offsetX + w - r, offsetY + 1);
    g.strokePath();

    // Pequeño brillo en esquina superior izquierda
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(offsetX + margin + 8, offsetY + margin + 8, 4);

    g.generateTexture(key, textureWidth, textureHeight);
    g.destroy();
  }

  private generateBlockedOverlay(): void {
    const w = this.tileWidth;
    const h = this.tileHeight;
    const d = this.tileDepth;
    const r = GameSettings.tile.cornerRadius;

    const g = this.scene.add.graphics();

    // Overlay oscuro muy visible para fichas bloqueadas
    g.fillStyle(0x1a1a1a, 0.65);
    g.fillRoundedRect(4, 4, w, h, r);

    // Borde oscuro adicional para destacar
    g.lineStyle(1, 0x000000, 0.4);
    g.strokeRoundedRect(4, 4, w, h, r);

    g.generateTexture("tile-blocked-overlay", w + 8, h + d + 8);
    g.destroy();
  }

  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((color & 0xff) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }

  private colorToHex(color: number): string {
    return "#" + color.toString(16).padStart(6, "0");
  }

  private onPointerOver(): void {
    if (!this.tileState.isAccessible) return;
    this.isHovered = true;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 80,
      ease: "Power2",
    });
  }

  private onPointerOut(): void {
    this.isHovered = false;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 80,
      ease: "Power2",
    });
  }

  private onPointerDown(): void {
    if (!this.tileState.isAccessible) {
      this.scene.tweens.add({
        targets: this,
        x: this.x - 4,
        duration: 40,
        yoyo: true,
        repeat: 2,
        ease: "Power2",
      });
      return;
    }
    this.emit("tile-clicked", this.tileState);
  }

  public updateState(newState: Partial<TileState>): void {
    this.tileState = { ...this.tileState, ...newState };
    this.blockedOverlay.setVisible(!this.tileState.isAccessible);
  }

  /**
   * Actualiza la visibilidad del efecto 3D inferior
   * Llamar cuando cambia el estado del tablero
   */
  public updateBottom3D(showBottom: boolean): void {
    if (this.showBottom3D === showBottom) return; // Sin cambios

    this.showBottom3D = showBottom;
    const newTexture = this.getCurrentTextureName();
    this.tileImage.setTexture(newTexture);
  }

  public getState(): TileState {
    return this.tileState;
  }

  public animateToHand(
    targetX: number,
    targetY: number,
    onComplete?: () => void
  ): void {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scaleX: 0.75,
      scaleY: 0.75,
      duration: GameSettings.rules.animationSpeed,
      ease: "Back.easeInOut",
      onComplete: () => onComplete?.(),
    });
  }

  public animateMatch(onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: GameSettings.rules.animationSpeed,
      ease: "Back.easeIn",
      onComplete: () => {
        onComplete?.();
        this.destroy();
      },
    });
  }

  public setLayerDepth(layer: number): void {
    // Capas superiores (Z mayor) siempre se dibujan encima
    // Dentro de la misma capa, fichas con mayor Y se dibujan encima
    const zDepth = layer * 1000;
    const yDepth = Math.floor(this.tileState.position.y * 100);
    const xDepth = Math.floor(this.tileState.position.x);
    this.setDepth(zDepth + yDepth + xDepth);
  }
}

export function clearTileTextureCache(): void {
  textureCache.clear();
}
