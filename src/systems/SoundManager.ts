/**
 * SoundManager - Gestión de sonidos del juego
 */

class SoundManagerClass {
  private tileClickAudio: HTMLAudioElement | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isInitialized) return;

    // Crear el elemento de audio para el click de ficha
    this.tileClickAudio = new Audio(
      "https://remix.gg/blob/zS0QCi0PfUjO/tile-rEDK06oDjxbftVNzf9yiLZlUqCn6GN.mp3?0EiX"
    );
    this.tileClickAudio.volume = 0.3;

    this.isInitialized = true;
  }

  public playTileClick(): void {
    if (this.tileClickAudio) {
      // Clonar para permitir múltiples reproducciones simultáneas
      const sound = this.tileClickAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.2;
      sound.play().catch(() => {
        // Ignorar errores de autoplay
      });
    }
  }
}

// Exportar instancia única
export const SoundManager = new SoundManagerClass();
