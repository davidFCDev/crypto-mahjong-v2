/**
 * PreloadScene - Escena de precarga del juego
 * Carga los assets mínimos necesarios mientras muestra el sprite animado
 */

import { PreloadSceneBase } from "./PreloadSceneBase";
import { SoundManager } from "../systems/SoundManager";

export class PreloadScene extends PreloadSceneBase {
  constructor() {
    // Siguiente escena: MainMenuScene
    super("PreloadScene", "MainMenuScene");
  }

  protected loadProjectAssets(): void {
    // === ASSETS CRÍTICOS (necesarios para el menú) ===
    
    // Imagen de fondo del menú principal
    this.load.image(
      "menu-bg",
      "https://remix.gg/blob/zS0QCi0PfUjO/mahjong-xLbaEqVFKWEylPL92Zn4ScyqpnczG8.webp?w5dj"
    );
  }

  protected onAssetsLoaded(): void {
    // Cargar la fuente WebFont (ya está en el HTML via Google Fonts link)
    // La fuente Fredoka One se precarga via el link en index.html
    
    // Inicializar SoundManager y precargar la primera pista de música
    // Las demás pistas se cargarán en lazy load
    SoundManager.preloadPrimaryTrack();
  }
}
