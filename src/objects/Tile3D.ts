/**
 * Tile3D - Componente visual de ficha con efecto 3D OPTIMIZADO
 * Usa RenderTexture cacheada para mejorar el rendimiento drásticamente
 */

import GameSettings from '../config/GameSettings'
import { TileType, TILE_COLORS, type TileState } from '../types'

// Cache global de texturas para evitar re-renderizar
const textureCache: Map<string, boolean> = new Map()

export class Tile3D extends Phaser.GameObjects.Container {
  private tileState: TileState
  private tileImage!: Phaser.GameObjects.Image
  private blockedOverlay!: Phaser.GameObjects.Image
  private symbolText!: Phaser.GameObjects.Text
  private isHovered: boolean = false

  // Dimensiones
  private tileWidth: number
  private tileHeight: number
  private tileDepth: number

  constructor(scene: Phaser.Scene, x: number, y: number, state: TileState) {
    super(scene, x, y)

    this.tileState = state
    this.tileWidth = GameSettings.tile.width
    this.tileHeight = GameSettings.tile.height
    this.tileDepth = GameSettings.tile.depth

    // Generar textura si no existe
    this.ensureTextures()

    // Crear imagen de la ficha desde textura cacheada
    const textureName = this.getTextureName(state.type)
    this.tileImage = scene.add.image(0, 0, textureName)
    this.add(this.tileImage)

    // Crear overlay de bloqueo
    this.blockedOverlay = scene.add.image(0, 0, 'tile-blocked-overlay')
    this.blockedOverlay.setVisible(!state.isAccessible)
    this.add(this.blockedOverlay)

    // Crear texto del símbolo con estilo cartoon
    const tileColors = TILE_COLORS[state.type]
    this.symbolText = scene.add.text(0, -this.tileDepth / 2, tileColors.symbol, {
      fontSize: '42px',
      fontFamily: 'Arial Black, Impact, sans-serif',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 5,
    })
    this.symbolText.setOrigin(0.5)
    this.add(this.symbolText)

    // Configurar interactividad
    this.setSize(this.tileWidth + this.tileDepth, this.tileHeight + this.tileDepth)
    this.setInteractive({ useHandCursor: true })

    // Eventos
    this.on('pointerover', this.onPointerOver, this)
    this.on('pointerout', this.onPointerOut, this)
    this.on('pointerdown', this.onPointerDown, this)

    scene.add.existing(this)
  }

  private ensureTextures(): void {
    const type = this.tileState.type

    // Textura normal
    const normalKey = this.getTextureName(type)
    if (!textureCache.has(normalKey)) {
      this.generateTileTexture(normalKey, type)
      textureCache.set(normalKey, true)
    }

    // Overlay de bloqueo
    if (!textureCache.has('tile-blocked-overlay')) {
      this.generateBlockedOverlay()
      textureCache.set('tile-blocked-overlay', true)
    }
  }

  private getTextureName(type: TileType): string {
    return `tile-${type}`
  }

