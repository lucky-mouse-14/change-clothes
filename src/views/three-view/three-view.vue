<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { useScene, useCamera, useRenderer, useGLTFLoader, useLights, useControls, useLibs, } from '@/hooks'
import useBoneObj from './hooks/useBoneObj'


// 容器
const refThreeContainer = ref(null)

/// 定义变量
let threeContainerWidth = 0
let threeContainerHeight = 0
let scene = null
let renderer = null
let camera = null
let controls = null
let stats = null
let animationFrameId  = null
let skeleton = null

/// hooks
const { initScene, destroyScene, } = useScene()
const { initCamera, destroyCamera, } = useCamera()
const { initRenderer, destroyRenderer, } = useRenderer()
const { initLights, destroyLights } = useLights()
const { initOrbitControls, destroyControls } = useControls()
const { loadGLTF } = useGLTFLoader()
const { initStats } = useLibs()

/// self hooks
const { boneObj, initBoneObj, } = useBoneObj()

onMounted(async () => {
  threeContainerWidth = refThreeContainer.value.offsetWidth
  threeContainerHeight = refThreeContainer.value.offsetHeight

  scene = initScene(scene)
  camera = initCamera(refThreeContainer.value)
  initLights(scene)
  renderer = initRenderer(refThreeContainer.value)
  controls = initOrbitControls(camera, renderer)
  stats = initStats(refThreeContainer.value)

  await loadModel()

  console.log('threejs - scene - data: ', scene)

  render()
})

onBeforeUnmount(() => {
  skeleton?.dispose()
  destroyControls(controls)
  destroyRender()
  destroyRenderer(renderer)
  destroyLights()
  destroyCamera(camera)
  destroyScene(scene)
})

function render() {
  animationFrameId && window.cancelAnimationFrame(animationFrameId)
  animationFrameId = null
  animationFrameId = window.requestAnimationFrame(render)

  stats.update()

  renderer && renderer.clear()
  renderer && renderer.render(scene, camera)
}
function destroyRender() {
  animationFrameId && window.cancelAnimationFrame(animationFrameId)
  animationFrameId = null
}

async function loadModel() {
  const model = await loadGLTF()
  scene.add(model)

  initBoneObj(model)  

  skeleton = new THREE.SkeletonHelper( model );
  console.log('threejs - model - data: ', skeleton)
  skeleton.visible = true;
  scene.add( skeleton );
}

function testDoMotion1() {
  const bone = scene.getObjectByName('mixamorigLeftUpLeg')
  console.log('bone-leftUpLeg', bone)
  bone.rotation.z += 0.5
}
function testDoMotion2() {
  const bone1 = scene.getObjectByName('mixamorigLeftLeg')
  const bone2 = scene.getObjectByName('mixamorigLeftUpLeg')
  bone1.rotation.x += 0.4
  bone2.rotation.x -= 0.5
}
</script>

<template>
  <div ref="refThreeContainer" class="three-container" />
  <button @click="testDoMotion1">做动作1</button>
  <button @click="testDoMotion2">做动作2</button>
</template>

<style scoped lang="less">
.three-container {
  width: 320px;
  height: 640px;
  border: 1px solid #000;
}
</style>
