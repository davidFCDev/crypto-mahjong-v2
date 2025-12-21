export class SoundManager {
  private tileClickSound: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private readonly TILE_CLICK_URL = "https://remix.gg/blob/zS0QCi0PfUjO/tile-rEDK06oDjxbftVNzf9yiLZlUqCn6GN.mp3?0EiX";

  constructor() {
    this.initSounds();
  }

  private initSounds(): void {
    try {
      this.tileClickSound = new Audio(this.TILE_CLICK_URL);
      this.tileClickSound.volume = 0.2; // Muy poca intensidad
    } catch (e) {
      console.warn("Error initializing sounds:", e);
      this.isEnabled = false;
    }
  }

  playTileClick(): void {
    if (!this.isEnabled || !this.tileClickSound) return;

    try {
      // Reset time to allow rapid replay
      this.tileClickSound.currentTime = 0;
      this.tileClickSound.play().catch(e => {
        // Auto-play policy might block this until user interaction
        console.debug("Audio play failed (likely auto-play policy):", e);
      });
    } catch (e) {
      console.warn("Error playing sound:", e);
    }
  }
}

export const soundManager = new SoundManager();
