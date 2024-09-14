<template>
  <div class="home">
    <div v-for="page in pages" :key="page.path" class="page-card" @click="toPage(page.path)">
      <div class="page-card__content">{{ page.title }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import pagesRoutes from '@/router/modules/pages.js'

const router = useRouter()

const pages = pagesRoutes.map(v => {
  return {
    name: v.name,
    path: v.path,
    title: v?.meta?.title || '',
  }
})

function toPage(path) {
  router.push(path)
}
</script>

<style lang="less" scoped>
.home {
  background-image: url(@/assets/images/bg.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
}
.page-card {
  width: 220px;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.125);
  background-color: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 6px 6px rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);

  border-radius: 12px;
  margin: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
    backdrop-filter: blur(12px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.6);
  }
}
.page-card__content {
  color: #fff;
}
</style>