<template>
  <div class="video-wrapper">
    <canvas ref="refCanvas"></canvas>

    <video ref="refVideo" class="video-container" autoplay playsinline object-fill></video>

    <div class="btns">
      <div class="btn" @click="start">开始</div>
      <div class="btn" @click="stop">结束</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, } from 'vue'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'
import { emitter } from '@/utils'

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
const DEFAULT_LINE_WIDTH = 2
const DEFAULT_RADIUS = 5

let animationId = null
let frameCount = 0
let framesPerUpdate  = 2

let isDetected = false

onMounted(async () => {
  await init()
})

onUnmounted(() => {
  stop()
})

async function start() {
  isDetected = true

   // 获取视频流
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  }).catch(err => {
    console.log('err', err)
  })
  refVideo.value.srcObject = stream

  refVideo.value.onloadeddata = async function() {
    elVideoWidth = refVideo.value.clientWidth
    elVideoHeight = refVideo.value.clientHeight

    refCanvas.value.width = elVideoWidth
    refCanvas.value.height = elVideoHeight

    await tf.ready()

    model = poseDetection.SupportedModels.PoseNet

    detector = await poseDetection.createDetector(model, {
      quantBytes: 4,
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: {width: 257, height: 257},
      multiplier: 0.75
    })

    // 开始帧动画
    await startFrame()
  }
}

function stop() {
  isDetected = false
  if(animationId) {
    cancelAnimationFrame(animationId)
  }
  detector?.dispose()
  detector = null
  clearCtx()
}

async function init () {
  ctx = refCanvas.value.getContext('2d')
}

async function startFrame() {
  if (!isDetected) return false

  frameCount++

  if (frameCount % framesPerUpdate === 0) {
    await detectPose()

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

async function detectPose() {
  // 获取检测结果
  const poses = await detector.estimatePoses(refCanvas.value, {
    flipHorizontal: false, // 是否水平翻转
    maxPoses: 1, // 最大检测人数
    // scoreThreshold: DEFAULT_SCORE_THRESHOLD, // 置信度
    // nmsRadius: 20, // 非极大值抑制
  })

  // 绘制画布
  drawCtx()

  // 将 pose 上的17个关键点的坐标信息存入 pointList
  const pointList = poses[0]?.keypoints || []

  emitter.emit('update-pointList', pointList)

  // 画点
  drawKeypoints(pointList);
  // 画骨骼
  drawSkeleton(pointList);
}

function drawCtx() {
  ctx.drawImage(refVideo.value, 0, 0, elVideoWidth, elVideoHeight)
}

function clearCtx() {
  ctx.clearRect(0, 0, elVideoWidth, elVideoHeight)
}

// 画点
function drawKeypoints(keypoints) {
  // keypointInd 主要按left middle right  返回索引，left是单数索引，right是双数索引，打印一下你就知道了
  const keypointInd = poseDetection.util.getKeypointIndexBySide(model);
  ctx.strokeStyle = 'White';
  ctx.lineWidth = DEFAULT_LINE_WIDTH;

  ctx.fillStyle = 'Red';
  for (const i of keypointInd.middle) {
    drawKeypoint(keypoints[i]);
  }

  ctx.fillStyle = 'Green';
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i]);
  }

  ctx.fillStyle = 'Orange';
  for (const i of keypointInd.right) {
    drawKeypoint(keypoints[i]);
  }
}
function drawKeypoint(keypoint) {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1;

  if (score >= DEFAULT_SCORE_THRESHOLD) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
}

// 画骨架
function drawSkeleton(keypoints) {
  // Each poseId is mapped to a color in the color palette.
  const color = 'White';

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = DEFAULT_LINE_WIDTH;

  poseDetection.util.getAdjacentPairs(model).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;

    if (score1 >= DEFAULT_SCORE_THRESHOLD && score2 >= DEFAULT_SCORE_THRESHOLD) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
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