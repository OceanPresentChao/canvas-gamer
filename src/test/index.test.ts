import { describe, expect, it } from 'vitest'
class Demo {
  data: number
  constructor() {
    this.data = 1
  }

  start() {
    this.data++
    setTimeout(() => {
      this.start()
    }, 500)
  }
}

describe('test', () => {
  it('test', async () => {
    const demo = new Demo()
    demo.start()
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(0)
      }, 500)
    })
    expect(demo.data).toBe(3)
  })
})
