<template>
  <div class="video-wrapper">
    <canvas ref="refCanvas"></canvas>
    <!-- <video ref="refVideo" class="video-container" loop controls>
      <source src="/Videos/test.mp4" type="video/mp4">
    </video> -->
    <video ref="refVideo" class="video-container" autoplay playsinline object-fill></video>

    <div class="btns">
      <div class="btn" @click="start">开始</div>
      <div class="btn" @click="stop">结束</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, } from 'vue'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'

const refVideo =  ref(null)
const refCanvas = ref(null)

let ctx = null
let stream = null
let options = null
let mediaRecorder = null

let detector = null
let model = null

let elVideoWidth = 0
let elVideoHeight = 0

const DEFAULT_SCORE_THRESHOLD = 0.5
const DEFAULT_LINE_WIDTH = 4
const DEFAULT_RADIUS = 5

onMounted(async () => {
  await init()
})

onBeforeUnmount(() => {
  detector?.dispose()
  detector = null
  clearCtx()
})

async function start() {
  refVideo.value.play()
  await detectPose()

  setTimeout(() => {
    detectPose()
  }, 50)
}

async function init () {

  // 获取视频流
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  })
  refVideo.value.srcObject = stream

  elVideoWidth = refVideo.value.clientWidth
  elVideoHeight = refVideo.value.clientHeight

  refCanvas.value.width = elVideoWidth
  refCanvas.value.height = elVideoWidth

  await tf.ready()
  console.log('tf ready complete.')
  model = poseDetection.SupportedModels.PoseNet
  console.log('111111111 - model', model)
  detector = await poseDetection.createDetector(model, {
    quantBytes: 4,
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: {width: 500, height: 500},
    multiplier: 0.75
  })
  console.log('111111111 - detector', detector)

  ctx = refCanvas.value.getContext('2d')
}

async function detectPose() {
  console.log('refVideo.value', refVideo.value)
  // 获取检测结果
  const poses = await detector.estimatePoses(refVideo.value, {
    flipHorizontal: false, // 是否水平翻转
    maxPoses: 1, // 最大检测人数
    // scoreThreshold: DEFAULT_SCORE_THRESHOLD, // 置信度
    // nmsRadius: 20, // 非极大值抑制
  })
  console.log('aaaaaaa', poses)
  // 将 pose 上的17个关键点的坐标信息存入 pointList
  const pointList = poses[0]?.keypoints || []
  console.log('111111111111 - pointList', pointList)

  // 绘制画布
  drawCtx()

  // 画出所有关键点
  pointList.forEach(({ x, y, score, name }) => {
    if (score > DEFAULT_SCORE_THRESHOLD) {
      // 画点
      drawPoint(x, y, DEFAULT_RADIUS, '#f00000', ctx)
    }
  })

  // 获取相邻的关键点信息
  const adjacentPairs = poseDetection.util.getAdjacentPairs(model)
  // 画出所有连线
  adjacentPairs.forEach(([i, j]) => {
    const kp1 = pointList[i]
    const kp2 = pointList[j]
    // score 不为空就画线
    const score1 = kp1.score != null ? kp1.score : 1
    const score2 = kp2.score != null ? kp2.score : 1
    if (score1 >= DEFAULT_SCORE_THRESHOLD && score2 >= DEFAULT_SCORE_THRESHOLD) {
      // 画出所有连线
      drawSegment([kp1.x, kp1.y], [kp2.x, kp2.y], 'aqua', 1, ctx)
    }
  })
}

function drawCtx() {
  ctx.drawImage(refVideo.value, 0, 0, elVideoWidth, elVideoHeight)
}

function clearCtx() {
  ctx.clearRect(0, 0, elVideoWidth, elVideoHeight)
}

  // 画点
function drawPoint(x, y, r, color, ctx) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}
// 画线段
function drawSegment([ax, ay], [bx, by], color, scale, ctx) {
  ctx.beginPath()
  ctx.moveTo(ax * scale, ay * scale)
  ctx.lineTo(bx * scale, by * scale)
  ctx.lineWidth = DEFAULT_LINE_WIDTH
  ctx.strokeStyle = color
  ctx.stroke()
}
</script>

<style lang="less" scoped>
.video-wrapper {
  width: 640px;
  height: 640px;
  border: 1px solid #000;
  position: relative;
}
video {
  width: 100%;
  height: 100%;
}
canvas {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
.btns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .btn {
    width: 100px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1a73e8;
    color: #fff;
    margin: 0 10px;
  }
}
</style>