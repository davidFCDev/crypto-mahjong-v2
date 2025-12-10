/**
 * BoardGenerator - Genera tableros de Mahjong con múltiples capas
 * Asegura que el tablero sea solucionable generando fichas en grupos de 3
 */

import GameSettings from '../config/GameSettings'
import { TileType, type LevelConfig, type TileState, type TilePosition } from '../types'

export class BoardGenerator {
  /**
   * Genera un tablero para el nivel especificado
   */
  public static generateBoard(levelConfig: LevelConfig): TileState[] {
    const tiles: TileState[] = []
    const positions = this.generatePositions(levelConfig)
    const tileTypes = this.generateTileTypes(positions.length, levelConfig.tileTypes)

    // Mezclar posiciones para distribución aleatoria
    this.shuffleArray(positions)

    // Asignar tipos a posiciones
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i]
      const type = tileTypes[i]

      tiles.push({
        id: `tile-${i}`,
        type,
        position,
        isAccessible: false,  // Se calculará después
        isSelected: false,
        isInHand: false,
        isMatched: false,
      })
    }

    // Calcular accesibilidad inicial
    this.updateAccessibility(tiles)

    return tiles
  }

  /**
   * Genera posiciones para las fichas en múltiples capas
   * Usa un patrón de pirámide para que las capas superiores sean más pequeñas
   */
  private static generatePositions(config: LevelConfig): TilePosition[] {
    const positions: TilePosition[] = []

    for (let z = 0; z < config.layers; z++) {
      // Cada capa es ligeramente más pequeña
      const layerReduction = z * 0.5
      const layerRows = Math.max(2, Math.floor(config.rows - layerReduction))
      const layerCols = Math.max(2, Math.floor(config.cols - layerReduction))

      // Offset para centrar capas superiores
      const offsetX = Math.floor((config.cols - layerCols) / 2)
      const offsetY = Math.floor((config.rows - layerRows) / 2)

      // Generar posiciones en patrón de tablero para esta capa
      for (let y = 0; y < layerRows; y++) {
        for (let x = 0; x < layerCols; x++) {
          // Patrón de tablero: alternar posiciones en capas superiores
          if (z > 0 && (x + y) % 2 === 0) continue

          positions.push({
            x: x + offsetX,
            y: y + offsetY,
            z,
          })
        }
      }
    }

    // Asegurar que el número de posiciones sea múltiplo de 3
    while (positions.length % 3 !== 0) {
      positions.pop()
    }

    return positions
  }

  /**
   * Genera tipos de fichas asegurando grupos de 3
   */
  private static generateTileTypes(count: number, maxTypes: number): TileType[] {
    const types: TileType[] = []
    const groupCount = Math.floor(count / 3)

    for (let i = 0; i < groupCount; i++) {
      const type = i % maxTypes as TileType
      // Añadir 3 fichas del mismo tipo
      types.push(type, type, type)
    }

    // Mezclar los tipos
    this.shuffleArray(types)

    return types
  }

  /**
   * Actualiza la accesibilidad de todas las fichas
   * Una ficha es accesible si no hay ninguna ficha directamente encima
   */
  public static updateAccessibility(tiles: TileState[]): void {
    for (const tile of tiles) {
      if (tile.isInHand || tile.isMatched) {
        tile.isAccessible = false
        continue
      }

      tile.isAccessible = !this.isTileBlocked(tile, tiles)
    }
  }

  /**
   * Comprueba si una ficha está bloqueada por otra encima
   */
  private static isTileBlocked(tile: TileState, allTiles: TileState[]): boolean {
    const { x, y, z } = tile.position

    // Buscar fichas en capas superiores que se superpongan
    for (const other of allTiles) {
      if (other.id === tile.id) continue
      if (other.isInHand || other.isMatched) continue
      if (other.position.z <= z) continue

      // Comprobar superposición (las fichas en capas superiores pueden tapar)
      // Una ficha bloquea si su posición está cerca (considerando que las fichas tienen tamaño)
      const dx = Math.abs(other.position.x - x)
      const dy = Math.abs(other.position.y - y)

      // Si la ficha de arriba está cerca, bloquea
      if (dx < 1 && dy < 1) {
        return true
      }
    }

    return false
  }

  /**
   * Mezcla un array de forma aleatoria (Fisher-Yates)
   */
  private static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  /**
   * Calcula la posición en pantalla de una ficha
   */
  public static calculateScreenPosition(
    position: TilePosition,
    levelConfig: LevelConfig,
    boardBounds: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number } {
    const tileW = GameSettings.tile.width + GameSettings.tile.padding
    const tileH = GameSettings.tile.height + GameSettings.tile.padding
    const layerOffset = GameSettings.tile.depth

    // Calcular tamaño total del tablero base
    const boardWidth = levelConfig.cols * tileW
    const boardHeight = levelConfig.rows * tileH

    // Calcular offset para centrar
    const startX = boardBounds.x + (boardBounds.width - boardWidth) / 2 + tileW / 2
    const startY = boardBounds.y + (boardBounds.height - boardHeight) / 2 + tileH / 2

    // Posición base + offset por capa (efecto 3D)
    const x = startX + position.x * tileW - position.z * layerOffset * 0.5
    const y = startY + position.y * tileH - position.z * layerOffset

    return { x, y }
  }
}
