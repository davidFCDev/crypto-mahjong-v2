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
      "https://remix.gg/blob/zS0QCi0PfUjO/1-LFKZbXeNH6j0EzLBjYlqZLDa3qB7p3.mp3?m8VL"
    );
    this.tileClickAudio.volume = 0.2;

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
