/**
 * BoardGenerator - Genera tableros de Mahjong con múltiples capas
 * Asegura que el tablero sea solucionable generando fichas en grupos de 3
 */

import GameSettings from "../config/GameSettings";
import {
  TileType,
  type LevelConfig,
  type TilePosition,
  type TileState,
} from "../types";

export class BoardGenerator {
  /**
   * Genera un tablero para el nivel especificado
   */
  public static generateBoard(levelConfig: LevelConfig): TileState[] {
    const tiles: TileState[] = [];
    const positions = this.generatePositions(levelConfig);
    const tileTypes = this.generateTileTypes(
      positions.length,
      levelConfig.tileTypes
    );

    // Mezclar tipos para distribución aleatoria (no posiciones)
    this.shuffleArray(tileTypes);

    // Asignar tipos a posiciones
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const type = tileTypes[i];

      tiles.push({
        id: `tile-${i}`,
        type,
        position,
        isAccessible: true, // Por defecto accesible
        isSelected: false,
        isInHand: false,
        isMatched: false,
      });
    }

    // Calcular accesibilidad inicial
    this.updateAccessibility(tiles);

    return tiles;
  }

  /**
   * Genera posiciones para las fichas en múltiples capas
   * Sistema estilo Mahjong: capas superiores desplazadas y más pequeñas
   * Patrón NO simétrico para efecto visual más interesante
   */
  private static generatePositions(config: LevelConfig): TilePosition[] {
    const positions: TilePosition[] = [];

    for (let z = 0; z < config.layers; z++) {
      // Cada capa es más pequeña: pierde filas/columnas de forma asimétrica
      const shrinkRows = z * 2;
      const shrinkCols = z * 2;

      const layerRows = Math.max(2, config.rows - shrinkRows);
      const layerCols = Math.max(2, config.cols - shrinkCols);

      // Offset para centrar (pero con pequeña variación para efecto visual)
      const offsetX = z;
      const offsetY = z;

      for (let row = 0; row < layerRows; row++) {
        for (let col = 0; col < layerCols; col++) {
          // Añadir variación: en capas superiores, no todas las posiciones tienen ficha
          // Esto crea un patrón más orgánico como en la imagen
          if (z > 0) {
            // En capas superiores, crear patrón de tablero de ajedrez disperso
            // Solo colocar fichas en algunas posiciones
            const isEdge =
              row === 0 ||
              row === layerRows - 1 ||
              col === 0 ||
              col === layerCols - 1;
            const isChecker = (row + col + z) % 2 === 0;

            // Colocar en bordes y en patrón de ajedrez interior
            if (!isEdge && !isChecker && z > 1) {
              continue; // Saltar esta posición en capas muy altas
            }
          }

          positions.push({
            x: offsetX + col,
            y: offsetY + row,
            z: z,
          });
        }
      }
    }

    // Asegurar que el número de posiciones sea múltiplo de 3
    while (positions.length % 3 !== 0) {
      positions.pop();
    }

    return positions;
  }

  /**
   * Genera tipos de fichas asegurando grupos de 3
   */
  private static generateTileTypes(
    count: number,
    maxTypes: number
  ): TileType[] {
    const types: TileType[] = [];
    const groupCount = Math.floor(count / 3);

    for (let i = 0; i < groupCount; i++) {
      const type = (i % maxTypes) as TileType;
      // Añadir 3 fichas del mismo tipo
      types.push(type, type, type);
    }

    // Mezclar los tipos
    this.shuffleArray(types);

    return types;
  }

  /**
   * Actualiza la accesibilidad de todas las fichas
   * Una ficha es accesible si no hay ninguna ficha directamente encima
   */
  public static updateAccessibility(tiles: TileState[]): void {
    for (const tile of tiles) {
      if (tile.isInHand || tile.isMatched) {
        tile.isAccessible = false;
        continue;
      }

      tile.isAccessible = !this.isTileBlocked(tile, tiles);
    }
  }

  /**
   * Comprueba si una ficha está bloqueada por otra encima
   * LÓGICA SIMPLE: Una ficha está bloqueada si hay CUALQUIER ficha
   * en una capa superior que esté cerca (a menos de 1 unidad de distancia)
   */
  private static isTileBlocked(
    tile: TileState,
    allTiles: TileState[]
  ): boolean {
    const { x, y, z } = tile.position;

    // Buscar fichas en capas superiores
    for (const other of allTiles) {
      if (other.id === tile.id) continue;
      if (other.isInHand || other.isMatched) continue;

      // Solo considerar fichas en capas SUPERIORES
      if (other.position.z <= z) continue;

      // Calcular distancia en X e Y entre las posiciones
      const dx = Math.abs(other.position.x - x);
      const dy = Math.abs(other.position.y - y);

      // Una ficha bloquea si está a menos de 1 unidad de distancia
      // (es decir, se superpone visualmente)
      if (dx < 1 && dy < 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Mezcla un array de forma aleatoria (Fisher-Yates)
   */
  private static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
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
    const tileW = GameSettings.tile.width + GameSettings.tile.padding;
    const tileH = GameSettings.tile.height + GameSettings.tile.padding;

    // Offset por capa para efecto 3D (hacia arriba-izquierda)
    const layerOffsetX = (GameSettings.board as any).layerOffsetX || 6;
    const layerOffsetY = (GameSettings.board as any).layerOffsetY || 6;

    // Calcular tamaño total del tablero base
    const boardWidth = levelConfig.cols * tileW;
    const boardHeight = levelConfig.rows * tileH;

    // Calcular offset para centrar
    const startX =
      boardBounds.x + (boardBounds.width - boardWidth) / 2 + tileW / 2;
    const startY =
      boardBounds.y + (boardBounds.height - boardHeight) / 2 + tileH / 2;

    // Posición base + offset por capa (efecto 3D hacia arriba-izquierda)
    const x = startX + position.x * tileW - position.z * layerOffsetX;
    const y = startY + position.y * tileH - position.z * layerOffsetY;

    return { x, y };
  }
}
