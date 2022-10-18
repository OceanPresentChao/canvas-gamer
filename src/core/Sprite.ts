import type { Behavior, Painter } from './Painter'
export class Sprite {
  name: string
  top: number
  left: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  behaviors: Behavior[]
  painter: Painter
  visible: boolean
  animating: boolean
  config: Record<string, any>
  constructor(name: string, painter: Painter, behaviors: Behavior[] = []) {
    this.name = name
    this.painter = painter
    this.behaviors = behaviors
    this.top = this.left = this.velocityX = this.velocityY = 0
    this.width = this.height = 10
    this.visible = true
    this.animating = false
    this.config = {}
  }

  paint(context: CanvasRenderingContext2D) {
    if (this.painter && this.visible)
      this.painter.paint(this, context)
  }

  update(context: CanvasRenderingContext2D, time: number) {
    this.behaviors.forEach((b) => {
      b.execute(this, context, time)
    })
  }
}
