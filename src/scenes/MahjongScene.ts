/**
 * MahjongScene - Escena principal del juego Crypto Mahjong
 * Integra todos los sistemas: tablero, fichas 3D, mano y UI
 */

import type { FarcadeSDK } from "@farcade/game-sdk";
import GameSettings from "../config/GameSettings";
import { Tile3D } from "../objects/Tile3D";
import { BoardGenerator } from "../systems/BoardGenerator";
import { GameUI } from "../systems/GameUI";
import { HandManager } from "../systems/HandManager";
import { SoundManager } from "../systems/SoundManager";
import {
  TILE_COLORS,
  TileType,
  type GameState,
  type LevelConfig,
  type TileState,
} from "../types";

declare global {
  interface Window {
    FarcadeSDK: FarcadeSDK;
  }
}

export class MahjongScene extends Phaser.Scene {
  // Sistemas
  private handManager!: HandManager;
  private gameUI!: GameUI;

  // Estado del juego
  private gameState: GameState = {
    currentLevel: 1,
    score: 0,
    tiles: [],
    hand: [],
    isPlaying: false,
    isGameOver: false,
    isWin: false,
  };

  // Componentes visuales
  private tileSprites: Map<string, Tile3D> = new Map();
  private boardContainer!: Phaser.GameObjects.Container;
  private currentLevelConfig!: LevelConfig;

  // Bounds del tablero - Centrado verticalmente entre score y mano
  // Score badge: Y=55, altura=95 → termina en Y=150
  // Mano: empieza en Y = 1280 - 130 - 77 = 1073
  // Área disponible: desde 150 hasta 1073
  private boardBounds = {
    x: 5,
    y: 160, // Después del score badge (55 + 95 + margen)
    width: GameSettings.canvas.width - 10,
    height:
      GameSettings.canvas.height -
      160 - // Espacio superior (score)
      GameSettings.hand.bottomMargin -
      GameSettings.hand.slotHeight / 2 -
      30, // Margen inferior
  };

  // Estado de animación
  private isAnimating: boolean = false;

  constructor() {
    super({ key: "MahjongScene" });
  }

  preload(): void {
    // Cargar imagen de fondo
    this.load.image(
      "background",
      "https://remix.gg/blob/zS0QCi0PfUjO/mahjong-xLbaEqVFKWEylPL92Zn4ScyqpnczG8.webp?w5dj"
    );

    // Cargar imágenes de los tiles que tienen imageUrl
    Object.values(TileType).forEach((type) => {
      if (typeof type === "number") {
        const tileConfig = TILE_COLORS[type as TileType];
        if (tileConfig.imageUrl) {
          this.load.image(`tile-icon-${type}`, tileConfig.imageUrl);
        }
      }
    });
  }

  create(): void {
    // Crear fondo
    this.createBackground();

    // Procesar imágenes de tiles para tener esquinas redondeadas
    this.createRoundedTileImages();

    // Inicializar sistemas
    this.handManager = new HandManager();
    this.gameUI = new GameUI(this);

    // Configurar callbacks de power-ups
    this.gameUI.setPowerUpCallbacks({
      onUndo: () => this.handleUndo(),
      onPauseTime: () => this.handlePauseTime(),
      onHint: () => this.handleHint(),
    });

    // Crear contenedor del tablero
    this.boardContainer = this.add.container(0, 0);

    // Iniciar nivel 1
    this.startLevel(1);
  }

  /**
   * Crea versiones con esquinas redondeadas de las imágenes de tiles
   */
  private createRoundedTileImages(): void {
    const padding = 8;
    const innerWidth = GameSettings.tile.width - padding * 2;
    const innerHeight = GameSettings.tile.height - padding * 2;
    const cornerRadius = GameSettings.tile.cornerRadius - 2;

    Object.values(TileType).forEach((type) => {
      if (typeof type === "number") {
        const tileConfig = TILE_COLORS[type as TileType];
        if (tileConfig.imageUrl) {
          const originalKey = `tile-icon-${type}`;
          const roundedKey = `tile-icon-rounded-${type}`;

          // Verificar si ya existe la textura redondeada
          if (this.textures.exists(roundedKey)) return;

          // Obtener la textura original
          const originalTexture = this.textures.get(originalKey);
          if (!originalTexture || originalTexture.key === "__MISSING") return;

          // Crear canvas para dibujar la imagen redondeada
          const canvas = document.createElement("canvas");
          canvas.width = innerWidth;
          canvas.height = innerHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Dibujar rectángulo redondeado como máscara
          ctx.beginPath();
          ctx.roundRect(0, 0, innerWidth, innerHeight, cornerRadius);
          ctx.closePath();
          ctx.clip();

          // Obtener la imagen original
          const sourceImage =
            originalTexture.getSourceImage() as HTMLImageElement;
          ctx.drawImage(sourceImage, 0, 0, innerWidth, innerHeight);

          // Crear textura desde el canvas
          this.textures.addCanvas(roundedKey, canvas);
        }
      }
    });
  }

