import { ref, onMounted, onBeforeUnmount, defineProps, defineExpose, } from 'vue'
import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'

export default function usePoseDetector({
  detectionModel,
  scoreThreshold,
}) {
  let detector = null

  // 检测器配置
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'full',
    enableSmoothing: true,
    detectorModelUrl: 'models/blazepose_3d/blazepose-3d-tfjs-detector-v1/model.json',
    landmarkModelUrl: 'models/blazepose_3d/blazepose-3d-tfjs-landmark-full-v2/model.json',
  }
  // const detectorConfig = {
  //   runtime: 'mediapipe',
  //   modelType: 'full',
  //   enableSmoothing: true,
  // }

  // 估计器配置
  const estimationConfig = {
    flipHorizontal: false, // 是否水平翻转
    maxPoses: 1, // 最大检测人数
    scoreThreshold: scoreThreshold, // 置信度
  }

  onBeforeUnmount(() => {
    dispose()
  })

  async function init() {
    await tf.ready()

    // 检测器
    detector = await poseDetection.createDetector(detectionModel, detectorConfig)
  }

  async function detect(el) {
    const timestamp = performance.now()
    const detectionResult = await detector.estimatePoses(el, estimationConfig, timestamp)

    return detectionResult
  }

  /**
   * 注销
   */
  function dispose() {
    detector?.dispose()
    detector = null
  }

  return {
    init,
    detect,
    dispose,
  }
}