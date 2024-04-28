<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { useScene, useCamera, useRenderer, useGLTFLoader, useLights } from '@/hooks'

// 容器
const refThreeContainer = ref()

/// 定义变量
let threeContainerWidth = 0
let threeContainerHeight = 0
let scene = null
let renderer = null
let camera = null 
let animationFrameId  = null

/// hooks
const { initScene, destroyScene, } = useScene()
const { initCamera, destroyCamera, } = useCamera()
const { initRenderer, destroyRenderer, } = useRenderer()
const { initLights, destroyLights } = useLights()

onMounted(() => {
  threeContainerWidth = refThreeContainer.value.offsetWidth
  threeContainerHeight = refThreeContainer.value.offsetHeight

  scene = initScene(scene)
  camera = initCamera(refThreeContainer.value)
  initLights(scene)
  renderer = initRenderer(refThreeContainer.value)

  console.log('vvvv', renderer)

  loadModel()

  render()
})

onBeforeUnmount(() => {
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

  renderer && renderer.clear()
  renderer && renderer.render(scene, camera)
}
function destroyRender() {
  animationFrameId && window.cancelAnimationFrame(animationFrameId)
  animationFrameId = null
}

function loadModel() {
  /// hooks
  const { loadGLTF } = useGLTFLoader()
  loadGLTF(scene)
}
</script>

<template>
  <div class="view-container">
    <div ref="refThreeContainer" id="three-container"></div>
  </div>
</template>

<style scoped lang="less">
.view-container {
  width: 320px;
  height: 640px;
  border: 1px solid #000;
}
#three-container {
  width: 100%;
  height: 100%;
}
</style>
