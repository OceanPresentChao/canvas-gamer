<script setup lang="ts">
import { Sprite } from '@/core/Sprite'
onMounted(() => {
  const canvas = document.getElementById('c') as HTMLCanvasElement
  const context = canvas.getContext('2d')
  canvas.width = 800
  canvas.height = 600
  const radius = 75
  const ball = new Sprite('ball', {
    paint(sprite, context) {
      context.beginPath()
      context.arc(sprite.left + sprite.width / 2, sprite.top + sprite.height / 2, radius, 0, Math.PI * 2, false)
      context.clip()
      context.lineWidth = 2
      context.strokeStyle = 'rgb(100,100,195)'
      context.fillStyle = 'rgba(30,144,255,0.15)'
      context.stroke()
      context.fill()
    },
  })
  ball.left = 320
  ball.top = 160
  ball.paint(context!)
})
</script>

<template>
  <div>
    <p>
      Hello
    </p>
    <canvas id="c" />
  </div>
</template>

<style scoped>

</style>
