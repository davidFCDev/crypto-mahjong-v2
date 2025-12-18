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
   * Capas superiores usan posiciones aleatorias DENTRO de la zona de la capa base
   */
  private static generatePositions(config: LevelConfig): TilePosition[] {
    const positions: TilePosition[] = [];

    // Capa base (z=0): grid completo - esta define el área máxima
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        positions.push({
          x: col,
          y: row,
          z: 0,
        });
      }
    }

    // Capas superiores: posiciones DENTRO del área de la capa base
    for (let z = 1; z < config.layers; z++) {
      // Cada capa se reduce proporcionalmente para quedar dentro de la base
      // Reducción progresiva: cada capa es ~0.5-0.7 unidades más pequeña por lado
      const shrinkFactor = z * 0.5;
      const layerRows = Math.max(2, config.rows - Math.ceil(shrinkFactor));
      const layerCols = Math.max(2, config.cols - Math.ceil(shrinkFactor));

      // Offset para centrar la capa dentro de la base
      const startOffsetX = shrinkFactor / 2;
      const startOffsetY = shrinkFactor / 2;

      // Generar posiciones con offsets aleatorios
      const possiblePositions: TilePosition[] = [];

      for (let row = 0; row < layerRows; row++) {
        for (let col = 0; col < layerCols; col++) {
          // Offset aleatorio entre 0.2 y 0.8 para que cada ficha solape varias de abajo
          const randomOffsetX = 0.2 + Math.random() * 0.6;
          const randomOffsetY = 0.2 + Math.random() * 0.6;

          possiblePositions.push({
            x: startOffsetX + col + randomOffsetX,
            y: startOffsetY + row + randomOffsetY,
            z: z,
          });
        }
      }

      // Mezclar posiciones aleatoriamente
      this.shuffleArray(possiblePositions);

      // Seleccionar fichas por capa (75% - 5% por nivel de capa)
      const maxTiles = Math.max(
        4,
        Math.floor(possiblePositions.length * (0.75 - z * 0.05))
      );
      const selectedPositions: TilePosition[] = [];

      for (const pos of possiblePositions) {
        if (selectedPositions.length >= maxTiles) break;

        // Verificar que no esté demasiado cerca de otra ficha seleccionada en la misma capa
        const tooClose = selectedPositions.some((existing) => {
          const dx = Math.abs(existing.x - pos.x);
          const dy = Math.abs(existing.y - pos.y);
          return dx < 0.85 && dy < 0.85; // Distancia mínima
        });

        if (!tooClose) {
          selectedPositions.push(pos);
        }
      }

      positions.push(...selectedPositions);
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
