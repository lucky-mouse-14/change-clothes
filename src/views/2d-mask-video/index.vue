<template>
  <div class="2d-mask-container">
    <div class="view-wrapper">
      <VideoDetection ref="refVideoDetection" :is-ready="isReady" :is-detecting="isDetecting" />
      <MaskCanvas ref="refMaskCanvas" :is-ready="isReady" :is-detecting="isDetecting" />
    </div>
    <div class="oper-wrapper">
      <div v-show="!isReady" class="btn" @click="init">初始化</div>
      <div v-show="isReady" class="btn" @click="start">开始</div>
      <div v-show="isReady" class="btn" @click="stop">暂停</div>
      <div v-show="isReady" class="btn" @click="finish">结束</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, } from 'vue'
import VideoDetection from './container/video-detection.vue'
import MaskCanvas from './container/mask-canvas.vue'

const refVideoDetection = ref(null)
const refMaskCanvas = ref(null)

let animationId = null
let frameCount = 0
const framesPerUpdate = 2

const isDetecting = ref(false)
const isReady = ref(false)

const loading = ref(false)

onMounted(() => {})

onBeforeUnmount(() => {
  if(animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  frameCount = 0
  isDetecting.value = false
  isReady.value = false
  loading.value = false
})

/** init */
async function init() {
  await refVideoDetection.value?.init()
  // refMaskCanvas.value?.init()
  isReady.value = true
}

/** start */
async function start() {
  if(!isReady.value) return
  isDetecting.value = true

  refVideoDetection.value?.playVideo()

  await startFrame()
}

/** stop */
function stop() {
  isDetecting.value = false
  refVideoDetection.value?.stopVideo()
}

/** finish */
function finish() {
  isDetecting.value = false
  refVideoDetection.value?.destroy()
}

/** startFrame */
async function startFrame() {
  if (!isDetecting.value) return

  frameCount++

  if (frameCount % framesPerUpdate === 0) {
    const pointList = await refVideoDetection.value?.detectPose()
    console.log('pointList', pointList)
    refMaskCanvas.value?.drawMask(pointList)

    frameCount = 0
  }

  if(animationId) {
    cancelAnimationFrame(animationId)
  }

  // 一帧执行一次
  animationId = requestAnimationFrame(async () => {
    await startFrame()
  })
}

</script>

<style lang="less" scoped>
.view-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}


.oper-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  .btn {
    width: 100px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1a73e8;
    color: #fff;
    margin: 0 10px;
    cursor: pointer;
  }
}
</style>