<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ThreeView from '@/views/three-view/three-view.vue'
import CameraDetection from '@/views/camera-detection/camera-detection.vue'
import VideoDetection from '@/views/video-detection/video-detection.vue'

const currentMenu = ref('video')
function changeMenu(menu) {
  currentMenu.value = menu
}
</script>

<template>
  <div class="view-container">
    <CameraDetection v-if="currentMenu === 'camera'" />
    <VideoDetection v-else />
    <ThreeView />
  </div>

  <div class="menus">
    <div class="menu-btn" :class="{current: currentMenu === 'video'}" @click="changeMenu('video')">视频</div>
    <div class="menu-btn" :class="{current: currentMenu === 'camera'}" @click="changeMenu('camera')">摄像头</div>
  </div>
</template>

<style scoped lang="less">
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.menus {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  justify-content: cneter;
  align-items: flex-end;
  .menu-btn {
    width: 100px;
    height: 40px;
    color: #000;
    background-color: #FFF;
    border: 1px solid #ff8500;
    margin: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    &.current {
      background-color: #ff8500;
      color: #fff;
    }
  }
}
</style>
