import type { Sprite } from './Sprite'
export interface Painter {
  paint: (sprite: Sprite, context: CanvasRenderingContext2D) => void
}

export interface Behavior {
  execute: (sprite: Sprite, context: CanvasRenderingContext2D, time: number) => void
}

export class CanvasPainter implements Painter {
  paint: (sprite: Sprite, context: CanvasRenderingContext2D) => void
  constructor(paint: (sprite: Sprite, context: CanvasRenderingContext2D) => void) {
    this.paint = paint
  }
}

export class ImagePainter implements Painter {
  image: HTMLImageElement
  constructor(imageUrl: string) {
    this.image = new Image()
    this.image.src = imageUrl
  }

  paint(sprite: Sprite, context: CanvasRenderingContext2D) {
    if (this.image.complete)
      context.drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height)
  }
}

interface Cell {
  left: number
  top: number
  width: number
  height: number
}

export class SpriteSheetPainter implements Painter {
  cells: Cell[]
  cellIndex: number
  spriteSheet: HTMLImageElement
  constructor(spriteSheet: string, cells: Cell[]) {
    this.cells = cells
    this.cellIndex = 0
    this.spriteSheet = new Image()
    this.spriteSheet.src = spriteSheet
  }

  paint(sprite: Sprite, context: CanvasRenderingContext2D) {
    if (this.spriteSheet.complete) {
      const cell = this.cells[this.cellIndex]
      context.drawImage(this.spriteSheet, cell.left, cell.top, cell.width, cell.height, sprite.left, sprite.top, cell.width, cell.height)
    }
  }

  advance() {
    this.cellIndex = (++this.cellIndex) % this.cells.length
  }
}

export class SpriteAnimator {
  painters: SpriteSheetPainter[]
  elapsedCallback?: Function
  duration: number
  startTime: number
  index: number
  constructor(painters: SpriteSheetPainter[], elapsedCallback?: Function) {
    this.painters = painters
    this.elapsedCallback = elapsedCallback
    this.duration = 1000
    this.startTime = 0
    this.index = 0
  }

  end(sprite: Sprite, originalPainter: Painter) {
    sprite.animating = false
    if (this.elapsedCallback)
      this.elapsedCallback(sprite)
    else
      sprite.painter = originalPainter
  }

  start(sprite: Sprite, duration: number) {
    const endTime = Date.now() + duration
    const period = duration / this.painters.length
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const animator = this
    const originalPainter = sprite.painter
    let lastUpdate = 0
    this.index = 0
    sprite.animating = true
    sprite.painter = this.painters[this.index]
    requestAnimationFrame(function spriteAnimation(time: number) {
      if (time < endTime) {
        if ((time - lastUpdate) > period) {
          sprite.painter = animator.painters[(++animator.index) % animator.painters.length]
          lastUpdate = time
        }
        requestAnimationFrame(spriteAnimation)
      }
      else {
        animator.end(sprite, originalPainter)
      }
    })
  }
}

