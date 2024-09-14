<template>
  <div class="three-wrapper">
    <div ref="refThreeView" class="three-view" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, nextTick } from 'vue'
import * as THREE from 'three'
import {
  initScene,
  destroyScene,
  // initCamera,
  initOrthographicCamera,
  initOrbitControls,
  destroyControls,
  initLights,
  destroyLights,
  initRenderer,
  destroyRenderer,
  loadGLTF,
  loadFBX,
  loadVRM,
  initStats,
  initVideoTexture,
  modelCenter,
} from '@/utils/threeUtils'

import { PoseSolver } from '@/utils/poseUtils/poseSolver/index.js'
import { rigRotation, rigPosition } from '@/utils/poseUtils/poseHelper.js'

const props = defineProps({
  isDetecting: {
    type: Boolean,
    default: false,
  },
})

// 容器
const refThreeView = ref(null)

// 定义 threejs 变量
let threeViewWidth = 0
let threeViewHeight = 0
let scene = null
let renderer = null
let camera = null
let orbitControls = null
let lights = []
let stats = null
let skeletonHelper = null
let videoMesh = null
let currentModelFileType = ''
let currentVRM = null
const clock = new THREE.Clock()

const hipRotationOffset = 0.0
const positionOffset = {
  x: 0,
  // y: 1,
  // z: 0,
  y: 1.4,
  z: 2,
};

// self hooks

onMounted(() => {
  // init()
})

onBeforeUnmount(() => {
  destroy()
})

defineExpose({
  init,
  createVideoPlane,
  loadModel,
  updatePose,
  destroy,
})

async function init() {
  return new Promise((resolve) => {
    nextTick(() => {
      threeViewWidth = refThreeView.value.clientWidth
      threeViewHeight = refThreeView.value.clientHeight

      scene = initScene()
      // camera = initCamera(refThreeView.value)
      camera = initOrthographicCamera(refThreeView.value)
      lights = initLights(scene)

      renderer = initRenderer(refThreeView.value)
      orbitControls = initOrbitControls(camera, renderer, render)
      stats = initStats(refThreeView.value)

      return resolve()
    })
  })
}

// 渲染函数
function render() {
  stats.update()

  renderer?.clear()
  renderer?.render(scene, camera)
}

// 加载视频流
function createVideoPlane(videoEl) {
  console.log('ggggggggggggg', videoEl.videoWidth, videoEl.videoHeight)
  // 创建一个和视频画布一样大小的平面几何体
  const videoGeometry = new THREE.PlaneGeometry(videoEl.videoWidth, videoEl.videoHeight)
  // 创建视频纹理
  const videoTexture = new THREE.VideoTexture(videoEl)
  // 创建材质并应用视频纹理
  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture })
  // 将视频纹理应用到平面上
  const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial)

  // 将视频平面添加到场景
  scene.add(videoMesh)
}

// 加载模型
async function loadModel() {
  // const modelURL = '3DModules/three-vrm-girl.vrm'
  const modelURL = '3DModules/Xbot.glb'
  // const modelURL = '3DModules/t-shirt__3_fourth.glb'
  // const modelURL = '3DModules/Vanguard.fbx'
  currentModelFileType = modelURL.substring(modelURL.lastIndexOf('.') + 1).toLowerCase()
  // const model = await loadGLTF(modelURL)
  // const model = await loadFBX(modelURL)
  // const model = await loadVRM(modelURL)

  if (currentModelFileType === 'vrm') {
    const vrm = await loadVRM(modelURL)

    if (vrm.meta.metaVersion === '0') {
      vrm.scene.rotation.y = Math.PI
    }

    const model = vrm.scene

    currentVRM = vrm
    scene.add(model)
  }
  else if (currentModelFileType === 'glb') {
    const model = await loadGLTF(modelURL)

    // 添加模型
    scene.add(model)

    modelCenter(model)

    skeletonHelper = new THREE.SkeletonHelper(model)
    console.log('skeletonHelper-----', skeletonHelper)
    skeletonHelper.visible = true
    // 添加骨骼
    scene.add(skeletonHelper)

  }
  else { }

  render()
}

// 更新动作
function updatePose(pose2DLandmarks, pose3DLandmarks, videoElement) {

  console.log('pose2DLandmarks: ', pose2DLandmarks)
  console.log('pose3DLandmarks: ', pose3DLandmarks)

  const prediction = pose3DLandmarks[0]

  console.log('prediction: ', prediction)
  // skeletonHelper.position.set(prediction.x, prediction.y, prediction.z)

  const riggedPose = PoseSolver.solve(pose3DLandmarks, pose2DLandmarks, {
    runtime: 'tfjs',
    video: videoElement,
    imageSize: {
      width: 0,
      height: 0,
    }
  })

  console.log('DDDDDDDDDDDDD', riggedPose)

  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'Hips',
    {
      x: riggedPose.Hips.rotation.x,
      y: riggedPose.Hips.rotation.y,
      z: riggedPose.Hips.rotation.z + hipRotationOffset,
    },
    0.7,
  )
  // rigPosition(
  //   currentModelFileType,
  //   skeletonHelper,
  //   currentVRM,
  //   'Hips',
  //   {
  //     x: riggedPose.Hips.position.x + positionOffset.x, // Reverse direction
  //     y: riggedPose.Hips.position.y + positionOffset.y, // Add a bit of height
  //     z: -riggedPose.Hips.position.z + positionOffset.z, // Reverse direction
  //   },
  //   1,
  //   0.07,
  // )

  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'Chest',
    riggedPose.Chest,
    0.25,
    0.3,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'Spine',
    riggedPose.Spine,
    0.45,
    0.3,
  )

  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'RightUpperArm',
    riggedPose.RightUpperArm,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'RightLowerArm',
    riggedPose.RightLowerArm,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'LeftUpperArm',
    riggedPose.LeftUpperArm,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'LeftLowerArm',
    riggedPose.LeftLowerArm,
  )


  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'LeftUpperLeg',
    riggedPose.LeftUpperLeg,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'LeftLowerLeg',
    riggedPose.LeftLowerLeg,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'RightUpperLeg',
    riggedPose.RightUpperLeg,
  )
  rigRotation(
    currentModelFileType,
    skeletonHelper,
    currentVRM,
    'RightLowerLeg',
    riggedPose.RightLowerLeg,
  )

  if (currentModelFileType === 'vrm') {
    currentVRM.update(clock.getDelta())
  }

  render()
}

/** 销毁 */
function destroy() {
  destroyScene(scene)
  scene = null
  destroyControls(orbitControls)
  orbitControls = null
  destroyLights(lights)
  lights = []
  destroyRenderer(renderer)
  renderer = null
  camera = null

  // 骨架
  skeletonHelper?.dispose()
  skeletonHelper = null
}
</script>

<style lang="less" scoped>
.three-wrapper {
  width: 320px;
  height: 640px;
  position: relative;
  overflow: hidden;
}

.three-view {
  position: absolute;
  inset: 0;
  z-index: 2;
}
</style>