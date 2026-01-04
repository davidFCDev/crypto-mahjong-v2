/**
 * SoundManager - Gestión de sonidos del juego
 */

const MUSIC_TRACKS = [
  "https://remix.gg/blob/zS0QCi0PfUjO/japan1-h7Q5EJSRNkIhLRsmjr59uj2OVJ7vLR.mp3?7Mgg",
  "https://remix.gg/blob/zS0QCi0PfUjO/japan2-UX2geRsXkauPcmjwLqcN8pyKkKX1u4.mp3?Pcxh",
  "https://remix.gg/blob/zS0QCi0PfUjO/japan3-lZ1E47esXUjGBsCVs8Cm1JSwnH26uT.mp3?UVvJ",
  "https://remix.gg/blob/zS0QCi0PfUjO/japan4-WoachgGDYPTmcoRaQOGrwPZ5MpGeyW.mp3?VzVh",
];

class SoundManagerClass {
  private cardAudio: HTMLAudioElement | null = null;
  private trioAudio: HTMLAudioElement | null = null;
  private shuffleAudio: HTMLAudioElement | null = null;
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

    // Sonido para repartir fichas al inicio del nivel
    this.shuffleAudio = new Audio(
      "https://remix.gg/blob/zS0QCi0PfUjO/card-2zyqL9eHK6xXdLVCMxjmWdIupnc2Qx.mp3?eoim"
    );
    this.shuffleAudio.volume = 0.12;
    this.shuffleAudio.preload = "auto";
    this.shuffleAudio.playbackRate = 1.2;

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
    this.shuffleAudio.load();
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

  /**
   * Reproduce efecto de repartir fichas (múltiples sonidos de cartas rápidos)
   */
  public playShuffle(tileCount: number = 16): void {
    if (!this.cardAudio) return;

    // Reproducir múltiples sonidos de carta con delays para simular reparto
    const soundCount = Math.min(tileCount, 12); // Máximo 12 sonidos
    const delayBetween = 40; // ms entre cada sonido

    for (let i = 0; i < soundCount; i++) {
      setTimeout(() => {
        const sound = this.cardAudio!.cloneNode() as HTMLAudioElement;
        // Variar el volumen y pitch ligeramente para más realismo
        sound.volume = 0.04 + Math.random() * 0.04;
        sound.playbackRate = 1.0 + Math.random() * 0.3;
        sound.play().catch(() => {});
      }, i * delayBetween);
    }
  }
}

// Exportar instancia única
export const SoundManager = new SoundManagerClass();
