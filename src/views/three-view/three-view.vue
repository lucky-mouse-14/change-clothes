<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { useScene, useCamera, useRenderer, useGLTFLoader, useLights, useControls, useLibs, } from '@/hooks'

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

onMounted(() => {
  threeContainerWidth = refThreeContainer.value.offsetWidth
  threeContainerHeight = refThreeContainer.value.offsetHeight

  scene = initScene(scene)
  camera = initCamera(refThreeContainer.value)
  initLights(scene)
  renderer = initRenderer(refThreeContainer.value)
  controls = initOrbitControls(camera, renderer)
  stats = initStats(refThreeContainer.value)

  loadModel()

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

  skeleton = new THREE.SkeletonHelper( model );
  console.log('bbbb', skeleton)
  skeleton.visible = true;
  scene.add( skeleton );
}
</script>

<template>
  <div ref="refThreeContainer" class="three-container"></div>
</template>

<style scoped lang="less">
.three-container {
  width: 320px;
  height: 640px;
  border: 1px solid #000;
}
</style>
