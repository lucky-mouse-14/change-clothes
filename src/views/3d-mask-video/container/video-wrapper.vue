<template>
  <div class="video-wrapper">
    <video ref="refVideo" playsinline loop>
      <source src="" type="video/mp4">
    </video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const VIDEO_URL = 'Videos/test4.mp4'

const refVideo = ref(null)

defineExpose({
  load,
  start,
  stop,
  reset,
  getVideoElement,
})

async function getVideoElement() {
  return new Promise((resolve) => {
    return resolve(refVideo.value)
  })
}

function load() {
  return new Promise((resolve, reject) => {
    refVideo.value.src = VIDEO_URL

    refVideo.value.addEventListener('loadeddata', () => {
      console.log('videoWidth: ', refVideo.value.videoWidth)
      console.log('videoHeight: ', refVideo.value.videoHeight)
      console.log('clientWidth: ', refVideo.value.clientWidth)
      console.log('clientHeight: ', refVideo.value.clientHeight)
      return resolve({
        videoWidth: refVideo.value.videoWidth,
        videoHeight: refVideo.value.videoHeight,
        clientWidth: refVideo.value.clientWidth,
        clientHeight: refVideo.value.clientHeight,
        videoElement: refVideo.value,
      })
    })
  })
}

function init() { }

function start() {
  refVideo.value.play()
}

function stop() {
  refVideo.value.pause()
}

function reset() {
  refVideo.value.pause()
  refVideo.value.currentTime = 0
  // refVideo.value.src = ''
}
</script>

<style lang="less" scoped>
.video-wrapper {
  width: 320px;
  height: 640px;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>