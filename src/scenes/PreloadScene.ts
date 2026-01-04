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

    // WebFont para el título (Fredoka One)
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
  }

  protected onAssetsLoaded(): void {
    // Inicializar SoundManager y precargar la primera pista de música
    // Las demás pistas se cargarán en lazy load
    SoundManager.preloadPrimaryTrack();
  }
}
