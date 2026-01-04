/**
 * SoundManager - Gestión de sonidos del juego
 * Implementa lazy loading para las pistas de música adicionales
 */

// La primera pista siempre se reproduce primero (se precarga en PreloadScene)
const PRIMARY_MUSIC_TRACK =
  "https://remix.gg/blob/zS0QCi0PfUjO/japan1-h7Q5EJSRNkIhLRsmjr59uj2OVJ7vLR.mp3?7Mgg";

// Pistas adicionales que se cargarán en lazy load
const ADDITIONAL_MUSIC_TRACKS = [
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
  private isPrimaryTrackLoaded: boolean = false;
  private additionalTracksLoaded: boolean = false;

  constructor() {
    // No inicializamos automáticamente, esperamos al preload
  }

  /**
   * Precarga los efectos de sonido y la primera pista de música
   * Se llama desde PreloadScene
   */
  public preloadPrimaryTrack(): void {
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

    // Precargar SOLO la primera pista de música
    const primaryTrack = new Audio(PRIMARY_MUSIC_TRACK);
    primaryTrack.volume = 0.15;
    primaryTrack.preload = "auto";
    primaryTrack.loop = false;
    primaryTrack.addEventListener("ended", () => this.playRandomTrack());
    this.musicTracks.push(primaryTrack);

    // Forzar precarga de los sonidos de efectos y la primera pista
    this.cardAudio.load();
    this.trioAudio.load();
    this.shuffleAudio.load();
    primaryTrack.load();

    this.isPrimaryTrackLoaded = true;
    this.isInitialized = true;

    // Iniciar lazy load de las pistas adicionales después de un pequeño delay
    setTimeout(() => this.lazyLoadAdditionalTracks(), 1000);
  }

  /**
   * Carga las pistas de música adicionales en segundo plano (lazy load)
   */
  private lazyLoadAdditionalTracks(): void {
    if (this.additionalTracksLoaded) return;

    for (const url of ADDITIONAL_MUSIC_TRACKS) {
      const audio = new Audio(url);
      audio.volume = 0.15;
      audio.preload = "auto";
      audio.loop = false;
      audio.addEventListener("ended", () => this.playRandomTrack());
      this.musicTracks.push(audio);
      // No forzamos load() para no bloquear - se cargará en segundo plano
    }

    this.additionalTracksLoaded = true;
  }

  private playRandomTrack(): void {
    if (!this.isMusicPlaying) return;
    if (this.musicTracks.length === 0) return;

    // Elegir una pista diferente a la actual (solo de las que ya están cargadas)
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

  /**
   * Inicia la reproducción de música - siempre empieza con la primera pista
   */
  public startMusic(): void {
    if (this.isMusicPlaying) return;
    if (this.musicTracks.length === 0) return;

    this.isMusicPlaying = true;

    // Siempre empezar con la primera pista (la que está precargada)
    this.currentMusicIndex = 0;
    const track = this.musicTracks[0];
    track.currentTime = 0;
    track.play().catch(() => {
      // Ignorar errores de autoplay
    });
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
