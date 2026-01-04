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
   * Las fichas solo se apilan en columnas verticales exactas (sin offset)
   * Distribución muy equilibrada: todas las columnas crecen uniformemente
   */
  private static generatePositions(config: LevelConfig): TilePosition[] {
    const allPositions: TilePosition[] = [];
    const totalColumns = config.rows * config.cols;

    // Calcular altura objetivo para cada columna (distribución uniforme)
    // Todas las columnas tendrán la misma altura o diferirán en máximo 1
    const targetHeight = config.layers;

    // Crear todas las posiciones columna por columna
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        // Cada columna tiene fichas desde z=0 hasta z=targetHeight-1
        for (let z = 0; z < targetHeight; z++) {
          allPositions.push({
            x: col,
            y: row,
            z: z,
          });
        }
      }
    }

    // Asegurar que el número de posiciones sea múltiplo de 3
    // Quitar fichas de las capas superiores si es necesario
    while (allPositions.length % 3 !== 0) {
      // Buscar y quitar una ficha de la capa más alta
      const maxZ = Math.max(...allPositions.map((p) => p.z));
      const indexToRemove = allPositions.findIndex((p) => p.z === maxZ);
      if (indexToRemove !== -1) {
        allPositions.splice(indexToRemove, 1);
      } else {
        break;
      }
    }

    return allPositions;
  }

  /**
   * Cuenta cuántas fichas de la capa inferior soportan una posición
   * y calcula el solapamiento total.
   * Retorna el porcentaje de área soportada (0-1)
   */
  private static calculateSupportCoverage(
    x: number,
    y: number,
    z: number,
    allPositions: TilePosition[]
  ): number {
    let totalCoverage = 0;

    for (const pos of allPositions) {
      // Solo considerar fichas en la capa inmediatamente inferior
      if (pos.z !== z - 1) continue;

      const dx = Math.abs(pos.x - x);
      const dy = Math.abs(pos.y - y);

      // Una ficha soporta si está solapada (distancia < 1 en ambos ejes)
      if (dx < 1 && dy < 1) {
        // Calcular el área de solapamiento
        // Si dx=0, dy=0: solapamiento completo = 1.0
        // Si dx=0.5, dy=0.5: solapamiento = 0.25 (25% del área)
        const overlapX = 1 - dx;
        const overlapY = 1 - dy;
        const coverage = overlapX * overlapY;
        totalCoverage += coverage;
      }
    }

    // Limitar a 1.0 máximo (100% de cobertura)
    return Math.min(totalCoverage, 1.0);
  }

  /**
   * Genera tipos de fichas asegurando grupos de 3 con distribución equilibrada
   * Todos los tipos tienen la misma cantidad de fichas (o difieren en máximo 1 grupo)
   */
  private static generateTileTypes(
    count: number,
    maxTypes: number
  ): TileType[] {
    const types: TileType[] = [];
    const groupCount = Math.floor(count / 3);

    // Crear array de tipos disponibles y mezclarlo para distribución aleatoria
    const availableTypes: TileType[] = [];
    for (let t = 0; t < maxTypes; t++) {
      availableTypes.push(t as TileType);
    }
    this.shuffleArray(availableTypes);

    // Distribuir grupos de forma equilibrada entre todos los tipos
    for (let i = 0; i < groupCount; i++) {
      // Seleccionar tipo de forma cíclica pero sobre el array mezclado
      const typeIndex = i % maxTypes;
      const type = availableTypes[typeIndex];
      // Añadir 3 fichas del mismo tipo
      types.push(type, type, type);
    }

    // Mezclar los tipos para que no estén agrupados
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

    // Offset por capa para efecto 3D (hacia arriba)
    const layerOffsetX = GameSettings.board.layerOffsetX ?? 0;
    const layerOffsetY = GameSettings.board.layerOffsetY ?? 6;

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
