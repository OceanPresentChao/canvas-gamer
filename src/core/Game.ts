/* eslint-disable @typescript-eslint/no-this-alias */
import type { Sprite } from './Sprite'
type KeyEventCallback = (e: KeyboardEvent) => void
export class Game {
  // General
  name: string
  context: CanvasRenderingContext2D
  canvas: HTMLCanvasElement | null
  sprites: Sprite[]
  // Time
  startTime: number
  lastTime: number
  gameTime: number
  fps: number
  STARTING_FPS: number
  startedPausedAt: number
  PAUSE_TIMEOUT: number
  isPaused: boolean
  // Image
  imageMap: Map<string, HTMLImageElement>
  loadedImageCount: number
  loadFailedImageCount: number
  // Sound
  soundOn: boolean
  soundChannels: HTMLAudioElement[]
  NUM_SOUND_CHANNELS: number
  audio: HTMLAudioElement
  // key events
  keyListenerMap: Map<string, KeyEventCallback>
  // high score
  HIGH_SCORE_PREFIX: string
  constructor(name: string, canvasId: string) {
    this.name = name
    this.canvas = null
    const el = document.getElementById(canvasId)
    if (el && el instanceof HTMLCanvasElement)
      this.canvas = el
    else
      throw new Error(`cannot get canvas element from canvasId: ${canvasId}`)
    const ctx = this.canvas.getContext('2d')
    if (ctx)
      this.context = ctx
    else
      throw new Error('cannot get canvas 2d context from canvas')
    this.startTime = this.lastTime = this.gameTime = 0
    this.fps = 0
    this.startedPausedAt = 0
    this.STARTING_FPS = 60
    this.isPaused = false
    this.PAUSE_TIMEOUT = 100
    this.sprites = []
    this.loadedImageCount = 0
    this.loadFailedImageCount = 0
    this.imageMap = new Map()
    this.NUM_SOUND_CHANNELS = 10
    this.soundOn = true
    this.soundChannels = []
    this.audio = new Audio()
    for (let i = 0; i < this.NUM_SOUND_CHANNELS; i++)
      this.soundChannels.push(new Audio())
    this.keyListenerMap = new Map()
    this.HIGH_SCORE_PREFIX = `${this.name}_highscore`
  }

  start() {
    const self = this
    this.startTime = Date.now()
    requestAnimationFrame(self.animate)
  }

  animate(time: number) {
    const self = this
    if (this.isPaused) {
      setTimeout(() => {
        self.animate(time)
      }, this.PAUSE_TIMEOUT)
    }
    else {
      // Game Loop
      this.tick(time)
      this.clearScreen()
      this.startAnimate()
      this.paintUnderSprites()
      this.updateSprites(time)
      this.paintSprites()
      this.paintOverSprites()
      this.endAnimate()
      requestAnimationFrame(self.animate)
    }
  }

  /**
   * update frame rate
   * @param time
   */
  tick(time: number) {
    this.updateFrameRate(time)
    this.gameTime = time - this.startTime
    this.lastTime = time
  }

  /**
 * update fps
 * @param time
 */
  updateFrameRate(time: number) {
    if (this.lastTime === 0)
      this.fps = this.STARTING_FPS
    else
      this.fps = Math.floor(1000 / (time - this.lastTime))
  }

  clearScreen() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  updateSprites(time: number) {
    this.sprites.forEach((sp) => {
      sp.update(this.context, time)
    })
  }

  paintSprites() {
    this.sprites.forEach((sp) => {
      if (sp.visible)
        sp.paint(this.context)
    })
  }

  startAnimate() {

  }

  paintUnderSprites() {

  }

  paintOverSprites() {

  }

  endAnimate() {

  }

  togglePaused() {
    const now = Date.now()
    this.isPaused = !this.isPaused
    if (this.isPaused) {
      this.startedPausedAt = now
    }
    else {
      this.startTime += now - this.startedPausedAt
      this.lastTime = now
    }
  }

  /**
 * get the amount of pixels an object should move in current frame
 * (pixels / second) * (seconds / frame) = (pixels / frame)
 * @param time
 * @param velocity
 */
  getPixelsPerFrame(velocity: number) {
    return velocity * this.fps
  }

  getImage(url: string) {
    if (this.imageMap.has(url))
      return this.imageMap.get(url)
    else
      return null
  }

  imageLoadedCallback(e: Event) {
    this.loadedImageCount++
  }

  imageLoadFailedCallback(e: Event) {
    this.loadFailedImageCount++
  }

  loadImage(url: string) {
    const image = new Image()
    image.src = url
    const self = this
    image.addEventListener('load', (e) => {
      this.loadedImageCount++
      self.imageLoadedCallback(e)
    })
    image.addEventListener('error', (e) => {
      this.loadFailedImageCount++
      self.imageLoadedCallback(e)
    })
    this.imageMap.set(url, image)
  }

  getImageLoadPercent() {
    return (this.loadFailedImageCount + this.loadedImageCount) / this.imageMap.size
  }

  canPlayOggVorbis() {
    return this.audio.canPlayType('audio/ogg;codecs="vorbis"') !== 'maybe'
  }

  canPlayMp4() {
    return this.audio.canPlayType('audio/mp4') !== 'maybe'
  }

  getAvailableChannel() {
    for (let i = 0; i < this.NUM_SOUND_CHANNELS; i++) {
      const audio = this.soundChannels[i]
      if (audio.played && audio.played.length > 0) {
        if (audio.ended)
          return audio
      }
      else {
        if (!audio.ended)
          return audio
      }
    }
    return null
  }

  playSound(id: string) {
    const track = this.getAvailableChannel()
    const el = document.getElementById(id)
    if (track && el && el instanceof HTMLAudioElement) {
      track.src = el.src === '' ? el.currentSrc : el.src
      track.load()
      track.play()
    }
  }

  addKeyListener(key: string, keyListener: KeyEventCallback) {
    this.keyListenerMap.set(key, keyListener)
  }

  findKeyListener(key: string) {
    if (this.keyListenerMap.has(key))
      return this.keyListenerMap.get(key)
    else
      return null
  }

  keyPressed(e: KeyboardEvent) {
    const listener = this.findKeyListener(e.key)
    if (listener)
      listener(e)
  }

  getHighScores() {
    const scores = localStorage.getItem(this.HIGH_SCORE_PREFIX)
    if (scores)
      return JSON.parse(scores) as number[]
    else
      return null
  }

  setHighScores(score: number) {
    const scores = this.getHighScores() || []
    scores.unshift(score)
    localStorage.setItem(this.HIGH_SCORE_PREFIX, JSON.stringify(scores))
  }

  clearHighScores() {
    localStorage.setItem(this.HIGH_SCORE_PREFIX, JSON.stringify([]))
  }
}