  private generateTileTexture(key: string, type: TileType): void {
    const w = this.tileWidth
    const h = this.tileHeight
    const d = this.tileDepth
    const r = GameSettings.tile.cornerRadius
    const colors = TILE_COLORS[type]
    const tileColors = GameSettings.tile.colors

    const textureWidth = w + d + 6
    const textureHeight = h + d + 6

    const g = this.scene.add.graphics()
    const offsetX = 3
    const offsetY = 3

    // Sombra suave
    g.fillStyle(0x000000, 0.35)
    g.fillRoundedRect(offsetX + 5, offsetY + d + 5, w, h, r)

    // Lado derecho (3D) - Estilo madera
    g.fillStyle(tileColors.side, 1)
    g.beginPath()
    g.moveTo(offsetX + w, offsetY + r)
    g.lineTo(offsetX + w + d, offsetY + d + r)
    g.lineTo(offsetX + w + d, offsetY + h + d - r)
    g.lineTo(offsetX + w, offsetY + h - r)
    g.closePath()
    g.fillPath()

    // Lado inferior (3D)
    g.fillStyle(tileColors.bottom, 1)
    g.beginPath()
    g.moveTo(offsetX + r, offsetY + h)
    g.lineTo(offsetX + r + d, offsetY + h + d)
    g.lineTo(offsetX + w - r + d, offsetY + h + d)
    g.lineTo(offsetX + w - r, offsetY + h)
    g.closePath()
    g.fillPath()

    // Esquina inferior derecha
    g.fillStyle(this.darkenColor(tileColors.side, 0.2), 1)
    g.beginPath()
    g.moveTo(offsetX + w - r, offsetY + h)
    g.lineTo(offsetX + w, offsetY + h - r)
    g.lineTo(offsetX + w + d, offsetY + h + d - r)
    g.lineTo(offsetX + w - r + d, offsetY + h + d)
    g.closePath()
    g.fillPath()

    // Cara frontal - Estilo marfil
    g.fillStyle(tileColors.face, 1)
    g.fillRoundedRect(offsetX, offsetY, w, h, r)

    // Borde exterior cartoon
    g.lineStyle(3, tileColors.border, 1)
    g.strokeRoundedRect(offsetX, offsetY, w, h, r)

    // Marco interior con color
    const innerMargin = 10
    g.fillStyle(colors.main, 1)
    g.fillRoundedRect(
      offsetX + innerMargin,
      offsetY + innerMargin,
      w - innerMargin * 2,
      h - innerMargin * 2,
      r - 4
    )

    // Borde del marco interior
    g.lineStyle(2, this.darkenColor(colors.main, 0.3), 1)
    g.strokeRoundedRect(
      offsetX + innerMargin,
      offsetY + innerMargin,
      w - innerMargin * 2,
      h - innerMargin * 2,
      r - 4
    )

    // Brillo superior cartoon
    g.fillStyle(0xffffff, 0.3)
    g.fillRoundedRect(
      offsetX + innerMargin + 3,
      offsetY + innerMargin + 3,
      w - innerMargin * 2 - 6,
      (h - innerMargin * 2) * 0.3,
      { tl: r - 6, tr: r - 6, bl: 0, br: 0 }
    )

    g.generateTexture(key, textureWidth, textureHeight)
    g.destroy()
  }

  private generateBlockedOverlay(): void {
    const w = this.tileWidth
    const h = this.tileHeight
    const r = GameSettings.tile.cornerRadius

    const g = this.scene.add.graphics()
    g.fillStyle(0x000000, 0.55)
    g.fillRoundedRect(3, 3, w, h, r)
    g.generateTexture('tile-blocked-overlay', w + 6, h + 6)
    g.destroy()
  }

  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor))
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor))
    const b = Math.floor((color & 0xff) * (1 - factor))
    return (r << 16) | (g << 8) | b
  }

  private onPointerOver(): void {
    if (!this.tileState.isAccessible) return
    this.isHovered = true
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 80,
      ease: 'Power2',
    })
  }

  private onPointerOut(): void {
    this.isHovered = false
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 80,
      ease: 'Power2',
    })
  }

  private onPointerDown(): void {
    if (!this.tileState.isAccessible) {
      this.scene.tweens.add({
        targets: this,
        x: this.x - 4,
        duration: 40,
        yoyo: true,
        repeat: 2,
        ease: 'Power2',
      })
      return
    }
    this.emit('tile-clicked', this.tileState)
  }

  public updateState(newState: Partial<TileState>): void {
    this.tileState = { ...this.tileState, ...newState }
    this.blockedOverlay.setVisible(!this.tileState.isAccessible)
  }

  public getState(): TileState {
    return this.tileState
  }

  public animateToHand(targetX: number, targetY: number, onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scaleX: 0.75,
      scaleY: 0.75,
      duration: GameSettings.rules.animationSpeed,
      ease: 'Back.easeInOut',
      onComplete: () => onComplete?.(),
    })
  }

  public animateMatch(onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: GameSettings.rules.animationSpeed,
      ease: 'Back.easeIn',
      onComplete: () => {
        onComplete?.()
        this.destroy()
      },
    })
  }

  public setLayerDepth(layer: number): void {
    this.setDepth(layer * 100 + this.tileState.position.y * 10 + this.tileState.position.x)
  }
}

export function clearTileTextureCache(): void {
  textureCache.clear()
}
