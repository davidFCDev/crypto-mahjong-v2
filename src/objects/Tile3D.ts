/**
 * Tile3D - Componente visual de ficha con efecto 3D
 * Renderiza una ficha de Mahjong con aspecto tridimensional usando gráficos de Phaser
 */

import GameSettings from '../config/GameSettings'
import { TileType, TILE_COLORS, type TileState } from '../types'

export class Tile3D extends Phaser.GameObjects.Container {
  private tileState: TileState
  private tileGraphics: Phaser.GameObjects.Graphics
  private symbolText: Phaser.GameObjects.Text
  private blockedOverlay: Phaser.GameObjects.Graphics
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

    // Crear gráficos de la ficha
    this.tileGraphics = scene.add.graphics()
    this.add(this.tileGraphics)

    // Crear overlay para fichas bloqueadas
    this.blockedOverlay = scene.add.graphics()
    this.add(this.blockedOverlay)

    // Crear texto del símbolo
    const tileColors = TILE_COLORS[state.type]
    this.symbolText = scene.add.text(0, -this.tileDepth / 2, tileColors.symbol, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    })
    this.symbolText.setOrigin(0.5)
    this.add(this.symbolText)

    // Renderizar la ficha
    this.render()

    // Configurar interactividad
    this.setSize(this.tileWidth, this.tileHeight + this.tileDepth)
    this.setInteractive({ useHandCursor: true })

    // Eventos de interacción
    this.on('pointerover', this.onPointerOver, this)
    this.on('pointerout', this.onPointerOut, this)
    this.on('pointerdown', this.onPointerDown, this)

    // Añadir al scene
    scene.add.existing(this)
  }

  /**
   * Renderiza la ficha con efecto 3D
   */
  private render(): void {
    const g = this.tileGraphics
    g.clear()

    const w = this.tileWidth
    const h = this.tileHeight
    const d = this.tileDepth
    const r = GameSettings.tile.cornerRadius
    const colors = TILE_COLORS[this.tileState.type]

    // Offset para centrar
    const offsetX = -w / 2
    const offsetY = -h / 2 - d / 2

    // === Cara inferior (sombra/profundidad) ===
    g.fillStyle(0x333333, 1)
    g.fillRoundedRect(offsetX + 2, offsetY + d + 2, w, h, r)

    // === Lado derecho (3D) ===
    g.fillStyle(this.darkenColor(colors.main, 0.5), 1)
    g.beginPath()
    g.moveTo(offsetX + w, offsetY + r)
    g.lineTo(offsetX + w + d, offsetY + d + r)
    g.lineTo(offsetX + w + d, offsetY + h + d - r)
    g.lineTo(offsetX + w, offsetY + h - r)
    g.closePath()
    g.fillPath()

    // === Lado inferior (3D) ===
    g.fillStyle(this.darkenColor(colors.main, 0.6), 1)
    g.beginPath()
    g.moveTo(offsetX + r, offsetY + h)
    g.lineTo(offsetX + r + d, offsetY + h + d)
    g.lineTo(offsetX + w - r + d, offsetY + h + d)
    g.lineTo(offsetX + w - r, offsetY + h)
    g.closePath()
    g.fillPath()

    // === Esquina inferior derecha (3D) ===
    g.fillStyle(this.darkenColor(colors.main, 0.55), 1)
    g.beginPath()
    g.moveTo(offsetX + w - r, offsetY + h)
    g.lineTo(offsetX + w, offsetY + h - r)
    g.lineTo(offsetX + w + d, offsetY + h + d - r)
    g.lineTo(offsetX + w - r + d, offsetY + h + d)
    g.closePath()
    g.fillPath()

    // === Cara frontal (superficie principal) ===
    const faceColor = this.isHovered ? this.lightenColor(colors.main, 0.2) : colors.main
    g.fillStyle(faceColor, 1)
    g.fillRoundedRect(offsetX, offsetY, w, h, r)

    // === Borde de la cara frontal ===
    g.lineStyle(2, this.darkenColor(colors.main, 0.3), 1)
    g.strokeRoundedRect(offsetX, offsetY, w, h, r)

    // === Área interior (más clara) ===
    const innerMargin = 6
    g.fillStyle(this.lightenColor(colors.main, 0.3), 1)
    g.fillRoundedRect(
      offsetX + innerMargin,
      offsetY + innerMargin,
      w - innerMargin * 2,
      h - innerMargin * 2,
      r - 2
    )

    // === Brillo superior (efecto de luz) ===
    g.fillStyle(0xffffff, 0.15)
    g.fillRoundedRect(
      offsetX + innerMargin,
      offsetY + innerMargin,
      w - innerMargin * 2,
      (h - innerMargin * 2) * 0.3,
      { tl: r - 2, tr: r - 2, bl: 0, br: 0 }
    )

    // Actualizar overlay de bloqueo
    this.updateBlockedState()
  }

  /**
   * Actualiza el estado visual de bloqueo
   */
  private updateBlockedState(): void {
    this.blockedOverlay.clear()

    if (!this.tileState.isAccessible) {
      const w = this.tileWidth
      const h = this.tileHeight
      const d = this.tileDepth
      const r = GameSettings.tile.cornerRadius
      const offsetX = -w / 2
      const offsetY = -h / 2 - d / 2

      // Overlay oscuro semi-transparente
      this.blockedOverlay.fillStyle(0x000000, 0.5)
      this.blockedOverlay.fillRoundedRect(offsetX, offsetY, w, h, r)

      // Patrón de líneas diagonales para indicar bloqueo
      this.blockedOverlay.lineStyle(1, 0x666666, 0.3)
      for (let i = -h; i < w + h; i += 12) {
        this.blockedOverlay.beginPath()
        this.blockedOverlay.moveTo(offsetX + i, offsetY)
        this.blockedOverlay.lineTo(offsetX + i + h, offsetY + h)
        this.blockedOverlay.strokePath()
      }
    }
  }

  /**
   * Oscurece un color
   */
  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * (1 - factor))
    const g = Math.floor(((color >> 8) & 0xff) * (1 - factor))
    const b = Math.floor((color & 0xff) * (1 - factor))
    return (r << 16) | (g << 8) | b
  }

  /**
   * Aclara un color
   */
  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + factor)))
    const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + factor)))
    const b = Math.min(255, Math.floor((color & 0xff) * (1 + factor)))
    return (r << 16) | (g << 8) | b
  }

  // === Event Handlers ===

  private onPointerOver(): void {
    if (!this.tileState.isAccessible) return
    this.isHovered = true
    this.render()
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2',
    })
  }

  private onPointerOut(): void {
    this.isHovered = false
    this.render()
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power2',
    })
  }

  private onPointerDown(): void {
    if (!this.tileState.isAccessible) {
      // Shake animation para indicar que no se puede seleccionar
      this.scene.tweens.add({
        targets: this,
        x: this.x - 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2',
      })
      return
    }

    // Emit event para el sistema de juego
    this.emit('tile-clicked', this.tileState)
  }

  // === Public Methods ===

  /**
   * Actualiza el estado de la ficha
   */
  public updateState(newState: Partial<TileState>): void {
    this.tileState = { ...this.tileState, ...newState }
    this.render()
  }

  /**
   * Obtiene el estado actual
   */
  public getState(): TileState {
    return this.tileState
  }

  /**
   * Animación de selección (mover a la mano)
   */
  public animateToHand(targetX: number, targetY: number, onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: GameSettings.rules.animationSpeed,
      ease: 'Back.easeInOut',
      onComplete: () => {
        if (onComplete) onComplete()
      },
    })
  }

  /**
   * Animación de match (desaparecer)
   */
  public animateMatch(onComplete?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: GameSettings.rules.animationSpeed,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (onComplete) onComplete()
        this.destroy()
      },
    })
  }

  /**
   * Establece la profundidad visual basada en la capa
   */
  public setLayerDepth(layer: number): void {
    this.setDepth(layer * 100 + this.tileState.position.y * 10 + this.tileState.position.x)
  }
}
