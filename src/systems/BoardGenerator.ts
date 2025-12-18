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
   * Capas superiores usan posiciones aleatorias dispersas
   */
  private static generatePositions(config: LevelConfig): TilePosition[] {
    const positions: TilePosition[] = [];

    // Capa base (z=0): grid completo
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        positions.push({
          x: col,
          y: row,
          z: 0,
        });
      }
    }

    // Capas superiores: posiciones con offset aleatorio para solapar fichas
    for (let z = 1; z < config.layers; z++) {
      // Área disponible para esta capa (se reduce menos para más fichas)
      const layerRows = Math.max(3, config.rows - Math.floor(z * 0.7));
      const layerCols = Math.max(3, config.cols - Math.floor(z * 0.5));
      
      // Generar posiciones con offsets aleatorios
      const possiblePositions: TilePosition[] = [];
      
      for (let row = 0; row < layerRows; row++) {
        for (let col = 0; col < layerCols; col++) {
          // Offset aleatorio entre 0.3 y 0.7 para que cada ficha solape varias de abajo
          const randomOffsetX = 0.3 + Math.random() * 0.4;
          const randomOffsetY = 0.3 + Math.random() * 0.4;
          
          possiblePositions.push({
            x: (z * 0.3) + col + randomOffsetX,
            y: (z * 0.3) + row + randomOffsetY,
            z: z,
          });
        }
      }
      
      // Mezclar posiciones aleatoriamente
      this.shuffleArray(possiblePositions);
      
      // Seleccionar más fichas por capa (80% - 5% por nivel de capa)
      const maxTiles = Math.max(6, Math.floor(possiblePositions.length * (0.8 - z * 0.05)));
      const selectedPositions: TilePosition[] = [];
      
      for (const pos of possiblePositions) {
        if (selectedPositions.length >= maxTiles) break;
        
        // Verificar que no esté demasiado cerca de otra ficha seleccionada en la misma capa
        const tooClose = selectedPositions.some(existing => {
          const dx = Math.abs(existing.x - pos.x);
          const dy = Math.abs(existing.y - pos.y);
          return dx < 0.9 && dy < 0.9; // Distancia mínima reducida
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
