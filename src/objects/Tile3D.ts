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

  // Dimensiones
  private tileWidth: number;
  private tileHeight: number;
  private tileDepth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, state: TileState) {
    super(scene, x, y);

    this.tileState = state;
    this.tileWidth = GameSettings.tile.width;
    this.tileHeight = GameSettings.tile.height;
    this.tileDepth = GameSettings.tile.depth;

    // Generar textura si no existe
    this.ensureTextures();

    // Crear imagen de la ficha desde textura cacheada
    const textureName = this.getTextureName(state.type);
    this.tileImage = scene.add.image(0, 0, textureName);
    this.add(this.tileImage);

    // Crear overlay de bloqueo
    this.blockedOverlay = scene.add.image(0, 0, "tile-blocked-overlay");
    this.blockedOverlay.setVisible(!state.isAccessible);
    this.add(this.blockedOverlay);

    // Crear icono - usar imagen si existe, sino texto
    const tileColors = TILE_COLORS[state.type];
    const iconKey = `tile-icon-${state.type}`;
    
    // Calcular el centro visual real de la cara de la ficha
    // La textura tiene: offsetX=4, offsetY=4 para la cara, y depth añade espacio abajo
    // El centro de la textura NO es el centro de la cara visible
    const textureWidth = this.tileWidth + this.tileDepth + 8;
    const textureHeight = this.tileHeight + this.tileDepth + 8;
    const faceOffsetX = 4; // offset de la cara en la textura
    const faceOffsetY = 4;
    
    // Centro de la cara dentro de la textura
    const faceCenterX = faceOffsetX + this.tileWidth / 2;
    const faceCenterY = faceOffsetY + this.tileHeight / 2;
    
    // Centro de la textura (donde Phaser posiciona el origen)
    const textureCenterX = textureWidth / 2;
    const textureCenterY = textureHeight / 2;
    
    // Offset que necesitamos aplicar al icono para centrarlo en la cara
    const iconOffsetX = faceCenterX - textureCenterX;
    const iconOffsetY = faceCenterY - textureCenterY;
    
    if (scene.textures.exists(iconKey)) {
      // Usar imagen en el área interior
      const margin = 8;
      const innerSize = this.tileWidth - margin * 2;
      
      const iconImage = scene.add.image(iconOffsetX, iconOffsetY, iconKey);
      // Escalar para ocupar todo el interior (cuadrado)
      const scale = innerSize / iconImage.width;
      iconImage.setScale(scale);
      this.add(iconImage);
    } else {
      // Fallback a texto del símbolo
      const fontSize = Math.floor(this.tileWidth * 0.5);
      this.symbolText = scene.add.text(
        iconOffsetX,
        iconOffsetY,
        tileColors.symbol,
        {
          fontSize: `${fontSize}px`,
          fontFamily: "Arial Black, Impact, sans-serif",
          color: "#ffffff",
          stroke: "#222222",
          strokeThickness: 3,
        }
      );
      this.symbolText.setOrigin(0.5);
      this.add(this.symbolText);
    }

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
    const iconKey = `tile-icon-${type}`;
    const hasImage = this.scene.textures.exists(iconKey);

    // Textura normal
    const normalKey = this.getTextureName(type);
    if (!textureCache.has(normalKey)) {
      this.generateTileTexture(normalKey, type, hasImage);
      textureCache.set(normalKey, true);
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

  private generateTileTexture(key: string, type: TileType, hasImage: boolean = false): void {
    const w = this.tileWidth;
    const h = this.tileHeight;
    const d = this.tileDepth;
    const r = GameSettings.tile.cornerRadius;
    const colors = TILE_COLORS[type];
    const tileColors = GameSettings.tile.colors;

    const textureWidth = w + d + 8;
    const textureHeight = h + d + 8;

    const g = this.scene.add.graphics();
    const offsetX = 4;
    const offsetY = 4;

    // === SOMBRA SUAVE ===
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(offsetX + 3, offsetY + d + 3, w, h, r);

    // === BORDE 3D SUTIL (solo inferior y derecho) ===
    // Borde inferior
    g.fillStyle(tileColors.bottom, 1);
    g.fillRoundedRect(offsetX, offsetY + d, w, h, r);

    // === CARA PRINCIPAL ===
    // Fondo de la ficha - degradado simulado
    g.fillStyle(tileColors.face, 1);
    g.fillRoundedRect(offsetX, offsetY, w, h, r);

    // Borde exterior elegante
    g.lineStyle(2.5, tileColors.border, 1);
    g.strokeRoundedRect(offsetX, offsetY, w, h, r);

    // === ÁREA DE COLOR (interior) - solo si no tiene imagen ===
    const margin = 8;
    const innerW = w - margin * 2;
    const innerH = h - margin * 2;
    const innerR = r - 3;

    if (!hasImage) {
      // Fondo del color principal
      g.fillStyle(colors.main, 1);
      g.fillRoundedRect(
        offsetX + margin,
        offsetY + margin,
        innerW,
        innerH,
        innerR
      );

      // Borde interior sutil
      g.lineStyle(1.5, this.darkenColor(colors.main, 0.25), 1);
      g.strokeRoundedRect(
        offsetX + margin,
        offsetY + margin,
        innerW,
        innerH,
        innerR
      );

      // === EFECTOS DE LUZ ===
      // Brillo superior (reflejo de luz)
      g.fillStyle(0xffffff, 0.25);
      g.fillRoundedRect(
        offsetX + margin + 4,
        offsetY + margin + 4,
        innerW - 8,
        innerH * 0.25,
        { tl: innerR - 2, tr: innerR - 2, bl: 0, br: 0 }
      );
    }

    // Línea de brillo en el borde superior de la ficha
    g.lineStyle(1, 0xffffff, 0.3);
    g.beginPath();
    g.arc(offsetX + r, offsetY + r, r - 1, Math.PI, Math.PI * 1.5);
    g.lineTo(offsetX + w - r, offsetY + 1);
    g.arc(offsetX + w - r, offsetY + r, r - 1, Math.PI * 1.5, Math.PI * 2);
    g.strokePath();

    g.generateTexture(key, textureWidth, textureHeight);
    g.destroy();
  }

  private generateBlockedOverlay(): void {
    const w = this.tileWidth;
    const h = this.tileHeight;
    const d = this.tileDepth;
    const r = GameSettings.tile.cornerRadius;

    const g = this.scene.add.graphics();
    // Overlay semi-transparente con el mismo tamaño que la ficha
    g.fillStyle(0x000000, GameSettings.tile.colors.blockedAlpha);
    g.fillRoundedRect(4, 4, w, h, r);

    // Líneas diagonales para indicar bloqueo
    g.lineStyle(1.5, 0x000000, 0.3);
    for (let i = -h; i < w; i += 20) {
      g.beginPath();
      g.moveTo(Math.max(4, 4 + i), 4);
      g.lineTo(Math.min(4 + w, 4 + i + h), Math.min(4 + h, 4 + h));
      g.strokePath();
    }

    g.generateTexture("tile-blocked-overlay", w + d + 8, h + d + 8);
    g.destroy();
  }

  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
    const b = Math.floor((color & 0xff) * (1 - factor));
    return (r << 16) | (g << 8) | b;
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
    this.setDepth(
      layer * 100 + this.tileState.position.y * 10 + this.tileState.position.x
    );
  }
}

export function clearTileTextureCache(): void {
  textureCache.clear();
}
