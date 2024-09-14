<template>
  <div class="detection-wrapper">
    <video ref="refVideo" playsinline loop>
      <source src="/Videos/test4.mp4" type="video/mp4">
    </video>

    <canvas ref="refCanvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, defineExpose, } from 'vue'
import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'

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

const refVideo = ref(null)
const refCanvas = ref(null)

let canvas = null

let detector = null
let model = null

let elVideoWidth = 0
let elVideoHeight = 0
// let videoWidth = 0
// let videoHeight = 0

const DEFAULT_SCORE_THRESHOLD = 0.2
const DEFAULT_LINE_WIDTH = 2
const DEFAULT_RADIUS = 4

onMounted(() => {
  // 
})

onBeforeUnmount(() => {
  destroy()
})

defineExpose({
  init,
  detectPose,
  playVideo,
  stopVideo,
  destroy,
})

async function init () {
  await tf.ready()

  elVideoWidth = refVideo.value.clientWidth
  elVideoHeight = refVideo.value.clientHeight
  // videoWidth = refVideo.value.videoWidth
  // videoHeight = refVideo.value.videoHeight

  console.log('dddddddd', elVideoWidth, elVideoHeight)

  refCanvas.value.width = elVideoWidth
  refCanvas.value.height = elVideoHeight
  // refCanvas.value.width = videoWidth
  // refCanvas.value.height = videoHeight

  // 获取画布
  canvas = refCanvas.value.getContext('2d')

  // 获取模型
  model = poseDetection.SupportedModels.MoveNet

  // 获取检测器
  detector = await poseDetection.createDetector(model, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    enableSmoothing: true,
    minPoseScore: DEFAULT_SCORE_THRESHOLD,
  })
}

async function detectPose() {
  // 绘制画布
  drawCtx()

  // 获取检测结果
  const poses = await detector.estimatePoses(refCanvas.value, {
    flipHorizontal: false, // 是否水平翻转
    maxPoses: 1, // 最大检测人数
    scoreThreshold: DEFAULT_SCORE_THRESHOLD, // 置信度
    nmsRadius: 20, // 非极大值抑制
  })

  // 将 poses 上的关键点的坐标信息存入 pointList
  const pointList = poses && poses.length ? poses[0].keypoints : []

  if (pointList.length) {
    // 画点
    drawKeypoints(pointList)
    // 画骨骼
    drawSkeleton(pointList)
  }

  return pointList || null
}

function drawCtx() {
  canvas?.drawImage(refVideo.value, 0, 0, elVideoWidth, elVideoHeight)
  // canvas?.drawImage(refVideo.value, 0, 0, videoWidth, videoHeight)
}

function clearCtx() {
  canvas?.clearRect(0, 0, elVideoWidth, elVideoHeight)
  // ctxcanvas?.clearRect(0, 0, videoWidth, videoHeight)
}

// 画点
function drawKeypoints(keypoints) {
  // keypointInd 主要按left middle right  返回索引，left是单数索引，right是双数索引，打印一下你就知道了
  const keypointInd = poseDetection.util.getKeypointIndexBySide(model);
  canvas.strokeStyle = 'White';
  canvas.lineWidth = DEFAULT_LINE_WIDTH;

  canvas.fillStyle = 'Red';
  for (const i of keypointInd.middle) {
    drawKeypoint(keypoints[i]);
  }

  canvas.fillStyle = 'Green';
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i]);
  }

  canvas.fillStyle = 'Orange';
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
    canvas.fill(circle);
    canvas.stroke(circle);
  }
}

// 画骨架
function drawSkeleton(keypoints) {
  // Each poseId is mapped to a color in the color palette.
  const color = 'White';

  canvas.fillStyle = color;
  canvas.strokeStyle = color;
  canvas.lineWidth = DEFAULT_LINE_WIDTH;

  poseDetection.util.getAdjacentPairs(model).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;

    if (score1 >= DEFAULT_SCORE_THRESHOLD && score2 >= DEFAULT_SCORE_THRESHOLD) {
      canvas.beginPath();
      canvas.moveTo(kp1.x, kp1.y);
      canvas.lineTo(kp2.x, kp2.y);
      canvas.stroke();
    }
  });
}

function playVideo () {
  refVideo.value?.play()
}

function stopVideo () {
  refVideo.value?.pause()
}

function destroy() {
  refVideo.value?.pause()
  refVideo.value.currentTime = 0

  detector?.dispose()
  detector = null
  clearCtx()
}
</script>

<style lang="less" scoped>
.detection-wrapper {
  width: 320px;
  height: 640px;
  position: relative;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  // position: relative;
  // z-index: 1;
}

canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
}
</style>