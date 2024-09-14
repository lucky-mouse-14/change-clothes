<template>
  <div class="mask-wrapper" ref="refWrapper">
    <canvas ref="refCanvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, defineExpose, } from  'vue'

const props = defineProps({
  isReady: {
    type: Boolean,
    default: false,
  },
  isDetecting: {
    type: Boolean,
    default: false,
  },
})

const refCanvas = ref(null)
const refWrapper = ref(null)

let canvas = null

let canvasWidth = 0
let canvasHeight = 0

onMounted(() => {
  init()
})

defineExpose({
  init,
  drawMask,
})

function init () {
  canvasWidth = refWrapper.value.clientWidth
  canvasHeight= refWrapper.value.clientHeight

  console.log('dddd', canvasWidth, canvasHeight)

  canvas = refCanvas.value.getContext('2d')
  refCanvas.value.width = canvasWidth
  refCanvas.value.height = canvasHeight
}

function clearCanvas() {
  canvas?.clearRect(0,0, canvasWidth, canvasHeight)
}

function drawMask(keypoints) {
  clearCanvas()

  // 获取关键点
  const leftShoulder = keypoints[5]
  const rightShoulder = keypoints[6]
  const leftHip = keypoints[11]
  const rightHip = keypoints[12]

  console.log('vvvvvv', leftShoulder, rightShoulder, leftHip, rightHip)

  // 计算衣服位置和大小
  const centerX = (leftShoulder.x + rightShoulder.x) / 2
  const centerY = (leftShoulder.y + rightShoulder.y) / 2
  const width = Math.abs(leftShoulder.x - rightShoulder.x)
  const height = Math.abs(leftShoulder.y - leftHip.y)

  // 绘制衣服
  canvas.fillStyle = 'rgba(255, 0, 0, 1)'
  canvas.fillRect(leftShoulder.x, centerY, width, height)
}
</script>

<style lang="less" scoped>
.mask-wrapper {
  width: 320px;
  height: 640px;
  position: relative;
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
</style>