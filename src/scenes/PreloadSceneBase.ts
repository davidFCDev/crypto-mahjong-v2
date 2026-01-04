export abstract class PreloadSceneBase extends Phaser.Scene {
  protected assetsLoaded: boolean = false;
  protected animationComplete: boolean = false;
  protected bootSprite!: Phaser.GameObjects.Sprite;
  protected nextSceneKey: string;

  constructor(key: string, nextSceneKey: string = "StartScene") {
    super({ key });
    this.nextSceneKey = nextSceneKey;
  }

  init(): void {
    this.cameras.main.setBackgroundColor("#000000");
  }

  preload(): void {
    // Cargar el sprite común (es pequeño, carga rápido)
    this.load.spritesheet(
      "bootSprite",
      "https://remix.gg/blob/13e738d9-e135-454e-9d2a-e456476a0c5e/sprite-start-oVCq0bchsVLwbLqAPbLgVOrQqxcVh5.webp?Cbzd",
      { frameWidth: 241, frameHeight: 345 }
    );
  }

  create(): void {
    // Crear animación
    const frames = this.anims.generateFrameNumbers("bootSprite", {
      start: 0,
      end: 17, // 18 frames - 1
    });

    // Hacer que el último frame dure más (500ms) para mejor efecto visual
    if (frames.length > 0) {
      frames[frames.length - 1].duration = 500;
    }

    this.anims.create({
      key: "boot",
      frames: frames,
      frameRate: 12,
      repeat: 0, // Una sola vez, se queda en último frame
    });

    // Mostrar sprite centrado con proporción correcta
    const { width, height } = this.scale;
    this.bootSprite = this.add.sprite(width / 2, height / 2, "bootSprite");
    
    // Calcular escala manteniendo proporción (241x345 es el tamaño del frame)
    const spriteWidth = 241;
    const spriteHeight = 345;
    const maxWidth = width * 0.6; // 60% del ancho de pantalla
    const maxHeight = height * 0.6; // 60% del alto de pantalla
    const scaleX = maxWidth / spriteWidth;
    const scaleY = maxHeight / spriteHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // Usar la escala más pequeña para no distorsionar
    this.bootSprite.setScale(scale);
    this.bootSprite.play("boot");

    // Cuando termine la animación
    this.bootSprite.on("animationcomplete", () => {
      this.animationComplete = true;
      this.checkTransition();
    });

    // Configurar evento de carga completa
    this.load.on("complete", () => {
      this.onAssetsLoaded(); // Hook para lógica específica del hijo
      this.assetsLoaded = true;
      this.checkTransition();
    });

    // Cargar assets específicos del proyecto
    this.loadProjectAssets();

    // Iniciar la carga
    this.load.start();
  }

  /**
   * Método abstracto donde el hijo debe encolar sus assets (this.load.image, etc.)
   */
  protected abstract loadProjectAssets(): void;

  /**
   * Hook opcional que se ejecuta cuando la carga de assets finaliza,
   * antes de verificar la transición. Útil para procesar texturas (filtros, etc).
   */
  protected onAssetsLoaded(): void {}

  protected checkTransition(): void {
    if (this.animationComplete && this.assetsLoaded) {
      this.scene.start(this.nextSceneKey);
    }
  }
}