  /**
   * Crea el fondo del juego - Imagen de fondo con overlay suave
   */
  private createBackground(): void {
    const { canvas } = GameSettings;

    // Añadir imagen de fondo centrada y escalada para cubrir
    const bg = this.add.image(
      canvas.width / 2,
      canvas.height / 2,
      "background"
    );

    // Escalar para cubrir todo el canvas manteniendo proporción
    const scaleX = canvas.width / bg.width;
    const scaleY = canvas.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    bg.setDepth(-2);

    // Overlay para oscurecer el fondo
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.3); // Oscurecer más el fondo
    overlay.fillRect(0, 0, canvas.width, canvas.height);
    overlay.setDepth(-1);
  }

  /**
   * Inicia un nuevo nivel
   */
  private startLevel(level: number): void {
    // Limpiar nivel anterior
    this.clearLevel();

    // Obtener configuración del nivel
    this.currentLevelConfig = GameSettings.getLevelConfig(level);

    // Actualizar estado
    this.gameState.currentLevel = level;
    this.gameState.isPlaying = true;
    this.gameState.isGameOver = false;
    this.gameState.isWin = false;

    // Generar nuevo tablero
    this.gameState.tiles = BoardGenerator.generateBoard(
      this.currentLevelConfig
    );

    // Iniciar música si es el primer nivel
    if (level === 1) {
      SoundManager.startMusic();
    }

    // Crear fichas visuales
    this.createTileSprites();

    // Actualizar UI
    this.gameUI.updateLevel(level);
    this.gameUI.updateHand(this.handManager.getSlots());

    // Animación de entrada
    this.animateBoardEntry();
  }

  /**
   * Limpia el nivel actual
   */
  private clearLevel(): void {
    // Destruir todos los sprites de fichas
    this.tileSprites.forEach((sprite) => sprite.destroy());
    this.tileSprites.clear();

    // Reiniciar mano
    this.handManager.reset();

    // Limpiar estado
    this.gameState.tiles = [];
  }

  /**
   * Crea los sprites de las fichas
   */
  private createTileSprites(): void {
    for (const tileState of this.gameState.tiles) {
      const screenPos = BoardGenerator.calculateScreenPosition(
        tileState.position,
        this.currentLevelConfig,
        this.boardBounds
      );

      // Determinar si debe mostrar el volumen 3D inferior
      const showBottom3D = !this.hasAdjacentTileBelow(tileState);

      const tile3D = new Tile3D(
        this,
        screenPos.x,
        screenPos.y,
        tileState,
        showBottom3D
      );
      tile3D.setLayerDepth(tileState.position.z);

      // Escuchar click
      tile3D.on("tile-clicked", (state: TileState) =>
        this.onTileClicked(state)
      );

      this.tileSprites.set(tileState.id, tile3D);
      this.boardContainer.add(tile3D);
    }
  }

  /**
   * Verifica si hay una ficha adyacente abajo en la misma capa
   * que taparía el efecto 3D de esta ficha
   */
  private hasAdjacentTileBelow(tile: TileState): boolean {
    const pos = tile.position;

    // Buscar ficha en la misma capa (Z), misma columna (X), y fila +1 (Y)
    return this.gameState.tiles.some((other) => {
      if (other.id === tile.id) return false;
      if (other.isInHand || other.isMatched) return false;

      // Misma capa
      if (other.position.z !== pos.z) return false;

      // La ficha de abajo debe estar en Y + 1 (aproximadamente)
      // Con el sistema de offset 0.5, verificamos si está en el rango [Y+0.5, Y+1.5]
      const yDiff = other.position.y - pos.y;
      if (yDiff < 0.4 || yDiff > 1.1) return false;

      // Debe estar en la misma columna (con tolerancia para offset)
      const xDiff = Math.abs(other.position.x - pos.x);
      if (xDiff > 0.6) return false;

      return true;
    });
  }

  /**
   * Actualiza el efecto 3D de las fichas cuando cambia el tablero
   */
  private updateTiles3DEffect(): void {
    for (const tile of this.gameState.tiles) {
      if (tile.isInHand || tile.isMatched) continue;

      const sprite = this.tileSprites.get(tile.id);
      if (sprite) {
        const showBottom3D = !this.hasAdjacentTileBelow(tile);
        sprite.updateBottom3D(showBottom3D);
      }
    }
  }

  /**
   * Animación de entrada del tablero
   */
  private animateBoardEntry(): void {
    this.isAnimating = true;
    const tiles = Array.from(this.tileSprites.values());

    // Ordenar por capa y posición
    tiles.sort((a, b) => {
      const stateA = a.getState();
      const stateB = b.getState();
      return (
        stateA.position.z - stateB.position.z ||
        stateA.position.y - stateB.position.y ||
        stateA.position.x - stateB.position.x
      );
    });

    // Animar entrada con delay escalonado
    tiles.forEach((tile, index) => {
      tile.setAlpha(0);
      tile.setScale(0);

      this.tweens.add({
        targets: tile,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        delay: index * 30,
        ease: "Back.easeOut",
        onComplete: () => {
          if (index === tiles.length - 1) {
            this.isAnimating = false;
          }
        },
      });
    });
  }

  /**
   * Maneja el click en una ficha
   */
  private onTileClicked(tileState: TileState): void {
    if (this.isAnimating || !this.gameState.isPlaying) return;

    // Verificar si la mano está llena - simplemente ignorar el click
    if (this.handManager.isFull()) {
      return;
    }

    this.isAnimating = true;

    // IMPORTANTE: Buscar la ficha en gameState.tiles para modificar el original
    const originalTile = this.gameState.tiles.find(
      (t) => t.id === tileState.id
    );
    if (!originalTile) {
      this.isAnimating = false;
      return;
    }

    // Obtener posición del slot destino
    const slotIndex = this.handManager.getTileCount();
    const slotPos = this.gameUI.getSlotPosition(slotIndex);

    // Obtener el sprite de la ficha
    const tileSprite = this.tileSprites.get(tileState.id);
    if (!tileSprite) {
      this.isAnimating = false;
      return;
    }

    // Marcar como en mano ANTES de animar (para que updateAccessibility funcione)
    originalTile.isInHand = true;
    originalTile.isAccessible = false;

    // Actualizar accesibilidad inmediatamente para que otras fichas se desbloqueen
    this.updateBoardAccessibility();

    // Actualizar efecto 3D (fichas que ahora pueden mostrar su volumen)
    this.updateTiles3DEffect();

    // Animar la ficha hacia la mano
    tileSprite.animateToHand(slotPos.x, slotPos.y, () => {
      // Eliminar sprite del tablero
      tileSprite.destroy();
      this.tileSprites.delete(originalTile.id);

      // Añadir a la mano (el estado ya está actualizado)
      this.handManager.addTile(originalTile);

      // Actualizar UI de la mano
      this.gameUI.updateHand(this.handManager.getSlots());

      // Verificar match
      this.checkForMatch();
    });

    // Permitir clicks de otras fichas casi inmediatamente
    this.time.delayedCall(50, () => {
      if (!this.handManager.isFull()) {
        this.isAnimating = false;
      }
    });
  }

  /**
   * Verifica si hay un match en la mano
   */
  private checkForMatch(): void {
    const matchResult = this.handManager.checkMatch();

    if (matchResult.matched) {
      // Delay breve para que se vea la tercera ficha antes del match
      this.time.delayedCall(100, () => {
        // Animar match
        const matchedIds = matchResult.tiles.map((t) => t.id);
        this.gameUI.animateMatch(matchedIds, () => {
          // Eliminar fichas de la mano
          this.handManager.removeMatchedTiles(matchResult.tiles);

          // Actualizar puntuación
          this.gameState.score += matchResult.scoreGained;
          this.gameUI.updateScore(this.gameState.score);

          // Actualizar UI de la mano
          this.gameUI.updateHand(this.handManager.getSlots());

          // Verificar victoria
          this.checkWinCondition();

          this.isAnimating = false;
        });

        // Reproducir sonido de trio con delay para que coincida con la explosión
        this.time.delayedCall(500, () => {
          SoundManager.playTrio();
        });
      });
    } else {
      // Verificar game over (mano llena sin match)
      if (this.handManager.isFull()) {
        this.gameOver();
      } else {
        this.isAnimating = false;
      }
    }
  }

  /**
   * Actualiza la accesibilidad de las fichas del tablero
   */
  private updateBoardAccessibility(): void {
    // IMPORTANTE: Pasar TODAS las fichas para que el cálculo de bloqueo sea correcto
    // Las fichas isInHand/isMatched serán ignoradas en el cálculo
    BoardGenerator.updateAccessibility(this.gameState.tiles);

    // Actualizar sprites de las fichas que aún están en el tablero
    for (const tile of this.gameState.tiles) {
      if (tile.isInHand || tile.isMatched) continue;

      const sprite = this.tileSprites.get(tile.id);
      if (sprite) {
        sprite.updateState({ isAccessible: tile.isAccessible });
      }
    }
  }

  /**
   * Verifica condición de victoria
   */
  private checkWinCondition(): void {
    // Victoria si no quedan fichas en el tablero y la mano está vacía
    const remainingTiles = this.gameState.tiles.filter(
      (t) => !t.isInHand && !t.isMatched
    );

    if (remainingTiles.length === 0 && this.handManager.isEmpty()) {
      this.gameState.isWin = true;
      this.gameState.isPlaying = false;

      // Bonus por nivel
      const levelBonus =
        this.gameState.currentLevel * GameSettings.rules.bonusPerLevel;
      this.gameState.score += levelBonus;
      this.gameUI.updateScore(this.gameState.score);

      // Mostrar mensaje de victoria
      this.time.delayedCall(500, () => {
        this.gameUI.showWinMessage(() => {
          this.startLevel(this.gameState.currentLevel + 1);
        });
      });
    }
  }

  /**
   * Game Over
   */
  private gameOver(): void {
    this.gameState.isGameOver = true;
    this.gameState.isPlaying = false;
    this.isAnimating = false;

    // Parar música
    SoundManager.stopMusic();

    // Enviar puntuación a Farcade (usando any para evitar errores de tipo)
    try {
      const sdk = window.FarcadeSDK as any;
      if (sdk?.gameOver) {
        sdk.gameOver({ score: this.gameState.score });
      } else if (sdk?.actions?.gameOver) {
        sdk.actions.gameOver({ score: this.gameState.score });
      }
    } catch (e) {
      console.log("Farcade SDK not available");
    }

    this.gameUI.showGameOverMessage(() => {
      this.restartGame();
    });
  }

  /**
   * Reinicia el juego desde el nivel 1
   */
  private restartGame(): void {
    this.gameState.score = 0;
    this.gameUI.updateScore(0);
    this.startLevel(1);
  }

  /**
   * Power-up: Undo - Devuelve la última ficha de la mano al tablero con animación
   */
  private handleUndo(): boolean {
    if (!this.gameState.isPlaying || this.isAnimating) return false;
    
    // Obtener el índice del slot antes de remover (para saber desde dónde animar)
    const currentSlotIndex = this.handManager.getTileCount() - 1;
    if (currentSlotIndex < 0) return false;
    
    // Obtener la posición del slot en la mano (punto de partida de la animación)
    const slotPos = this.gameUI.getSlotPosition(currentSlotIndex);
    
    // Obtener la última ficha de la mano
    const tile = this.handManager.removeLastTile();
    if (!tile) return false;
    
    // Encontrar la ficha original en gameState para obtener su posición
    const originalTile = this.gameState.tiles.find(t => t.id === tile.id);
    if (!originalTile) return false;
    
    // Restaurar estado de la ficha
    originalTile.isInHand = false;
    originalTile.isAccessible = true;
    
    this.isAnimating = true;
    
    // Calcular posición destino en el tablero
    const targetPos = BoardGenerator.calculateScreenPosition(
      originalTile.position,
      this.currentLevelConfig,
      this.boardBounds
    );
    
    // Determinar si debe mostrar el volumen 3D inferior
    const showBottom3D = !this.hasAdjacentTileBelow(originalTile);
    
    // Crear el sprite de la ficha EN la posición del slot (donde está ahora)
    const tileSprite = new Tile3D(this, slotPos.x, slotPos.y, originalTile, showBottom3D);
    tileSprite.on("tile-clicked", (state: TileState) => {
      this.onTileClicked(state);
    });
    this.tileSprites.set(originalTile.id, tileSprite);
    this.boardContainer.add(tileSprite);
    
    // Configurar profundidad correcta
    tileSprite.setLayerDepth(originalTile.position.z);
    
    // Animar desde la mano hasta la posición original en el tablero
    this.tweens.add({
      targets: tileSprite,
      x: targetPos.x,
      y: targetPos.y,
      duration: 350,
      ease: "Back.easeOut",
      onComplete: () => {
        this.isAnimating = false;
        
        // Actualizar accesibilidad
        this.updateBoardAccessibility();
        this.updateTiles3DEffect();
      }
    });
    
    // Actualizar UI de la mano inmediatamente
    this.gameUI.updateHand(this.handManager.getSlots());
    
    // Reproducir sonido
    SoundManager.playCardToHand();
    
    return true;
  }

  /**
   * Power-up: Clock - Pausa el timer para este nivel
   */
  private handlePauseTime(): boolean {
    if (!this.gameState.isPlaying) return false;
    
    // Pausar el timer permanentemente para este nivel
    const success = this.gameUI.pauseTimer();
    
    if (success) {
      SoundManager.playCardToHand();
    }
    
    return success;
  }

  /**
   * Power-up: Hint - Encuentra y resuelve automáticamente el mejor trío
   * Prioriza completar tríos con fichas que ya están en el acumulador
   */
  private handleHint(): boolean {
    if (!this.gameState.isPlaying || this.isAnimating) return false;
    
    // Obtener fichas en el acumulador
    const handTiles = this.handManager.getTilesInHand();
    
    // Contar fichas por tipo en el acumulador
    const handTypeCounts = new Map<number, number>();
    for (const tile of handTiles) {
      handTypeCounts.set(tile.type, (handTypeCounts.get(tile.type) || 0) + 1);
    }
    
    // Buscar fichas accesibles en el tablero
    const accessibleTiles = this.gameState.tiles.filter(
      t => !t.isInHand && !t.isMatched && t.isAccessible
    );
    
    // Agrupar fichas del tablero por tipo
    const boardTypeCounts = new Map<number, TileState[]>();
    for (const tile of accessibleTiles) {
      const existing = boardTypeCounts.get(tile.type) || [];
      existing.push(tile);
      boardTypeCounts.set(tile.type, existing);
    }
    
    // Estrategia: Encontrar el trío que mejor convenga
    // Prioridad 1: Completar un trío con 2 fichas en el acumulador (necesita 1 del tablero)
    // Prioridad 2: Completar un trío con 1 ficha en el acumulador (necesita 2 del tablero)
    // Prioridad 3: Trío completo en el tablero (necesita 3 del tablero)
    
    let tilesToClick: TileState[] = [];
    
    // Prioridad 1: 2 en mano, 1 en tablero
    for (const [type, countInHand] of handTypeCounts) {
      if (countInHand >= 2) {
        const boardTiles = boardTypeCounts.get(type) || [];
        if (boardTiles.length >= 1) {
          tilesToClick = [boardTiles[0]];
          break;
        }
      }
    }
    
    // Prioridad 2: 1 en mano, 2 en tablero
    if (tilesToClick.length === 0) {
      for (const [type, countInHand] of handTypeCounts) {
        if (countInHand >= 1) {
          const boardTiles = boardTypeCounts.get(type) || [];
          if (boardTiles.length >= 2) {
            tilesToClick = [boardTiles[0], boardTiles[1]];
            break;
          }
        }
      }
    }
    
    // Prioridad 3: 0 en mano, 3 en tablero (solo si hay espacio en el acumulador)
    if (tilesToClick.length === 0) {
      const slotsAvailable = 5 - handTiles.length;
      if (slotsAvailable >= 3) {
        for (const [_type, boardTiles] of boardTypeCounts) {
          if (boardTiles.length >= 3) {
            tilesToClick = [boardTiles[0], boardTiles[1], boardTiles[2]];
            break;
          }
        }
      }
    }
    
    if (tilesToClick.length === 0) return false;
    
    // Hacer click en las fichas con delay
    let delay = 0;
    const totalTiles = tilesToClick.length;
    
    for (let i = 0; i < totalTiles; i++) {
      const tile = tilesToClick[i];
      this.time.delayedCall(delay, () => {
        // Verificar que el juego sigue activo y la ficha sigue accesible
        if (this.gameState.isPlaying && !tile.isInHand && !tile.isMatched) {
          this.onTileClicked(tile);
        }
      });
      delay += 250;
    }
    
    SoundManager.playCardToHand();
    return true;
  }

  update(): void {
    // El juego usa principalmente eventos y tweens, no necesita update frame a frame
  }
}
