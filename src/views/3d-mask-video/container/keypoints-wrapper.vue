<template>
  <div class="keypoints-wrapper">
    <canvas ref="refCanvas" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, defineProps, nextTick, } from 'vue'
import * as poseDetection from '@tensorflow-models/pose-detection'

const props = defineProps({
  scoreThreshold: {
    type: Number,
    default: 0.5,
  }
})

const refCanvas = ref(null)
let keypointsCtx = null

const DEFAULT_LINE_WIDTH = 2
const DEFAULT_RADIUS = 4

const state = reactive({
  dWidth: 0,
  dHeight: 0,
})

defineExpose({
  init,
  setSize,
  getCanvasElement,
  clearKeypoints,
  drawKeypoints,
  dispose,
})

onBeforeUnmount(() => {
  dispose()
})

function init() {
  return nextTick(() => {
    keypointsCtx = refCanvas.value.getContext('2d')
  })
}

function setSize(
  videoClientWidth,
  videoClientHeight,
) {
  refCanvas.value.width = videoClientWidth
  refCanvas.value.height = videoClientHeight

  state.dWidth = videoClientWidth
  state.dHeight = videoClientHeight
}

function getCanvasElement() {
  return refCanvas.value
}

function clearKeypoints() {
  keypointsCtx?.clearRect(0, 0, state.dWidth, state.dHeight)
}

function drawKeypoints(kps, detectionModel) {
  // keypointInd 主要按left middle right  返回索引，left是单数索引，right是双数索引，打印一下你就知道了
  const keypointInd = poseDetection.util.getKeypointIndexBySide(detectionModel);

  keypointsCtx.strokeStyle = 'White';
  keypointsCtx.lineWidth = DEFAULT_LINE_WIDTH;

  keypointsCtx.fillStyle = 'Red';
  for (const i of keypointInd.middle) {
    drawPoint(kps[i]);
  }

  keypointsCtx.fillStyle = 'Green';
  for (const i of keypointInd.left) {
    drawPoint(kps[i]);
  }

  keypointsCtx.fillStyle = 'Orange';
  for (const i of keypointInd.right) {
    drawPoint(kps[i]);
  }

  drawLine(kps, detectionModel)
}

function drawPoint(kp) {
  // If score is null, just show the keypoint.
  const score = kp.score != null ? kp.score : 1;

  if (score >= props.scoreThreshold) {
    const circle = new Path2D();
    circle.arc(kp.x, kp.y, DEFAULT_RADIUS, 0, 2 * Math.PI);
    keypointsCtx.fill(circle);
    keypointsCtx.stroke(circle);
  }
}

function drawLine(kps, detectionModel) {
  // Each poseId is mapped to a color in the color palette.
  const color = 'White';

  keypointsCtx.fillStyle = color;
  keypointsCtx.strokeStyle = color;
  keypointsCtx.lineWidth = DEFAULT_LINE_WIDTH;

  poseDetection.util.getAdjacentPairs(detectionModel).forEach(([i, j]) => {
    const kp1 = kps[i];
    const kp2 = kps[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;

    if (score1 >= props.scoreThreshold && score2 >= props.scoreThreshold) {
      keypointsCtx.beginPath();
      keypointsCtx.moveTo(kp1.x, kp1.y);
      keypointsCtx.lineTo(kp2.x, kp2.y);
      keypointsCtx.stroke();
    }
  });
}

function dispose() {
  clearKeypoints()
  keypointsCtx = null
}
</script>