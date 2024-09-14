<template>
  <div class="3d-mask-container">
    <div class="view-wrapper">
      <div v-show="state.loading" class="loading-mask">加载中...</div>

      <Countdown ref="refCountdown" :number="state.countdownNumber" />

      <VideoWrapper ref="refVideoWrapper" />

      <div class="output-keypoints">
        <OutputWrapper ref="refOutputWrapper" class="output-keypoints__output" />
        <KeypointsWrapper ref="refKeypointsWrapper" class="output-keypoints__keypoints"
          :score_threshold="DEFAULT_SCORE_THRESHOLD" />
      </div>


      <ThreeWrapper ref="refThreeWrapper" />

    </div>
    <div class="oper-wrapper">

      <div v-show="state.isInited && !state.isStart" class="btn" @click="start">开始</div>
      <div v-show="state.canContinue" class="btn" @click="goon">继续</div>
      <div v-show="state.isDetecting" class="btn" @click="stop">暂停</div>
      <div v-show="state.isInited && state.isStart" class="btn" @click="finish">结束</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import VideoWrapper from './container/video-wrapper.vue'
// import DetectionWrapper from './container/detection-wrapper.vue'
import OutputWrapper from './container/output-wrapper.vue'
import KeypointsWrapper from './container/keypoints-wrapper.vue'
import ThreeWrapper from './container/three-wrapper.vue'
import Countdown from '@/components/Countdown/index.vue'
import { promiseTimeout } from '@vueuse/core'
import * as poseDetection from '@tensorflow-models/pose-detection'
import usePoseDetector from './hooks/usePoseDetector.js'

// ref els
const refCountdown = ref(null)
const refVideoWrapper = ref(null)
const refKeypointsWrapper = ref(null)
const refOutputWrapper = ref(null)
const refThreeWrapper = ref(null)

// state
const state = reactive({
  isInited: false,
  isStart: false,
  isDetecting: false,
  loading: false,
  canContinue: false,
  countdownNumber: 3,
})

// constant
const DEFAULT_SCORE_THRESHOLD = 0.2
const DETECTION_MODEL = poseDetection.SupportedModels.BlazePose // 检测模型

// Frame Animation
let frameAnimationId = null
let lastFrameTime = 0
const FPS = 25 // 目标帧率
const frameDuration = 1000 / FPS // 每一帧持续的时间

const poseDetector = usePoseDetector({
  detectionModel: DETECTION_MODEL,
  scoreThreshold: DEFAULT_SCORE_THRESHOLD,
})

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  finish()

  state.isInited = false
  state.loading = false
  state.canContinue = false
})

/** init */
async function init() {
  state.loading = true

  const resVideoInited = await refVideoWrapper.value?.load()

  refOutputWrapper.value?.setSize(
    resVideoInited.videoWidth,
    resVideoInited.videoHeight,
    resVideoInited.clientWidth,
    resVideoInited.clientHeight,
  )
  refKeypointsWrapper.value?.setSize(
    resVideoInited.clientWidth,
    resVideoInited.clientHeight,
  )

  await poseDetector.init()

  await refOutputWrapper.value?.init()
  await refKeypointsWrapper.value?.init()

  await refThreeWrapper.value?.init()
  refThreeWrapper.value?.createVideoPlane(resVideoInited.videoElement)
  await refThreeWrapper.value?.loadModel()

  state.isInited = true
  state.loading = false

}

/** start */
async function start() {
  if (!state.isInited || state.isDetecting || state.loading) return false

  await promiseTimeout(5000)

  state.isStart = true
  state.isDetecting = true

  refVideoWrapper.value?.start() // 开始播放视频

  // 开始帧的时间
  lastFrameTime = performance.now()

  await startFrame() // 开始帧动画
}

/** continue */
async function goon() {
  state.canContinue = false
  state.isDetecting = true

  refVideoWrapper.value?.start() // 开始播放视频
  await startFrame() // 开始帧动画
}

/** stop */
function stop() {
  state.isDetecting = false

  refVideoWrapper.value?.stop() // 停止播放视频
  endFrame() // 结束帧动画

  state.canContinue = true
}

/** finish */
function finish() {
  refVideoWrapper.value?.reset() // 重置
  endFrame() // 结束帧动画

  refOutputWrapper.value?.clearOutput() // 清除 video canvas
  refKeypointsWrapper.value?.clearKeypoints() // 清除 keypoints canvas

  state.isDetecting = false
  state.canContinue = false
  state.isStart = false
}

/**
 * 开始 帧动画
 */
async function startFrame() {
  if (!state.isDetecting) return false

  // 帧动画
  frameAnimationId = requestAnimationFrame(async () => {
    await startFrame()
  })

  const nowFrameTime = performance.now()

  if ((nowFrameTime - lastFrameTime) >= frameDuration) {
    lastFrameTime = nowFrameTime

    // 具体操作 - 开始
    // 获取 video 元素
    const videoElement = refVideoWrapper.value?.getVideoElement()
    // canvas 绘制视频帧
    refOutputWrapper.value?.drawOutput(videoElement)
    // 获取视频帧的 canvas 元素
    const canvasElement = refOutputWrapper.value?.getCanvasElement()
    // 获取每一帧的姿态检测结果
    const result = await poseDetector.detect(canvasElement)
    // 清除 人体姿态点 canvas
    refKeypointsWrapper.value?.clearKeypoints()
    // 绘制 人体姿态点 canvas
    refKeypointsWrapper.value?.drawKeypoints(result[0].keypoints, DETECTION_MODEL)
    // 更新 模型姿态
    refThreeWrapper.value?.updatePose(result[0].keypoints, result[0].keypoints3D, videoElement)
    // 具体操作 - 结束
  }
}

/**
 * 结束 帧动画
 */
function endFrame() {
  if (frameAnimationId) {
    cancelAnimationFrame(frameAnimationId)
    frameAnimationId = null
  }
}

</script>

<style lang="less" scoped>
.view-wrapper {
  display: flex;
  justify-content: center;
  align-items: stretch;
  position: relative;
  overflow: hidden;
}

video {
  width: 320px;
  height: 640px;
  object-fit: cover;
}

.loading-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.9);
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
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

.output-keypoints {
  position: relative;

  .output-keypoints__keypoints {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .output-keypoints__output {
    position: relative;
    z-index: 1;
  }
}
</style>