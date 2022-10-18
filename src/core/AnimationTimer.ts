export class AnimationTimer {
  duration: number
  stopWatch: StopWatch
  timeWrapper: null | ((percent: number) => number)
  constructor(duration: number, timeWrapper?: (percent: number) => number) {
    this.duration = duration
    this.stopWatch = new StopWatch()
    this.timeWrapper = timeWrapper || null
  }

  start() {
    this.stopWatch.start()
  }

  stop() {
    this.stopWatch.stop()
  }

  getElapsedTime() {
    if (!this.stopWatch.isRunning()) {
      return -1
    }
    else {
      const elpased = this.stopWatch.getElapsedTime()
      if (!this.timeWrapper) {
        return elpased
      }
      else {
        const completePercent = elpased / this.duration
        return elpased * (this.timeWrapper(completePercent) / completePercent)
      }
    }
  }

  isRunning() {
    return this.stopWatch.isRunning()
  }

  isOver() {
    return this.stopWatch.getElapsedTime() > this.duration
  }

  static makeEaseIn(strength: number) {
    return function (percent: number) {
      return percent ** (strength * 2)
    }
  }

  static makeEaseOut(strength: number) {
    return function (percent: number) {
      return 1 - (1 - percent) ** (strength * 2)
    }
  }

  static makeEaseInOut() {
    return function (percent: number) {
      return percent - Math.sin(percent * 2 * Math.PI) / (2 * Math.PI)
    }
  }

  static makeElastic(passes: number) {
    return function (percent: number) {
      return ((1 - Math.cos(percent * Math.PI * passes)) * (1 - percent)) + percent
    }
  }

  /**
   * 被弹起次数的奇偶性会影响采用的函数
   * @param bounces 被弹起的总次数
   * @returns
   */
  static makeBounce(bounces: number) {
    const fn = AnimationTimer.makeElastic(bounces)
    return function (percent: number) {
      percent = fn(percent)
      return percent <= 1 ? percent : 2 - percent
    }
  }

  static makeLinear() {
    return function (percent: number) {
      return percent
    }
  }
}

class StopWatch {
  private startTime: number
  private running: boolean
  private elapsed: number
  constructor() {
    this.startTime = this.elapsed = 0
    this.running = false
  }

  start() {
    this.startTime = Date.now()
    this.elapsed = 0
    this.running = true
  }

  stop() {
    this.elapsed = Date.now() - this.startTime
    this.running = false
  }

  getElapsedTime() {
    if (this.running)
      return Date.now() - this.startTime
    else
      return this.elapsed
  }

  isRunning() {
    return this.running
  }

  reset() {
    this.elapsed = 0
  }
}
