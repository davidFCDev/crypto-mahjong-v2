/**
 * SoundManager - Gestión de sonidos del juego
 */

class SoundManagerClass {
  private cardAudio: HTMLAudioElement | null = null;
  private trioAudio: HTMLAudioElement | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isInitialized) return;

    // Sonido para cuando enviamos una ficha al acumulador
    this.cardAudio = new Audio(
      "https://remix.gg/blob/zS0QCi0PfUjO/card-2zyqL9eHK6xXdLVCMxjmWdIupnc2Qx.mp3?eoim"
    );
    this.cardAudio.volume = 0.08;

    // Sonido para cuando hacemos un trio
    this.trioAudio = new Audio(
      "https://remix.gg/blob/zS0QCi0PfUjO/trio-Pn8FGqCg8FO38l0lOpVQEp7tU9fztk.mp3?J22q"
    );
    this.trioAudio.volume = 0.08;

    this.isInitialized = true;
  }

  public playCardToHand(): void {
    if (this.cardAudio) {
      // Clonar para permitir múltiples reproducciones simultáneas
      const sound = this.cardAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.08;
      sound.play().catch(() => {
        // Ignorar errores de autoplay
      });
    }
  }

  public playTrio(): void {
    if (this.trioAudio) {
      const sound = this.trioAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.08;
      sound.play().catch(() => {
        // Ignorar errores de autoplay
      });
    }
  }
}

// Exportar instancia única
export const SoundManager = new SoundManagerClass();
