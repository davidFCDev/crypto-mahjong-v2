/**
 * SoundManager - Gestión de sonidos del juego
 */

const MUSIC_TRACKS = [
  "https://remix.gg/blob/zS0QCi0PfUjO/music1-zKFROfpfIBFgZYn5jencNi3R0G3V1r.mp3?ZBiK",
  "https://remix.gg/blob/zS0QCi0PfUjO/music2-0NSHyOB5gMj9d4kV7Fh7DZQXLVLNzh.mp3?aEnZ",
  "https://remix.gg/blob/zS0QCi0PfUjO/music3-5x0zJv7q5eqPYLBCNS7GeQfelUQrRz.mp3?Hxjl",
];

class SoundManagerClass {
  private cardAudio: HTMLAudioElement | null = null;
  private trioAudio: HTMLAudioElement | null = null;
  private musicTracks: HTMLAudioElement[] = [];
  private currentMusicIndex: number = -1;
  private isMusicPlaying: boolean = false;
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
    this.cardAudio.preload = "auto";

    // Sonido para cuando hacemos un trio
    this.trioAudio = new Audio(
      "https://remix.gg/blob/zS0QCi0PfUjO/trio-Pn8FGqCg8FO38l0lOpVQEp7tU9fztk.mp3?J22q"
    );
    this.trioAudio.volume = 0.08;
    this.trioAudio.preload = "auto";

    // Precargar pistas de música
    for (const url of MUSIC_TRACKS) {
      const audio = new Audio(url);
      audio.volume = 0.15;
      audio.preload = "auto";
      audio.loop = false;
      // Cuando termina una pista, reproducir otra aleatoria
      audio.addEventListener("ended", () => this.playRandomTrack());
      this.musicTracks.push(audio);
    }

    // Forzar precarga de los sonidos
    this.cardAudio.load();
    this.trioAudio.load();
    this.musicTracks.forEach((track) => track.load());

    this.isInitialized = true;
  }

  private playRandomTrack(): void {
    if (!this.isMusicPlaying) return;

    // Elegir una pista diferente a la actual
    let newIndex = Math.floor(Math.random() * this.musicTracks.length);
    if (this.musicTracks.length > 1) {
      while (newIndex === this.currentMusicIndex) {
        newIndex = Math.floor(Math.random() * this.musicTracks.length);
      }
    }

    this.currentMusicIndex = newIndex;
    const track = this.musicTracks[newIndex];
    track.currentTime = 0;
    track.play().catch(() => {
      // Ignorar errores de autoplay
    });
  }

  public startMusic(): void {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.playRandomTrack();
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    // Pausar todas las pistas
    this.musicTracks.forEach((track) => {
      track.pause();
      track.currentTime = 0;
    });
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
