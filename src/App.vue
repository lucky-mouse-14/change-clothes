<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ThreeView from '@/views/three-view/three-view.vue'
import VideoDetection from '@/views/video-detection/video-detection.vue'
</script>

<template>
  <div class="view-container">
    <VideoDetection />
    <ThreeView />
  </div>
</template>

<style scoped lang="less">
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
