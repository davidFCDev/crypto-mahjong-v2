# Guía de Aspect Ratio para Juegos Remix

## Requisitos de Remix

Los juegos Remix deben funcionar correctamente en **dos modos**:

| Modo            | Aspect Ratio                  | Ejemplo viewport           |
| --------------- | ----------------------------- | -------------------------- |
| **Card (feed)** | **2:3** (720×1080)            | Iframe en el feed de Remix |
| **Full screen** | variable (9:16, 9:19.5, etc.) | El dispositivo del usuario |

## Arquitectura de escalado implementada

### Principio clave: ancho fijo 720px, altura dinámica

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  720×1080   │   │  720×1280   │   │  720×1560   │
│   (2:3)     │   │   (9:16)    │   │  (9:19.5)   │
│             │   │             │   │             │
│  Card mode  │   │  Full screen│   │  iPhone Pro │
│             │   │  estándar   │   │             │
│             │   │             │   │             │
│             │   │             │   │             │
│             │   │      ▼      │   │      ▼      │
│             │   │  Más espacio│   │  Más espacio│
│             │   │  vertical   │   │  vertical   │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Cómo funciona

1. **`main.ts`** detecta el viewport real al arrancar
2. Si el viewport es más alto que 2:3 → la altura del canvas se extiende
3. `Phaser.Scale.FIT` escala el canvas para llenar el contenedor sin deformar
4. `GameSettings.canvas.height` se actualiza dinámicamente → todo el UI se adapta

```typescript
// main.ts - Cálculo dinámico de altura
const GAME_WIDTH = 720;
const BASE_HEIGHT = 1080; // 2:3 base

const viewportRatio = window.innerWidth / window.innerHeight;
const idealRatio = 2 / 3; // 0.6667

let gameHeight: number;
if (viewportRatio < idealRatio - 0.01) {
  // Pantalla más alta que 2:3 → extender altura
  gameHeight = Math.round(GAME_WIDTH / viewportRatio);
} else {
  // 2:3 o más ancha → usar altura base
  gameHeight = BASE_HEIGHT;
}

// Actualizar para que todo el juego use la altura correcta
GameSettings.canvas.height = gameHeight;
```

### Posicionamiento de elementos UI

Dado que la altura es dinámica, los elementos deben posicionarse así:

| Zona                           | Estrategia                 | Ejemplo                                          |
| ------------------------------ | -------------------------- | ------------------------------------------------ |
| **Top** (score, nivel)         | Y fijo desde arriba        | `y: 55`                                          |
| **Bottom** (mano, power-ups)   | Relativo a `canvas.height` | `y: canvas.height - bottomMargin`                |
| **Center** (tablero, overlays) | Espacio entre top y bottom | `height: canvas.height - topSpace - bottomSpace` |

```typescript
// ✅ CORRECTO - Se adapta a cualquier altura
const handY = GameSettings.canvas.height - hand.bottomMargin;

// ✅ CORRECTO - Top elements con Y fijo
const scoreBadgeY = 55;

// ✅ CORRECTO - Board usa espacio disponible
const boardHeight =
  GameSettings.canvas.height -
  160 -
  hand.bottomMargin -
  hand.slotHeight / 2 -
  30;
```

## Errores comunes a evitar

### ❌ CSS `width: 100% !important` en el canvas

```css
/* ❌ NUNCA hacer esto */
canvas {
  width: 100% !important;
}
```

Esto **sobreescribe el escalado de `Phaser.Scale.FIT`** y causa estiramiento horizontal. Phaser calcula el tamaño exacto del canvas para mantener el aspect ratio; forzar `width: 100%` rompe esa proporción.

```css
/* ✅ CORRECTO */
canvas {
  outline: none;
  margin: 0;
  display: block;
  /* Dejar que Phaser controle width/height */
}
```

### ❌ Escalar sprites con scaleX ≠ scaleY para "compensar"

```typescript
// ❌ Hack que oculta el problema real (CSS stretching)
const scaleX = targetWidth / frame.width;
const scaleY = targetHeight / frame.height;
sprite.setScale(scaleX, scaleY);
```

Si necesitas un hack de este tipo, el problema real está en el CSS o en la config de Phaser.

```typescript
// ✅ CORRECTO - Escala uniforme, mantiene proporciones
const uniformScale = targetHeight / frame.height;
sprite.setScale(uniformScale);
```

### ❌ Usar resolución fija 9:16 (720×1280) como base

```typescript
// ❌ No coincide con el card de Remix (2:3)
canvas: { width: 720, height: 1280 }
```

```typescript
// ✅ Base 2:3, se extiende dinámicamente
canvas: { width: 720, height: 1080 } // Se actualiza en runtime por main.ts
```

## Referencia de ratios

| Contexto       | Ratio (w:h) | Decimal | Canvas resultante |
| -------------- | ----------- | ------- | ----------------- |
| **Remix card** | 2:3         | 0.667   | 720×1080          |
| iPhone SE      | 9:16        | 0.5625  | 720×1280          |
| iPhone 14      | 9:19.5      | 0.462   | 720×1560          |
| Samsung Galaxy | 9:20        | 0.450   | 720×1600          |
| iPad           | 3:4         | 0.750   | 720×1080 (capped) |

## Checklist para nuevos juegos Remix

- [ ] `GameSettings.canvas` usa 720×1080 como base
- [ ] `main.ts` calcula altura dinámica antes de crear el game
- [ ] `Phaser.Scale.FIT` + `CENTER_BOTH` en la config
- [ ] CSS del canvas **NO tiene** `width: 100%` ni `height: 100%`
- [ ] Sprites usan `setScale(uniform)`, no `setScale(x, y)` con valores distintos
- [ ] Elementos top → Y fijo
- [ ] Elementos bottom → Y relativo a `canvas.height`
- [ ] Board/contenido central → ocupa espacio entre top y bottom
- [ ] Overlays → usan `canvas.width × canvas.height` completo

## Cómo adaptar un elemento UI puntual (opcional)

En la mayoría de los casos NO es necesario, porque el posicionamiento relativo a `canvas.height` ya resuelve el layout. Pero si necesitas un ajuste específico:

```typescript
const aspectRatio = GameSettings.canvas.width / GameSettings.canvas.height;
const is2by3 = Math.abs(aspectRatio - 2 / 3) < 0.02;

if (is2by3 || aspectRatio > 2 / 3) {
  // Pantalla 2:3 o más ancha → posición estándar
  element.y = 18;
} else {
  // Pantalla más alta → ajustar si es necesario
  element.y = 50;
}
```
