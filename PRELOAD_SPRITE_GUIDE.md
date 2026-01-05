# 🎮 Checklist: Añadir Sprite Animado a PreloadScene Existente

## Requisitos

- Proyecto Phaser 3 con PreloadScene ya existente
- Sprite animado con frames horizontales (WebP recomendado, <100KB)

---

## ✅ Checklist

### 1. Preparar el Sprite

- [ ] Crear/obtener sprite con frames horizontales
- [ ] Calcular `frameWidth = ancho_total / num_frames`
  - Ejemplo: 4338px / 18 frames = **241px**
- [ ] Subir a hosting (remix.gg, etc.)
- [ ] Copiar la URL

### 2. Modificar PreloadScene.ts

#### 2.1 Añadir propiedades a la clase

```typescript
private assetsLoaded: boolean = false;
private fontsLoaded: boolean = false;
private animationComplete: boolean = false;
private bootSprite!: Phaser.GameObjects.Sprite;
```

#### 2.2 En `preload()` - SOLO cargar el sprite

```typescript
preload(): void {
  // SOLO el sprite aquí (es pequeño, carga rápido)
  this.load.spritesheet(
    "bootSprite",
    "https://tu-url.com/sprite.webp",
    { frameWidth: 241, frameHeight: 345 } // Ajustar según tu sprite
  );
}
```

#### 2.3 En `create()` - Mostrar animación y cargar resto

```typescript
create(): void {
  // Crear animación con delay en último frame
  const frames = this.anims.generateFrameNumbers("bootSprite", {
    start: 0,
    end: 17, // num_frames - 1
  });

  // Hacer que el último frame dure más (500ms)
  if (frames.length > 0) {
    frames[frames.length - 1].duration = 500;
  }

  this.anims.create({
    key: "boot",
    frames: frames,
    frameRate: 12,
    repeat: 0, // Una sola vez, se queda en último frame
  });

  // Mostrar sprite centrado manteniendo proporción
  const { width, height } = this.scale;
  this.bootSprite = this.add.sprite(width / 2, height / 2, "bootSprite");

  // Escalar basándose en altura (50% de pantalla), mantiene proporción
  const frameHeight = 345; // Altura del frame
  const targetHeight = height * 0.5;
  const scale = targetHeight / frameHeight;
  this.bootSprite.setScale(scale, scale);
  this.bootSprite.play("boot");

  // Cuando termine la animación
  this.bootSprite.on("animationcomplete", () => {
    this.animationComplete = true;
    this.checkTransition();
  });

  // Cargar el resto de assets
  this.loadRemainingAssets();
}
```

#### 2.4 Mover carga de assets a `loadRemainingAssets()`

```typescript
private loadRemainingAssets(): void {
  // WebFont loader para fuentes
  this.load.script(
    "webfont",
    "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
  );

  this.load.on("filecomplete-script-webfont", () => {
    // @ts-ignore
    if (window.WebFont) {
      // @ts-ignore
      window.WebFont.load({
        google: { families: ["Tu Fuente"] },
        active: () => {
          this.fontsLoaded = true;
          this.checkTransition();
        },
        inactive: () => {
          this.fontsLoaded = true; // Continuar aunque falle
          this.checkTransition();
        },
      });
    }
  });

  // Assets prioritarios
  this.load.image("background", "URL");
  this.load.audio("music", "URL");
  // ... etc

  this.load.on("complete", () => {
    this.assetsLoaded = true;
    this.checkTransition();
  });

  this.load.start();
}
```

#### 2.5 Añadir método de transición

```typescript
private checkTransition(): void {
  // Solo transiciona cuando animación, assets Y fuentes están listos
  if (this.animationComplete && this.assetsLoaded && this.fontsLoaded) {
    this.scene.start("MainMenuScene"); // O tu escena principal
  }
}
```

---

## 📋 Resumen de Cambios

| Antes                  | Después                          |
| ---------------------- | -------------------------------- |
| `preload()` carga TODO | `preload()` solo carga sprite    |
| Sin animación          | Sprite animado mientras carga    |
| Transición inmediata   | Espera animación + assets + font |

---

## 🎵 Bonus: Carga Lazy de Música

En lugar de cargar toda la música en PreloadScene, carga solo la primera pista y el resto después:

```typescript
// En SoundManager o similar
static preloadPrimaryTrack(): void {
  this.bgm = new Audio("URL_PRIMERA_PISTA");
  this.bgm.load();

  // Cargar el resto después de 1 segundo
  setTimeout(() => this.loadExtraTracks(), 1000);
}

private static loadExtraTracks(): void {
  this.musicTracks = [
    new Audio("URL_TRACK_2"),
    new Audio("URL_TRACK_3"),
  ];
}
```

---

## 📐 Referencia: Cálculo de Frames

```
frameWidth = ancho_imagen / num_frames
frameHeight = alto_imagen
end = num_frames - 1
```

---

## 🎯 Tips Importantes

1. **Escala correcta**: Siempre usar `setScale(scale, scale)` con ambos valores para mantener proporción
2. **Último frame**: Añadir `duration: 500` al último frame para mejor efecto visual
3. **3 condiciones**: Verificar `animationComplete`, `assetsLoaded` Y `fontsLoaded`
4. **Fondo negro**: Usar `this.cameras.main.setBackgroundColor("#000000")` en `init()`
