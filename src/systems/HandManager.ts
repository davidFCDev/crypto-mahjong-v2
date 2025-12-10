/**
 * HandManager - Sistema de gestión de la mano de fichas
 * Gestiona los slots de la mano y detecta matches
 */

import GameSettings from '../config/GameSettings'
import type { HandSlot, TileState, MatchResult } from '../types'

export class HandManager {
  private slots: HandSlot[]
  private maxSlots: number

  constructor() {
    this.maxSlots = GameSettings.hand.maxSlots
    this.slots = this.initializeSlots()
  }

  /**
   * Inicializa los slots vacíos
   */
  private initializeSlots(): HandSlot[] {
    const slots: HandSlot[] = []
    for (let i = 0; i < this.maxSlots; i++) {
      slots.push({
        index: i,
        tile: null,
        isOccupied: false,
      })
    }
    return slots
  }

  /**
   * Añade una ficha a la mano
   * Retorna el índice del slot donde se añadió, o -1 si la mano está llena
   */
  public addTile(tile: TileState): number {
    // Buscar el primer slot vacío
    const emptySlot = this.slots.find(slot => !slot.isOccupied)
    
    if (!emptySlot) {
      return -1  // Mano llena
    }

    // Marcar la ficha como en mano
    tile.isInHand = true
    tile.isAccessible = false

    // Ocupar el slot
    emptySlot.tile = tile
    emptySlot.isOccupied = true

    // Reordenar: agrupar fichas del mismo tipo
    this.reorganizeSlots()

    return emptySlot.index
  }

  /**
   * Reorganiza los slots para agrupar fichas del mismo tipo
   */
  private reorganizeSlots(): void {
    // Extraer todas las fichas
    const tiles = this.slots
      .filter(slot => slot.isOccupied && slot.tile)
      .map(slot => slot.tile!)

    // Ordenar por tipo
    tiles.sort((a, b) => a.type - b.type)

    // Limpiar slots
    this.slots.forEach(slot => {
      slot.tile = null
      slot.isOccupied = false
    })

    // Reasignar fichas ordenadas
    for (let i = 0; i < tiles.length; i++) {
      this.slots[i].tile = tiles[i]
      this.slots[i].isOccupied = true
    }
  }

  /**
   * Comprueba si hay un match (3 fichas iguales) y lo retorna
   */
  public checkMatch(): MatchResult {
    const tilesInHand = this.getTilesInHand()
    
    // Contar fichas por tipo
    const typeCounts = new Map<number, TileState[]>()
    
    for (const tile of tilesInHand) {
      const existing = typeCounts.get(tile.type) || []
      existing.push(tile)
      typeCounts.set(tile.type, existing)
    }

    // Buscar un tipo con 3 o más fichas
    for (const [type, tiles] of typeCounts) {
      if (tiles.length >= GameSettings.rules.matchCount) {
        const matchedTiles = tiles.slice(0, GameSettings.rules.matchCount)
        
        return {
          matched: true,
          tiles: matchedTiles,
          scoreGained: GameSettings.rules.scorePerMatch,
        }
      }
    }

    return {
      matched: false,
      tiles: [],
      scoreGained: 0,
    }
  }

  /**
   * Elimina las fichas del match de la mano
   */
  public removeMatchedTiles(tiles: TileState[]): void {
    const tileIds = new Set(tiles.map(t => t.id))

    for (const slot of this.slots) {
      if (slot.tile && tileIds.has(slot.tile.id)) {
        slot.tile.isMatched = true
        slot.tile = null
        slot.isOccupied = false
      }
    }

    // Compactar slots (mover fichas hacia la izquierda)
    this.compactSlots()
  }

  /**
   * Compacta los slots moviendo fichas hacia la izquierda
   */
  private compactSlots(): void {
    const tiles = this.slots
      .filter(slot => slot.isOccupied && slot.tile)
      .map(slot => slot.tile!)

    // Limpiar todos los slots
    this.slots.forEach(slot => {
      slot.tile = null
      slot.isOccupied = false
    })

    // Reasignar desde el principio
    for (let i = 0; i < tiles.length; i++) {
      this.slots[i].tile = tiles[i]
      this.slots[i].isOccupied = true
    }
  }

  /**
   * Obtiene todas las fichas en la mano
   */
  public getTilesInHand(): TileState[] {
    return this.slots
      .filter(slot => slot.isOccupied && slot.tile)
      .map(slot => slot.tile!)
  }

  /**
   * Obtiene los slots
   */
  public getSlots(): HandSlot[] {
    return this.slots
  }

  /**
   * Comprueba si la mano está llena
   */
  public isFull(): boolean {
    return this.slots.every(slot => slot.isOccupied)
  }

  /**
   * Comprueba si la mano está vacía
   */
  public isEmpty(): boolean {
    return this.slots.every(slot => !slot.isOccupied)
  }

  /**
   * Obtiene la cantidad de fichas en la mano
   */
  public getTileCount(): number {
    return this.slots.filter(slot => slot.isOccupied).length
  }

  /**
   * Calcula la posición en pantalla de un slot
   */
  public getSlotPosition(slotIndex: number): { x: number; y: number } {
    const { slotWidth, slotPadding, bottomMargin } = GameSettings.hand
    const canvasWidth = GameSettings.canvas.width
    const canvasHeight = GameSettings.canvas.height

    const totalWidth = this.maxSlots * slotWidth + (this.maxSlots - 1) * slotPadding
    const startX = (canvasWidth - totalWidth) / 2 + slotWidth / 2

    return {
      x: startX + slotIndex * (slotWidth + slotPadding),
      y: canvasHeight - bottomMargin,
    }
  }

  /**
   * Reinicia la mano
   */
  public reset(): void {
    this.slots = this.initializeSlots()
  }
}
