<template>
  <div class="output-wrapper">
    <canvas ref="refCanvas" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, defineProps, nextTick, } from 'vue'

const refCanvas = ref(null)
let outputCtx = null

const state = reactive({
  sx: 0,
  sy: 0,
  sWidth: 0,
  sHeight: 0,
  dx: 0,
  dy: 0,
  dWidth: 0,
  dHeight: 0,
  videoWidth: 0,
  videoHeight: 0,
})

defineExpose({
  init,
  setSize,
  getCanvasElement,
  drawOutput,
  clearOutput,
  dispose,
})

onBeforeUnmount(() => {
  dispose()
})

function init() {
  return nextTick(() => {
    outputCtx = refCanvas.value.getContext('2d')
  })
}

function setSize(
  videoWidth,
  videoHeight,
  videoClientWidth,
  videoClientHeight,
) {
  state.videoWidth = videoWidth
  state.videoHeight = videoHeight

  refCanvas.value.width = videoClientWidth
  refCanvas.value.height = videoClientHeight

  const videoRatio = videoWidth / videoHeight
  const videoClientRatio = videoClientWidth / videoClientHeight

  const targetHeight = videoHeight
  const targetWidth = targetHeight * videoClientRatio
  const offsetX = (videoWidth - targetWidth) / 2

  state.sx = offsetX
  state.sy = 0
  state.sWidth = targetWidth
  state.sHeight = targetHeight
  state.dx = 0
  state.dy = 0
  state.dWidth = videoClientWidth
  state.dHeight = videoClientHeight
}

function getCanvasElement() {
  return refCanvas.value
}

function drawOutput(videoEl) {
  outputCtx?.drawImage(videoEl, state.sx, state.sy, state.sWidth, state.sHeight, state.dx, state.dy, state.dWidth, state.dHeight)
  // outputCtx.drawImage(videoEl, 0, 0, state.videoWidth, state.videoHeight, 0, 0, 320, 640)
}

function clearOutput() {
  outputCtx?.clearRect(0, 0, state.dWidth, state.dHeight)
}

function dispose() {
  clearOutput()
  outputCtx = null
}
</script>

<style lang="less" scoped>
.output-wrapper {
  width: 320px;
  height: 640px;
}
</style>